import { HTTP } from '@takaro/http';
import { config } from './config.js';
import { BullBoardRouter } from './controllers/bullboard.js';
import { QueuesService } from '@takaro/queues';
import { CronJobWorker } from './service/workers/cronjobWorker.js';
import { CommandWorker } from './service/workers/commandWorker.js';
import { HookWorker } from './service/workers/hookWorker.js';
import { VMM } from './service/vmm/index.js';

export const server = new HTTP(
  {},
  {
    port: config.get('http.port'),
    allowedOrigins: config.get('http.allowedOrigins'),
  }
);

let vmm: VMM | null = null;

export async function getVMM() {
  if (!vmm) {
    vmm = new VMM();
  }

  return vmm;
}

async function main() {
  getVMM();

  config.validate();
  server.expressInstance.use('/queues', BullBoardRouter);
  await server.start();

  const commandWorker = new CommandWorker();
  commandWorker.concurrency = 1;

  await QueuesService.getInstance().registerWorker(new CronJobWorker());
  await QueuesService.getInstance().registerWorker(commandWorker);
  await QueuesService.getInstance().registerWorker(new HookWorker());
}

main();
