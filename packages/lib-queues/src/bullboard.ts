import { createBullBoard } from '@bull-board/api';
import { ExpressAdapter } from '@bull-board/express';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js';
import { TakaroQueue } from './TakaroQueue.js';

export function getBullBoard(queues: TakaroQueue<any>[] = []) {
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/queues');

  const adapters = queues.map((queue) => new BullMQAdapter(queue.bullQueue));

  createBullBoard({
    queues: adapters,
    serverAdapter: serverAdapter,
  });

  return serverAdapter.getRouter();
}
