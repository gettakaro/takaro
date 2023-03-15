import child_process, { ChildProcess } from 'child_process';
import process from 'process';
import fs, { WriteStream } from 'fs';
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

interface InfoReponse {
  id: string;
  state: string;
  vmm_version: string;
  app_name: string;
}

export default class FirecrackerClient {
  id: number;
  status: FcStatus;
  options: FcOptions;
  childProcess: ChildProcess | undefined;
  log;

  private readonly httpSock: Got;

  constructor(args: { id: number; logLevel?: FcLogLevel }) {
    this.id = args.id;
    this.log = logger('firecracker');

    this.options = {
      binary: config.get('firecracker.binary'),
      kernelImage: config.get('firecracker.kernelImage'),
      rootfs: config.get('firecracker.rootfs'),
      fcSocket: `${config.get('firecracker.sockets')}${this.id}-fc.sock`,
      agentSocket: `${config.get('firecracker.sockets')}${this.id}-agent.sock`,
      logPath: config.get('firecracker.logPath'),
      logLevel: args.logLevel ?? 'info',
    };

    this.httpSock = got.extend({
      prefixUrl: `unix:${this.options.fcSocket}:`,
    });

    // make sure to clean up on exit
    process.on('SIGINT', () => {
      this.kill();
      process.exit(0);
    });
  }

  async spawn(): Promise<void> {
    this.status = 'initializing';

    const dir = '/tmp/takaro/sockets';

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
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

      if (this.childProcess !== undefined) {
        this.childProcess.on('spawn', () => {
          this.log.debug('child process spawned', this.options);
          return resolve();
        });
        this.childProcess.on('exit', () => {
          this.log.debug('child process exit');
          this.kill();
        });
        this.childProcess.on('close', () => {
          this.log.debug('child process closing');
        });
        this.childProcess.stderr?.on('data', (error) => {
          this.log.error(error);
        });

        this.childProcess.on('error', (e) => {
          this.log.error(e);
          return reject(e);
        });
      } else {
        this.log.error('could not spawn child process');
        reject();
      }
    });
  }

  kill() {
    this.log.debug('killing vm');

    this.childProcess?.kill();
    this.childProcess = undefined;

    fs.unlink(this.options.fcSocket, () => {});
    fs.unlink(this.options.agentSocket, () => {});

    this.status = 'stopped';
  }

  async info(): Promise<InfoReponse> {
    return await this.httpSock.get('').json();
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

  async sleep(ms: number) {
    this.log.debug(`sleeping for ${ms}ms`);
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async startVM() {
    try {
      await this.setupVM();

      const responseData = await this.httpSock
        .put('actions', {
          json: {
            action_type: 'InstanceStart',
          },
        })
        .json();

      this.log.info('starting vm instance', responseData);

      // TODO: remove this sleep and actually wait until the VM is ready
      await this.sleep(5_000);

      this.status = 'ready';
      this.log.debug('ready');

      return responseData;
    } catch (err) {
      this.log.error('staring vm failed', err);
    }
  }

  async downloadImage(url: string, destination: string): Promise<void> {
    let file: WriteStream | undefined;

    try {
      file = fs.createWriteStream(destination, { flags: 'wx' });

      if (fs.existsSync(destination)) {
        throw Error('File already exists');
      }

      const response = await got.get(url);

      if (response.statusCode === 200) {
        response.pipe(file);
      }
    } catch (err) {
      throw err;
    } finally {
      file?.close();
      fs.unlink(destination, () => {});
    }
  }
}
