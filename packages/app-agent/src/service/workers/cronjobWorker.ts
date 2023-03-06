import { Job } from 'bullmq';
import { config } from '../../config.js';
import { TakaroWorker, IJobData } from '@takaro/queues';
import { executeFunction } from './executeFunction.js';

export class CronJobWorker extends TakaroWorker<IJobData> {
  constructor() {
    super(config.get('queues.cronjobs.name'), processCronJob);
  }
}

async function processCronJob(job: Job<IJobData>) {
  await executeFunction(
    job.data.function,
    {
      ...job.data.data,
      gameServerId: job.data.gameServerId,
    },
    job.data.token
  );
}
