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

  async initPool(amount = 1) {
    this.log.info('creating a pool of VMs');
    const promises = [];

    for (let i = 0; i < amount; i++) {
      promises.push(this.createVM(i + 1));
    }

    await Promise.all(promises);
  }

  async initPoolSync(amount = 1) {
    this.log.info('creating a pool of VMs');

    for (let i = 0; i < amount; i++) {
      await this.createVM(i + 1);
    }
  }

  async createVM(id: number) {
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

  async getVM() {
    // const hotVM = this.vms.pop();

    const hotVM = this.vms.at(0);

    if (!hotVM) {
      throw new Error('no available VMs');
    }

    return hotVM;
  }

  async executeFunction(
    fn: string,
    data: Record<string, unknown>,
    token: string
  ) {
    let vmId;

    try {
      const fcClient = await this.getVM();

      vmId = fcClient.id;

      const vmClient = new VmClient(fcClient.options.agentSocket, 8000);
      await vmClient.waitUntilHealthy();

      await vmClient.exec(fn, data, token);
    } catch (err) {
      this.log.error(err);
    } finally {
      if (vmId) {
        // this.createVM(vmId);
      }
    }
  }
}

// singleton
let vmm: VMM | undefined;

export async function getVMM() {
  if (!vmm) {
    vmm = new VMM();
  }

  return vmm;
}
