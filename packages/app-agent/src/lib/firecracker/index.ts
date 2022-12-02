import child_process, { ChildProcess } from 'child_process';
import fs, { WriteStream } from 'fs';
import { logger } from '@takaro/util';
import got, { Got } from 'got';

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

  constructor(options: FcOptions) {
    this.logger = logger('firecracker');
    this.options = options;
    this.httpSock = got.extend({
      enableUnixSockets: true,
      prefixUrl: `unix:${options.fcSocket}:`,
    });

    this.spawn();
    this.setupListeners();

    // make sure to clean up on exit
    process.on('SIGINT', () => {
      this.kill();
    });
  }

  spawn(): ChildProcess {
    this.logger.debug('spawning child process');

    this.child = child_process.spawn(
      this.options.binary,
      [
        '--api-sock',
        this.options.fcSocket,
        '--log-path',
        'logs.fifo',
        '--level',
        'Debug',
        '--show-level',
        '--show-log-origin',
      ],
      { detached: true }
    );

    return this.child;
  }

  setupListeners(): void {
    if (this.child !== undefined) {
      this.child.on('exit', () => {
        fs.unlink(this.options.fcSocket, () => {});
        this.child = undefined;
      });

      this.child.on('close', () => {
        fs.unlink(this.options.fcSocket, () => {});
        this.child = undefined;
      });

      this.child.on('error', () => {
        fs.unlink(this.options.fcSocket, () => {});
      });
    }
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

  async createVM() {
    try {
      this.logger.debug('adding boot source');

      await this.httpSock.put('boot-source', {
        json: {
          kernel_image_path: this.options.kernelImage,
          boot_args: 'console=ttyS0 reboot=k panic=1 pci=off',
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

      this.logger.debug('setting up logger');

      const responseData = await this.httpSock
        .put('actions', {
          json: {
            action_type: 'InstanceStart',
          },
        })
        .json();

      this.logger.info('started vm instance', responseData);

      return responseData;
    } catch (err) {
      this.logger.error('creating vm instance', err);
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
