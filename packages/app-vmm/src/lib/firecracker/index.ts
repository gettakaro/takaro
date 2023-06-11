import { ChildProcess, spawn } from 'child_process';
import process from 'process';
import fsSync from 'node:fs';
import fs from 'node:fs/promises';
import { logger } from '@takaro/util';
import got, { Got } from 'got';
import { config } from '../../config.js';
import { Netmask } from 'netmask';
import promClient from 'prom-client';

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

const IP_PREFIX = '10.231.';
const TAP_DEVICE_CIDR = 30;

export default class FirecrackerClient {
  private childProcess: ChildProcess;
  private log;
  private totalVMsGauge: promClient.Gauge;

  options: FcOptions;
  id: number;
  tapDeviceName: string;
  tapDeviceIp: string;
  vmIp: string;

  private readonly httpSock: Got;

  constructor(args: { id: number; logLevel?: FcLogLevel }) {
    this.totalVMsGauge = promClient.register.getSingleMetric(
      'vm_total'
    ) as promClient.Gauge;

    this.id = args.id;
    this.log = logger(`firecracker(${this.id})`);

    this.tapDeviceName = `fc-tap-${this.id}`;

    this.setIps(this.id);

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
            this.log.debug(`⬅️  ${response.statusCode} ${response.url}`, {
              responseBody: response.body,
            });
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
    process.on('SIGINT', this.handleKillSignal);
    process.on('SIGTERM', this.handleKillSignal);
  }

  private handleKillSignal() {
    this.childProcess?.kill();
    process.exit(0);
  }

  private async cleanUp() {
    this.log.debug('cleaning up sockets and files');

    try {
      await fs.rm(this.options.fcSocket, { force: true });
      await fs.rm(this.options.agentSocket, { force: true });
    } catch (err) {
      this.log.warn('could not remove sockets', err);
    }

    try {
      spawn('ip', ['link', 'del', this.tapDeviceName]);
    } catch {
      this.log.debug(`could not delete ${this.tapDeviceName}`);
    }

    try {
      await fs.rm(this.options.logPath, { force: true });
    } catch (err) {
      this.log.warn('could not remove log file', err);
    }
  }

  private async ensureResources() {
    const tasks = [];

    tasks.push(
      fs.mkdir(config.get('firecracker.sockets'), { recursive: true })
    );
    tasks.push(fs.writeFile(this.options.logPath, ''));

    await Promise.all(tasks);
  }

  private setIps(vmId: number) {
    const ipsPerVM = 4;
    const netIpId = vmId * ipsPerVM;

    const tapDeviceIpId = netIpId + 1;
    const vmIpId = netIpId + 2;

    // Using bitwise operations to calculate the first and second part of the ip
    // Instead of using modulo because it's faster
    const tapFirstIpPart = (tapDeviceIpId & ((2 ** 8 - 1) << 8)) >> 8;
    const tapSecondIpPart = tapDeviceIpId & (2 ** 8 - 1);
    const vmFirstIpPart = (vmIpId & ((2 ** 8 - 1) << 8)) >> 8;
    const vmSecondIpPart = vmIpId & (2 ** 8 - 1);

    this.tapDeviceIp = `${IP_PREFIX}${tapFirstIpPart}.${tapSecondIpPart}`;
    this.vmIp = `${IP_PREFIX}${vmFirstIpPart}.${vmSecondIpPart}`;
  }

  private setupNetwork() {
    spawn('ip', ['tuntap', 'add', 'dev', this.tapDeviceName, 'mode', 'tap']);
    spawn('sysctl', ['-w', `net.ipv4.conf.${this.tapDeviceName}.proxy_arp=1`]);
    spawn('sysctl', [
      '-w',
      `net.ipv6.conf.${this.tapDeviceName}.disable_ipv6=1`,
    ]);

    spawn('ip', [
      'addr',
      'add',
      `${this.tapDeviceIp}/${TAP_DEVICE_CIDR}`,
      'dev',
      this.tapDeviceName,
    ]);
    spawn('ip', ['link', 'set', 'dev', this.tapDeviceName, 'up']);
  }

  async spawn() {
    await this.ensureResources();

    this.setupNetwork();

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

      this.childProcess.on('close', async (code) => {
        this.log.debug(`child process closed with code ${code}`);
        this.totalVMsGauge.dec(1);
        await this.cleanUp();
      });

      this.childProcess.on('error', async (error) => {
        this.log.error('child process error: ', { error });
        return reject(error);
      });

      this.childProcess.on('spawn', async () => {
        this.log.debug('new child process spawned');
        return resolve('success');
      });
    });
  }

  async shutdown() {
    this.log.debug('shutting down vm...');

    try {
      await this.httpSock
        .put('actions', {
          json: {
            action_type: 'SendCtrlAltDel',
          },
        })
        .json();
    } catch (error) {
      this.log.error('could not send ctrl alt del', error);
    }

    this.childProcess.kill();

    // wait for childProcess to exit
    await new Promise((resolve, _) => {
      this.childProcess.on('close', () => {
        resolve('success');
      });
    });
  }

  async setupVM() {
    const mask = new Netmask(`255.255.255.255/${TAP_DEVICE_CIDR}`).mask;
    const ipArgs = `ip=${this.vmIp}::${this.tapDeviceIp}:${mask}::eth0:off`;

    const tasks = [
      this.httpSock.put('boot-source', {
        json: {
          kernel_image_path: this.options.kernelImage,
          boot_args: `console=ttyS0 noapic reboot=k panic=1 pci=off nomodules random.trust_cpu=on i8042.nokbd i8042.noaux ipv6.disable=1 ${ipArgs}`,
        },
      }),
      this.httpSock.put('drives/rootfs', {
        json: {
          drive_id: 'rootfs',
          path_on_host: this.options.rootfs,
          is_root_device: true,
          is_read_only: false,
        },
      }),
      this.httpSock.put('vsock', {
        json: {
          guest_cid: 3,
          uds_path: this.options.agentSocket,
        },
      }),
      this.httpSock.put('network-interfaces/eth0', {
        json: {
          iface_id: 'eth0',
          host_dev_name: this.tapDeviceName,
        },
      }),
    ];

    await Promise.all(tasks);
  }

  async startVM() {
    await this.cleanUp();

    try {
      await this.spawn();
      await this.setupVM();

      this.log.info('starting vm instance...');

      await this.httpSock.put('actions', {
        json: {
          action_type: 'InstanceStart',
        },
      });

      this.totalVMsGauge.inc(1);
    } catch (err) {
      this.log.error('staring vm failed', err);
    }
  }
}
