import Firecracker from '../../lib/firecracker/index.js';
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
  hotPool: Array<Firecracker>;
  runningPool: Array<Firecracker>;
  log;

  constructor(options: VMMOptions) {
    this.hotPool = [];
    this.runningPool = [];
    this.options = options;
    this.log = logger('VMM');
  }

  async initPool() {
    this.log.debug(`setting up a hot pool of ${this.options.hotPoolSize}`);

    for (let i = 0; i < this.options.hotPoolSize; i++) {
      this.addVM();
    }
  }

  async sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async addVM() {
    const firecracker = new Firecracker({ logLevel: 'debug' });
    await firecracker.startVM();

    // wait for fc to be ready
    while (firecracker.status !== 'ready') {
      this.log.debug(firecracker.status);
      await this.sleep(1000);
    }

    this.log.debug('pushing to hotPool', firecracker.id);

    this.hotPool.push(firecracker);
  }

  async getVM() {
    let firecracker;

    // wait for a fc instance to be free
    while (!firecracker) {
      // firecracker = this.hotPool.pop();
      firecracker = this.hotPool.at(0);
      await this.sleep(20);
    }

    return firecracker;
  }

  async executeFunction(
    fn: string,
    _data: Record<string, unknown>,
    _token: string
  ) {
    this.log.debug('getting vm');
    const firecracker = await this.getVM();
    this.log.debug('got vm', firecracker.status);
    // this.runningPool.push(firecracker);

    const vmClient = new VmClient(firecracker.options.agentSocket, 8000);
    firecracker.status = 'running';
    const response = await vmClient.exec(fn);

    return response;
  }
}
