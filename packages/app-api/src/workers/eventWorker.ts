import { Job } from 'bullmq';
import { logger } from '@takaro/logger';
import { config } from '../config';
import { TakaroWorker, IEventQueueData } from '@takaro/queues';
import { getSocketServer } from '../lib/socketServer';

export class EventsWorker extends TakaroWorker<IEventQueueData> {
  constructor() {
    super(config.get('queues.events.name'), processJob);
  }
}

async function processJob(job: Job<IEventQueueData>) {
  const log = logger('worker:events');

  log.info('Processing an event', job.data);

  const socketServer = getSocketServer();

  socketServer.emit(job.data.domainId, 'gameEvent', [
    job.data.type,
    job.data.data,
  ]);
}
