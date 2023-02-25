import { HTTP } from '@takaro/http';
import { config } from './config';
import { BullBoardRouter } from './controllers/bullboard';
import { QueuesService } from '@takaro/queues';
import { CronJobWorker } from './service/workers/cronjobWorker';
import { CommandWorker } from './service/workers/commandWorker';
import { HookWorker } from './service/workers/hookWorker';

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
