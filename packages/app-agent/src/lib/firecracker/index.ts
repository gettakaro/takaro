import child_process, { ChildProcess } from 'child_process';
import process from 'process';
import fs, { WriteStream } from 'fs';
import { logger } from '@takaro/util';
import got, { Got } from 'got';
import { config } from '../../config.js';
import { randomUUID } from 'crypto';

type FcLogLevel = 'debug' | 'warn' | 'info' | 'error';

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

export default class Firecracker {
  id: string;
  options: FcOptions;
  childProcess: ChildProcess | undefined;
  log;

  private readonly httpSock: Got;

  constructor(args: { logLevel?: FcLogLevel }) {
    this.id = randomUUID();
    this.log = logger('firecracker', { id: this.id });

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

    this.spawn();

    // make sure to clean up on exit
    process.on('SIGINT', () => {
      this.kill();
    });
  }

  public async spawn(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.childProcess = child_process.spawn(this.options.binary, [
        '--api-sock',
        this.options.fcSocket,
        '--log-path',
        this.options.logLevel,
        '--level',
        this.options.logLevel,
        '--show-level',
        '--show-log-origin',
      ]);

      if (this.childProcess !== undefined) {
        this.childProcess.on('spawn', () => {
          this.log.debug('child process spawned');
          return resolve();
        });
        this.childProcess.on('exit', () => {
          this.log.debug('child process exit');
          fs.unlink(this.options.fcSocket, () => {});
        });
        this.childProcess.on('close', () => {
          this.log.debug('child process closing');
          fs.unlink(this.options.fcSocket, () => {});
        });
        this.childProcess.stderr?.on('data', (error) => {
          this.log.error(error);
        });

        this.childProcess.on('error', (e) => {
          this.log.error(e);
          this.kill();
          return reject(e);
        });
      }
    });
  }

  kill(): boolean {
    const isKilled = this.childProcess?.kill() ?? false;

    if (isKilled) {
      this.log.debug('cleaning up sockets');

      this.childProcess = undefined;

      fs.unlink(this.options.fcSocket, () => {});
      fs.unlink(this.options.agentSocket, () => {});
    }

    return isKilled;
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
          guest_mac: '02:FC:00:00:00:05',
          host_dev_name: 'fc-tap0',
        },
      });
    } catch (err) {
      this.log.error('setting up vm failed', err);
    }
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
