import child_process, { ChildProcess } from 'child_process';
import process from 'process';
import fs from 'node:fs/promises';
import { logger } from '@takaro/util';
import got, { Got } from 'got';
import { config } from '../../config.js';

type FcLogLevel = 'debug' | 'warn' | 'info' | 'error';

type FcStatus = 'initializing' | 'ready' | 'running' | 'stopped';

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

    // make sure to clean up on exit
    process.on('SIGINT', () => {
      this.kill();
      process.exit(0);
    });
  }

  private async cleanUp() {
    this.log.debug('cleaning up sockets and files');

    await fs.unlink(this.options.fcSocket);
    await fs.unlink(this.options.agentSocket);
    await fs.unlink(this.options.logPath);
  }

  private async ensureResources() {
    try {
      await this.cleanUp();
    } catch {}

    try {
      await fs.mkdir(config.get('firecracker.sockets'), { recursive: true });
    } catch {
      this.log.debug('sockets folder already exists');
    }

    try {
      await fs.rm(this.options.logPath, { force: true });
      await fs.writeFile(this.options.logPath, '');
    } catch (error) {
      this.log.warn(`Error while creating log file: ${error}`);
    }
  }

  async spawn() {
    this.status = 'initializing';

    await this.ensureResources();

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

      this.childProcess.on('exit', (code) => {
        this.log.debug(`child process exited with code ${code}`);
      });

      this.childProcess.on('error', (err) => {
        this.log.error(`child process error: ${err.message}`);
      });

      this.childProcess.stderr?.on('data', (data) => {
        console.log(`stderr: ${data}`);
      });

      this.childProcess.stdout?.on('data', (data) => {
        console.log(`stdout: ${data}`);
      });

      this.childProcess.on('spawn', async () => {
        this.log.debug('new child process spawned');
        return resolve('success');
      });
    });
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

    await this.cleanUp();

    await new Promise((resolve, _) => {
      this.childProcess.on('exit', () => {
        resolve('success');
      });
    });
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

      await this.httpSock.put('network-interfaces/eth0', {
        json: {
          iface_id: 'eth0',
          guest_mac: `02:FC:00:00:${Math.floor(this.id / 256)
            .toString()
            .padStart(2, '0')}:${Math.floor(this.id % 256)
            .toString()
            .padStart(2, '0')}`,
          host_dev_name: `fc-${this.id}-tap0`,
        },
      });
    } catch (err) {
      this.log.error('setting up vm failed', err);
      this.kill();
    }
  }

  async startVM() {
    try {
      await this.spawn();
      await this.setupVM();

      this.log.debug('setup done');

      this.log.info('starting vm instance...');

      const instanceStartRes = await this.httpSock.put('actions', {
        json: {
          action_type: 'InstanceStart',
        },
      });

      console.log('INSTANCE START');
      console.log('INSTANCE START');
      console.log('INSTANCE START');
      console.log('INSTANCE START');
      console.log('INSTANCE START');
      console.log('INSTANCE START');
      console.log('INSTANCE START');
      console.log('INSTANCE START');
      console.log('INSTANCE START');
      console.log(instanceStartRes.body);
    } catch (err) {
      this.log.error('starting vm failed', err);
      this.kill();
    }
  }
}
