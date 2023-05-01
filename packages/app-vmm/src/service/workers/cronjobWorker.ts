import { Job } from 'bullmq';
import { config } from '../../config.js';
import { TakaroWorker, IJobData } from '@takaro/queues';
import { ctx } from '@takaro/util';
import { executeFunction } from './executeFunction.js';

export class CronJobWorker extends TakaroWorker<IJobData> {
  constructor() {
    super(config.get('queues.cronjobs.name'), processCronJob);
  }
}

async function processCronJob(job: Job<IJobData>) {
  ctx.addData({
    domain: job.data.domainId,
    gameServer: job.data.gameServerId,
  });

  await executeFunction(
    job.data.functionId,
    {
      ...job.data.data,
      gameServerId: job.data.gameServerId,
    },
    job.data.domainId
  );
}
