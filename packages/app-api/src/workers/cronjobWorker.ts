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

  // Check if module is enabled
  if (!job.data.module.systemConfig.enabled) {
    return;
  }

  // Find the cronjob by itemId to get its name
  const cronjob = job.data.module.version.cronJobs.find((cj) => cj.id === job.data.itemId);
  if (!cronjob) {
    // Cronjob not found in module version, skip execution
    return;
  }

  // Check if cronjob is enabled
  if (!job.data.module.systemConfig.cronJobs[cronjob.name].enabled) {
    return;
  }

  await executeFunction(job.data.functionId, job.data, job.data.domainId);
}
