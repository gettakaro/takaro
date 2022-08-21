import { Worker } from 'bullmq';
import { logger } from '@takaro/logger';
import { config, EXECUTION_MODE } from '../../config';
import { getRedisConnectionOptions } from '../../util/redisConnectionOptions';
import { ContainerdService } from '../containerd';

const log = logger('worker');

export const worker = new Worker(
  config.get('queue.name'),
  async () => {
    if (config.get('functions.executionMode') === EXECUTION_MODE.LOCAL) {
      log.info('Running function locally');
      return;
    }

    const containerd = new ContainerdService();
    await containerd.pullImage('hello-world');
    const images = await containerd.listImages();
    log.info(images);

    const output = await containerd.runContainer({ image: 'hello-world' });
    log.info(output);
  },
  { connection: getRedisConnectionOptions() }
);

worker.on('error', (err) => {
  // log the error
  log.error(err);
});
