import FirecrackerClient from '../../lib/firecracker/index';
import { VmClient } from '../../lib/vmClient';
import { logger } from '@takaro/util';

/*
 * Virtual Machine Manager
 * Responsible for managing firecracker microVMs
 */
export class VMM {
  vms: Array<FirecrackerClient>;
  log;

  constructor() {
    this.vms = [];
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

    await vmClient.exec(fn, data, token);

    await this.removeVM(fcClient.id);
  }
}
