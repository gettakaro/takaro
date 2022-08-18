import { HTTP } from '@takaro/http';
import { config } from './config';
import { BullBoardRouter } from './controllers/bullboard';
import { worker } from './service/queue/worker';

export const server = new HTTP(
  {},
  { port: config.get('http.port') }
);

async function main() {
  server.expressInstance.use('/queues', BullBoardRouter);

  await server.start();


  worker.resume();

}

main();
