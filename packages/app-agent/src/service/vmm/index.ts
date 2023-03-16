import FirecrackerClient from '../../lib/firecracker/index.js';
import { VmClient } from '../../lib/vmClient.js';
import { logger } from '@takaro/util';

interface VMMOptions {
  hotPoolSize: number;
}

/*
 * Virtual Machine Manager
 * Responsible for managing firecracker microVMs
 */
export class VMM {
  options: VMMOptions;
  vms: Array<FirecrackerClient>;
  counter;
  log;

  constructor() {
    this.vms = [];
    this.counter = 0;
    this.log = logger('VMM');
  }

  async createVM() {
    const id = this.vms.length + 1;

    this.log.debug(`creating a new vm with id: ${id}`);

    const fcClient = new FirecrackerClient({
      id,
      logLevel: 'debug',
    });
    await fcClient.startVM();

    this.vms.push(fcClient);

    return fcClient;
  }

  async removeVM(id: number) {
    const fcClient = this.vms.at(id - 1);

    this.log.debug(`killing vm with id ${id}`);

    await fcClient?.kill();

    this.vms.splice(id - 1, 1);

    this.log.debug('current list of running vms', { vms: this.vms });
  }

  async executeFunction(
    fn: string,
    data: Record<string, unknown>,
    token: string
  ) {
    const fcClient = await this.createVM();
    const vmClient = new VmClient(fcClient.options.agentSocket, 8000);

    await vmClient.waitUntilHealthy();

    this.log.debug('vm created');

    fcClient.status = 'running';

    const cmdOutput = await vmClient.exec(fn, data, token);

    this.log.debug('function output', { cmdOutput });

    await this.removeVM(fcClient.id);
  }
}
