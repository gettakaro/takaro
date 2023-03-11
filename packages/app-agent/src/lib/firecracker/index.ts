import child_process, { ChildProcess } from 'child_process';
import process from 'process';
import fs, { WriteStream } from 'fs';
import { logger } from '@takaro/util';
import got, { Got } from 'got';
import { config } from '../../config.js';
import { randomUUID } from 'crypto';

interface FcOptions {
  binary: string;
  kernelImage: string;
  rootfs: string;
  fcSocket: string;
  agentSocket: string;
}

interface InfoReponse {
  id: string;
  state: string;
  vmm_version: string;
  app_name: string;
}

export default class Firecracker {
  child: ChildProcess | undefined;
  options: FcOptions;
  logger;

  private readonly httpSock: Got;

  constructor() {
    this.logger = logger('firecracker');
    this.options = {
      agentSocket: config.get('firecracker.agentSocket') + randomUUID(),
      binary: config.get('firecracker.binary'),
      fcSocket: '/tmp/takaro/firecracker.socket' + randomUUID(),
      kernelImage: config.get('firecracker.kernelImage'),
      rootfs: config.get('firecracker.rootfs'),
    };
    this.httpSock = got.extend({
      prefixUrl: `unix:${this.options.fcSocket}:`,
    });

    // this.spawn();
    // this.setupListeners();

    // make sure to clean up on exit
    process.on('SIGINT', () => {
      this.kill();
    });
  }

  public async spawn(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.logger.debug('spawning child process');

      this.logger.debug(
        `binary: ${this.options.binary}; fcSocket: ${this.options.fcSocket}; rootfs: ${this.options.rootfs}; agentSocket: ${this.options.agentSocket}`
      );

      this.child = child_process.spawn(this.options.binary, [
        '--api-sock',
        this.options.fcSocket,
        // '--log-path',
        // '/home/branco/dev/takaro/logs.fifo',
        // '--level',
        // 'Debug',
        // '--show-level',
        // '--show-log-origin',
      ]);

      if (this.child !== undefined) {
        this.child.on('spawn', () => {
          this.logger.debug('child process spawned');
          return resolve();
        });
        this.child.on('exit', () => {
          this.logger.debug('child process exit');
          fs.unlink(this.options.fcSocket, () => {});
        });
        this.child.on('close', () => {
          this.logger.debug('child process close');
          fs.unlink(this.options.fcSocket, () => {});
        });
        this.child.on('message', (msg) => {
          this.logger.debug('child message', msg);
        });
        this.child.stdout?.on('data', (data) => {
          this.logger.debug(data);
        });
        this.child.stderr?.on('data', (error) => {
          this.logger.error(error);
        });
        // test

        this.child.on('error', (e) => {
          this.logger.error(e);
          // fs.unlink(this.options.fcSocket, () => {});
          return reject(e);
        });
      }
    });
  }

  kill(): boolean {
    const isKilled = this.child?.kill() ?? false;

    if (isKilled) {
      this.logger.debug('cleaning up sockets');

      this.child = undefined;

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
      this.logger.debug('adding boot source');

      await this.httpSock.put('boot-source', {
        json: {
          kernel_image_path: this.options.kernelImage,
          boot_args:
            'ro console=ttyS0 noapic reboot=k panic=1 pci=off nomodules quiet random.trust_cpu=on',
        },
      });

      this.logger.debug('adding rootfs');

      await this.httpSock.put('drives/rootfs', {
        json: {
          drive_id: 'rootfs',
          path_on_host: this.options.rootfs,
          is_root_device: true,
          is_read_only: false,
        },
      });

      this.logger.debug('setting up vsock');

      await this.httpSock.put('vsock', {
        json: {
          guest_cid: 3,
          uds_path: this.options.agentSocket,
        },
      });

      this.logger.debug('setting up network');
      await this.httpSock.put('network-interfaces/eth0', {
        json: {
          iface_id: 'eth0',
          guest_mac: '02:FC:00:00:00:05',
          host_dev_name: 'fc-tap0',
        },
      });
    } catch (err) {
      this.logger.error('setting up vm failed', err);
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

      this.logger.info('starting vm instance', responseData);

      return responseData;
    } catch (err) {
      this.logger.error('staring vm failed', err);
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
