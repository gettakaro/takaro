import { Queue } from 'bullmq';
import { config } from '../../config';
import { QueueEvents } from 'bullmq';
import { logger } from '@takaro/logger';
import { getRedisConnectionOptions } from '../../util/redisConnectionOptions';

const log = logger('queue');

export const functionsQueue = new Queue(config.get('queue.name'), {
  connection: getRedisConnectionOptions(),
});

functionsQueue.add('cars', { color: 'blue' });

const queueEvents = new QueueEvents(config.get('queue.name'), {
  connection: getRedisConnectionOptions(),
});

queueEvents.on('completed', ({ jobId }) => {
  log.info(`Job ${jobId} completed!`);
});

queueEvents.on(
  'failed',
  ({ jobId, failedReason }: { jobId: string; failedReason: string }) => {
    log.error(`Job ${jobId} failed :(`, { failedReason });
  }
);
