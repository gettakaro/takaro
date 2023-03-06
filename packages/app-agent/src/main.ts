import { HTTP } from '@takaro/http';
import { config } from './config.js';
import { BullBoardRouter } from './controllers/bullboard.js';
import { QueuesService } from '@takaro/queues';
import { CronJobWorker } from './service/workers/cronjobWorker.js';
import { CommandWorker } from './service/workers/commandWorker.js';
import { HookWorker } from './service/workers/hookWorker.js';

export const server = new HTTP(
  {},
  {
    port: config.get('http.port'),
    allowedOrigins: config.get('http.allowedOrigins'),
  }
);

async function main() {
  config.validate();
  server.expressInstance.use('/queues', BullBoardRouter);
  await server.start();

  await QueuesService.getInstance().registerWorker(new CronJobWorker());
  await QueuesService.getInstance().registerWorker(new CommandWorker());
  await QueuesService.getInstance().registerWorker(new HookWorker());
}

main();
