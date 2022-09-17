import { Job } from 'bullmq';
import { logger } from '@takaro/logger';
import { config, EXECUTION_MODE } from '../../config';
import { ContainerdService } from '../containerd';
import { TakaroWorker, IJobData } from '@takaro/queues';

const log = logger('worker:cron');

export class CronJobWorker extends TakaroWorker<IJobData> {
  constructor() {
    super(config.get('queues.cronjobs.name'), processCronJob);
  }
}

async function processCronJob(data: Job<IJobData>) {
  console.log(data);

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
}
