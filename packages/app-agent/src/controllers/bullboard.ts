import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { functionsQueue } from '../service/queue';

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/queues');

createBullBoard({
  queues: [new BullMQAdapter(functionsQueue)],
  serverAdapter: serverAdapter,
});

export const BullBoardRouter = serverAdapter.getRouter();
