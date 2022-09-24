import { HTTP } from '@takaro/http';
import { config } from './config';
import { BullBoardRouter } from './controllers/bullboard';
import { QueuesService } from '@takaro/queues';
import { CronJobWorker } from './service/workers/cronjobWorker';

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
}

main();
