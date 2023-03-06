import { createBullBoard } from '@bull-board/api';
import { ExpressAdapter } from '@bull-board/express';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js';
import { QueuesService } from '@takaro/queues';

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/queues');

const queuesService = QueuesService.getInstance();

const queues = Object.values(queuesService.queues).map(
  (queue) => new BullMQAdapter(queue.queue)
);

createBullBoard({
  queues,
  serverAdapter: serverAdapter,
});

export const BullBoardRouter = serverAdapter.getRouter();
