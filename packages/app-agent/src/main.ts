import { HTTP } from '@takaro/http';
import { logger } from '@takaro/util';
import { config } from './config';
import { BullBoardRouter } from './controllers/bullboard';
import { QueuesService } from '@takaro/queues';
import { CronJobWorker } from './service/workers/cronjobWorker';
import { CommandWorker } from './service/workers/commandWorker';
import { HookWorker } from './service/workers/hookWorker';
import { VMM } from './service/vmm/index';

const log = logger('agent');

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
  log.info('Starting...');
  await getVMM();

  config.validate();
  log.info('✅ Config validated');

  server.expressInstance.use('/queues', BullBoardRouter);
  await server.start();
  log.info('🚀 Server started');

  await QueuesService.getInstance().registerWorker(new CronJobWorker());
  await QueuesService.getInstance().registerWorker(new CommandWorker());
  await QueuesService.getInstance().registerWorker(new HookWorker());
}

process.on('uncaughtException', (err) => {
  log.error('uncaughtException', err);
});

main();
