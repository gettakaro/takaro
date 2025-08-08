import { Job } from 'bullmq';
import { TakaroWorker } from '@takaro/queues';
import { ICronJobData } from './dataDefinitions.js';
import { ctx } from '@takaro/util';
import { config } from '../config.js';
import { executeFunction } from '../executors/executeFunction.js';

export class CronJobWorker extends TakaroWorker<ICronJobData> {
  constructor(concurrency: number) {
    super(config.get('queues.cronjobs.name'), concurrency, processCronJob);
  }
}

async function processCronJob(job: Job<ICronJobData>) {
  ctx.addData({
    domain: job.data.domainId,
    gameServer: job.data.gameServerId,
    jobId: job.id,
  });

  await executeFunction(job.data.functionId, job.data, job.data.domainId);
}
