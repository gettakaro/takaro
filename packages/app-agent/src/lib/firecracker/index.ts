import child_process, { ChildProcess } from 'child_process';
import process from 'process';
import fs from 'node:fs/promises';
import { logger, ctx, sleep } from '@takaro/util';
import got, { Got, RequestError } from 'got';
import { config } from '../../config.js';

type FcLogLevel = 'debug' | 'warn' | 'info' | 'error';

type FcStatus = 'initializing' | 'ready' | 'running' | 'stopped';

// type VmState = 'Not started' | 'Pause' | 'Running';

// interface FcInfoResponse {
//   app_name: string;
//   id: string;
//   state: VmState;
//   vmm_version: string;
// }

interface FcOptions {
  binary: string;
  kernelImage: string;
  rootfs: string;
  fcSocket: string;
  agentSocket: string;
  logPath: string;
  logLevel: FcLogLevel;
}

export default class FirecrackerClient {
  id: number;
  status: FcStatus;
  options: FcOptions;
  childProcess: ChildProcess;
  log;

  private readonly httpSock: Got;

  constructor(args: { id: number; logLevel?: FcLogLevel }) {
    this.id = args.id;
    this.log = logger(`firecracker(${this.id})`);

    ctx.addData({ vmId: this.id });

    this.options = {
      binary: config.get('firecracker.binary'),
      kernelImage: config.get('firecracker.kernelImage'),
      rootfs: config.get('firecracker.rootfs'),
      fcSocket: `${config.get('firecracker.sockets')}${this.id}-fc.sock`,
      agentSocket: `${config.get('firecracker.sockets')}${this.id}-agent.sock`,
      logPath: `${config.get('firecracker.logPath')}${this.id}-logs.fifo`,
      logLevel: args.logLevel ?? 'info',
    };

    this.httpSock = got.extend({
      prefixUrl: `unix:${this.options.fcSocket}:`,
      enableUnixSockets: true,
      hooks: {
        beforeRequest: [
          (request) => {
            this.log.debug(`➡️  ${request.method} ${request.url}`);
          },
        ],
        afterResponse: [
          (response) => {
            this.log.debug(`⬅️  ${response.statusCode} ${response.url}`);
            return response;
          },
        ],
        beforeError: [
          (error) => {
            this.log.error(`❌ ${error.options.method} ${error.options.url}`, {
              response: error.response?.body,
            });
            return error;
          },
        ],
      },
    });

    this.log.debug('constructor', this.options);

    // make sure to clean up on exit
    process.on('SIGINT', () => {
      this.kill();
      process.exit(0);
    });
  }

  async spawn() {
    this.status = 'initializing';

    try {
      await this.cleanUp();
    } catch {}

    try {
      await fs.mkdir(config.get('firecracker.sockets'), { recursive: true });
    } catch {
      this.log.debug('sockets folder already exists');
    }

    try {
      await fs.writeFile(this.options.logPath, '');
    } catch (err) {
      this.log.error(err);
      this.log.debug('log file already exists');
    }

    this.childProcess = child_process.spawn(this.options.binary, [
      '--api-sock',
      this.options.fcSocket,
      '--log-path',
      this.options.logPath,
      '--level',
      this.options.logLevel,
      '--show-level',
      '--show-log-origin',
    ]);

    return new Promise((resolve, reject) => {
      if (this.childProcess === undefined) {
        const errMessage = 'Could not create child process';

        this.log.error(errMessage);

        return reject(errMessage);
      }

      // this.childProcess.on('error', (err) => {
      //   this.log.error(err);
      // });

      // this.childProcess.stdout?.on('data', (data) => {
      //   this.log.debug('childProcess', { data: data.toString() });
      // });

      // this.childProcess.stderr?.on('data', (data) => {
      //   this.log.error('childProcess', { data: data.toString() });
      // });

      // this.childProcess.stderr?.on('error', (data) => {
      //   this.log.error('childProcess', { data: data.toString() });
      // });

      this.childProcess.on('exit', (code) => {
        this.log.debug(`child process exited with code ${code}`);
      });

      this.childProcess.on('spawn', async () => {
        this.log.debug('new child process spawned');
        return resolve('success');
      });
    });
  }

  private async waitForFile(filePath: string) {
    let stats;

    // TODO: break after a few seconds..
    while (!stats) {
      try {
        stats = await fs.stat(filePath);
        await sleep(5);
      } catch {}
    }
  }

  async cleanUp() {
    this.log.debug('cleaning up sockets / files');

    await fs.unlink(this.options.fcSocket);
    await fs.unlink(this.options.agentSocket);
    await fs.unlink(this.options.logPath);
  }

  async shutdown() {
    this.log.debug('shutting down vm...');

    return await this.httpSock
      .put('actions', {
        json: {
          action_type: 'SendCtrlAltDel',
        },
      })
      .json();
  }

  async kill() {
    this.log.debug('killing vm');

    await this.shutdown();

    await new Promise((resolve, _) => {
      this.childProcess.on('exit', () => {
        resolve('success');
      });
    });

    await this.cleanUp();
  }

  async setupVM() {
    try {
      this.log.debug('adding boot source');

      await this.httpSock.put('boot-source', {
        json: {
          kernel_image_path: this.options.kernelImage,
          boot_args:
            'ro console=ttyS0 noapic reboot=k panic=1 pci=off nomodules quiet random.trust_cpu=on',
        },
      });

      this.log.debug('adding rootfs');

      await this.httpSock.put('drives/rootfs', {
        json: {
          drive_id: 'rootfs',
          path_on_host: this.options.rootfs,
          is_root_device: true,
          is_read_only: false,
        },
      });

      this.log.debug('setting up vsock');

      await this.httpSock.put('vsock', {
        json: {
          guest_cid: 3,
          uds_path: this.options.agentSocket,
        },
      });

      this.log.debug('setting up network');

      await this.httpSock
        .put('network-interfaces/eth0', {
          json: {
            iface_id: 'eth0',
            guest_mac: `02:FC:00:00:${Math.floor(this.id / 256)
              .toString()
              .padStart(2, '0')}:${Math.floor(this.id % 256)
              .toString()
              .padStart(2, '0')}`,
            host_dev_name: `fc-${this.id}-tap0`,
          },
        })
        .json();
    } catch (err) {
      if (err instanceof RequestError) {
        this.log.error('request: setting up vm failed', err.response);
      }

      this.log.error('setting up vm failed', err);

      this.kill();
    }
  }

  async startVM() {
    try {
      await this.spawn();
      await this.setupVM();
      this.log.debug('setup done');

      this.log.info('starting vm instance');

      await this.httpSock.put('actions', {
        json: {
          action_type: 'InstanceStart',
        },
      });

      // let vmState: VmState = 'Not started';
      //
      // while (vmState !== 'Running') {
      //   try {
      //     const info: FcInfoResponse = await this.httpSock.get('').json();
      //     vmState = info.state;
      //     this.log.debug(`vmState: ${vmState}`);
      //     await sleep(1);
      //   } catch (err) {
      //     this.log.error(err);
      //   }
      // }
    } catch (err) {
      this.log.error('staring vm failed', err);
      this.kill();
    }
  }
}
