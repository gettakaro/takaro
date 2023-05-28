import FirecrackerClient from '../../lib/firecracker/index.js';
import { VmClient } from '../../lib/vmClient.js';
import { logger } from '@takaro/util';

/*
 * Virtual Machine Manager
 * Responsible for managing firecracker microVMs
 */
export class VMM {
  hotVMs: Array<FirecrackerClient> = [];
  vmCount = 0;
  log = logger('VMM');

  async initPool(amount = 15, sync = false) {
    this.log.info(`creating a pool of ${amount} VMs`);

    if (sync) {
      for (let i = 0; i < amount; i++) {
        await this.createVM();
      }
      return;
    }

    const promises = [];

    for (let i = 0; i < amount; i++) {
      promises.push(this.createVM());
    }

    await Promise.all(promises);
  }

  async createVM() {
    this.vmCount++;

    this.log.debug(`creating a new vm with id: ${this.vmCount}`);

    let vm;

    try {
      vm = new FirecrackerClient({
        id: this.vmCount,
        logLevel: 'debug',
      });
      await vm.startVM();
    } catch (err) {
      this.vmCount--;
      throw err;
    }

    this.hotVMs.push(vm);

    return vm;
  }

  async getVM() {
    const hotVM = this.hotVMs.pop();

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
    let vm;

    try {
      this.log.debug(`current count ${this.vmCount}}`);

      // Pop a free VM from the pool
      vm = await this.getVM();

      // Wait until the VM is healthy
      const vmClient = new VmClient(vm.options.agentSocket, 8000);
      await vmClient.waitUntilHealthy();

      // Execute the function
      await vmClient.exec(fn, data, token);
    } catch (err) {
      this.log.error(err);
    } finally {
      if (vm) {
        // Destroy the VM & decrease the global VM count
        await vm.shutdown();
        this.vmCount--;

        // Create a new VM to replace the one we just destroyed
        await this.createVM();
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
