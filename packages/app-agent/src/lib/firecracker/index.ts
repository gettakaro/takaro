import os from 'os';
import child_process, { ChildProcess } from 'child_process';
import fs, { WriteStream } from 'fs';
import got, { Got } from 'got';

interface FcOptions {
  binPath: string;
  socketPath: string;
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

  private readonly httpSock: Got;

  constructor(options: FcOptions) {
    this.options = options;
    this.httpSock = got.extend({
      enableUnixSockets: true,
      prefixUrl: `unix:${options.socketPath}:`,
    });

    this.spawn();
    this.setupListeners();
  }

  spawn(): ChildProcess {
    this.child = child_process.spawn(
      this.options.binPath,
      ['--api-sock', this.options.socketPath],
      { detached: true }
    );

    return this.child;
  }

  setupListeners(): void {
    if (this.child !== undefined) {
      this.child.on('exit', () => {
        fs.unlink(this.options.socketPath, () => {});
        this.child = undefined;
      });

      this.child.on('close', () => {
        fs.unlink(this.options.socketPath, () => {});
        this.child = undefined;
      });

      this.child.on('error', () => {
        fs.unlink(this.options.socketPath, () => {});
      });
    }
  }

  kill(): boolean {
    const isKilled = this.child?.kill() ?? false;

    if (isKilled) {
      fs.unlink(this.options.socketPath, () => {});
      this.child = undefined;
    }

    return isKilled;
  }

  async info(): Promise<InfoReponse> {
    return await this.httpSock.get('').json();
  }

  async createVM() {
    await this.httpSock.put('boot-source', {
      json: {
        kernel_image_path: os.tmpdir() + '/hello-vmlinux.bin',
        boot_args: 'console=ttyS0 reboot=k panic=1 pci=off',
      },
    });

    await this.httpSock
      .put('drives/rootfs', {
        json: {
          drive_id: 'rootfs',
          path_on_host: os.tmpdir() + '/hello-rootfs.ext4',
          is_root_device: true,
          is_read_only: false,
        },
      })
      .json();

    return await this.httpSock
      .put('actions', {
        json: {
          action_type: 'InstanceStart',
        },
      })
      .json();
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
