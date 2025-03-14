import { createBullBoard } from '@bull-board/api';
import { ExpressAdapter } from '@bull-board/express';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js';
import { queueService } from './QueueService.js';
import { TakaroQueue } from './TakaroQueue.js';

export function getBullBoard() {
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/queues');

  const queues = Object.values(queueService.queues).map((queue) => new BullMQAdapter(queue.queue.bullQueue));
  const reconcilerQueue = new TakaroQueue<Record<string, unknown>>('domainReconciler');
  createBullBoard({
    queues: [...queues, new BullMQAdapter(reconcilerQueue.bullQueue)],
    serverAdapter: serverAdapter,
  });

  return serverAdapter.getRouter();
}
