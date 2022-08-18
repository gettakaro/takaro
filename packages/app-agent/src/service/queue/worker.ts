import { Worker } from 'bullmq';
import { logger } from '@takaro/logger';
import { config } from '../../config';
import { getRedisConnectionOptions } from '../../util/redisConnectionOptions';

const log = logger('worker');

export const worker = new Worker(
  config.get('queue.name'),
  async (job) => {
    console.log('hierrrrrrrrrrrrrrrrrrrrrrrrrrr', job);
  },
  { connection: getRedisConnectionOptions() }
);

worker.on('error', (err) => {
  // log the error
  log.error(err);
});
