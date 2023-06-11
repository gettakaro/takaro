import FirecrackerClient from '../../lib/firecracker/index.js';
import { VmClient } from '../../lib/vmClient.js';
import { logger } from '@takaro/util';
import promClient from 'prom-client';
import fs from 'node:fs/promises';
import { config } from '../../config.js';

/*
 * Virtual Machine Manager
 * Responsible for managing firecracker microVMs
 */
export class VMM {
  log = logger('VMM');

  hotVMs: Array<FirecrackerClient> = [];
  runningVMS: Array<number> = [];

  runningGauge = new promClient.Gauge({
    name: 'vm_running',
    help: 'Number of running VMs',
  });
  poolGauge = new promClient.Gauge({
    name: 'vm_pool',
    help: 'Number of VMs in the pool',
  });

  private async cleanSocketsDir() {
    try {
      await fs.rmdir(config.get('firecracker.sockets'), { recursive: true });
    } catch (err) {
      this.log.warn(err);
    }
  }

  async initPool(amount = 15, sync = false) {
    await this.cleanSocketsDir();

    this.log.info(`creating a pool of ${amount} VMs`);

    if (sync) {
      for (let i = 1; i <= amount; i++) {
        await this.createVM(i);
      }
      return;
    }

    const promises = [];

    for (let i = 1; i <= amount; i++) {
      promises.push(this.createVM(i));
    }

    await Promise.all(promises);
  }

  async createVM(id: number) {
    let vm;

    try {
      vm = new FirecrackerClient({
        id,
        logLevel: 'debug',
      });
      await vm.startVM();
    } catch (err) {
      throw err;
    }

    this.hotVMs.push(vm);
    this.poolGauge.set(this.hotVMs.length);

    return vm;
  }

  async getVM() {
    const hotVM = this.hotVMs.pop();
    this.poolGauge.set(this.hotVMs.length);

    if (!hotVM) {
      throw new Error('no available VMs');
    }

    return hotVM;
  }

  // Pops a VM from the pool, executes the function, then pushes the VM back
  async executeFunction(
    fn: string,
    data: Record<string, unknown>,
    token: string
  ) {
    let vm;

    try {
      // Pop a free VM from the pool
      vm = await this.getVM();
      this.runningGauge.inc(1);

      // Wait until the VM is healthy
      const vmClient = new VmClient(vm.options.agentSocket, 8000);
      await vmClient.waitUntilHealthy();

      // Execute the function
      await vmClient.exec(fn, data, token);
      this.runningGauge.dec(1);
    } catch (err) {
      this.log.error(err);
      throw err;
    } finally {
      if (vm) {
        // Destroy the VM
        await vm.shutdown();

        // Create a new VM to replace the one we just destroyed
        await this.createVM(vm.id);
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
