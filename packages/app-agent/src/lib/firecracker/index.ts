import { ChildProcess, spawn } from 'child_process';
import process from 'process';
import fsSync from 'node:fs';
import fs from 'node:fs/promises';
import { logger } from '@takaro/util';
import got, { Got } from 'got';
import { config } from '../../config.js';

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

export default class FirecrackerClient {
  private childProcess: ChildProcess;
  private log;

  options: FcOptions;
  id: number;

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
            this.log.debug(`➡️  ${request.method} ${request.url}`, {
              requestBody: request.body,
            });
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
      process.exit(0);
    });
  }

  private async cleanUp() {
    this.log.debug('cleaning up sockets and files');

    try {
      await fs.rm(config.get('firecracker.sockets'), {
        recursive: true,
        force: true,
      });
    } catch (err) {
      this.log.warn('could not remove sockets dir', err);
    }

    try {
      await fs.rm(this.options.logPath, { force: true });
    } catch (err) {
      this.log.warn('could not remove log file', err);
    }
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
      await fs.writeFile(this.options.logPath, '');
    } catch {
      this.log.debug('log file already exists');
    }
  }

  async spawn() {
    await this.ensureResources();

    const cmd = 'firecracker';
    const args = [
      '--api-sock',
      this.options.fcSocket,
      '--log-path',
      this.options.logPath,
      '--level',
      this.options.logLevel,
      '--show-level',
      '--show-log-origin',
    ];

    this.log.debug(`spawning child process with cmd: ${cmd} ${args.join(' ')}`);

    this.childProcess = spawn(cmd, args);

    return new Promise((resolve, reject) => {
      const stderrFileStream = fsSync.createWriteStream(
        `/app/firecracker/${this.id}-stderr.log`
      );
      const stdoutFileStream = fsSync.createWriteStream(
        `/app/firecracker/${this.id}-stdout.log`
      );

      // Redirect stderr output to the file
      this.childProcess.stderr?.pipe(stderrFileStream);
      this.childProcess.stdout?.pipe(stdoutFileStream);

      this.childProcess.on('error', (error) => {
        this.log.error('child process error: ', { error });
        return reject(error);
      });

      this.childProcess.on('exit', (code) => {
        this.log.debug(`child process exited with code ${code}`);
      });

      this.childProcess.on('spawn', async () => {
        this.log.debug('new child process spawned');
        return resolve('success');
      });
    });
  }

  async shutdown() {
    this.log.debug('shutting down vm...');

    await this.httpSock
      .put('actions', {
        json: {
          action_type: 'SendCtrlAltDel',
        },
      })
      .json();

    this.childProcess.kill();

    // wait for childProcess to exit
    await new Promise((resolve, _) => {
      this.childProcess.on('exit', () => {
        resolve('success');
      });
    });

    await this.cleanUp();
  }

  async setupVM() {
    try {
      await this.httpSock.put('boot-source', {
        json: {
          kernel_image_path: this.options.kernelImage,
          boot_args:
            'console=ttyS0 reboot=k panic=1 pci=off quiet noacpi nomodules ip=172.16.0.2::172.16.0.1:255.255.255.0::eth0:off',
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

      await this.httpSock.put('vsock', {
        json: {
          guest_cid: 3,
          uds_path: this.options.agentSocket,
        },
      });

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
    }
  }

  async startVM() {
    try {
      await this.spawn();
      await this.setupVM();

      this.log.info('starting vm instance...');

      await this.httpSock.put('actions', {
        json: {
          action_type: 'InstanceStart',
        },
      });
    } catch (err) {
      this.log.error('staring vm failed', err);
    }
  }
}
