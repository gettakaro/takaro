import FirecrackerClient from '../../lib/firecracker/index.js';
import { VmClient } from '../../lib/vmClient.js';
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
    const id = 1;

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

    await fcClient?.shutdown();

    this.vms.splice(id - 1, 1);
  }

  async executeFunction(
    fn: string,
    data: Record<string, unknown>,
    token: string
  ) {
    let vmId;

    try {
      const fcClient = await this.createVM();
      vmId = fcClient.id;

      const vmClient = new VmClient(fcClient.options.agentSocket, 8000);
      await vmClient.waitUntilHealthy();

      await vmClient.exec(fn, data, token);
    } catch (err) {
      this.log.error(err);
    } finally {
      if (vmId) {
        await this.removeVM(vmId);
      }
    }
  }
}
