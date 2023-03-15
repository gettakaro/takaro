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
  log;

  constructor() {
    this.vms = [];
    this.log = logger('VMM');
  }
  async sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async createVM() {
    const id = this.vms.length + 1;

    this.log.debug(`creating a new vm with id: ${id}`);

    const fcClient = new FirecrackerClient({
      id,
      logLevel: 'debug',
    });
    await fcClient.spawn();
    await fcClient.startVM();

    // wait for fc to be ready
    while (fcClient.status !== 'ready') {
      if (fcClient.status === 'stopped') {
        throw Error('Failed to create client');
      }

      this.log.debug(fcClient.status);
      await this.sleep(1000);
    }

    this.vms.push(fcClient);

    return fcClient;
  }

  async killVM(id: number) {
    const fcClient = this.vms.at(id + 1);

    this.log.debug(`killing vm with id ${id}`);

    fcClient?.kill();

    this.vms.splice(id - 1, 1);
  }

  async executeFunction(
    fn: string,
    _data: Record<string, unknown>,
    _token: string
  ) {
    const fcClient = await this.createVM();

    const vmClient = new VmClient(fcClient.options.agentSocket, 8000);
    fcClient.status = 'running';
    const response = await vmClient.exec(fn);

    await this.killVM(fcClient.id);

    return response;
  }
}
