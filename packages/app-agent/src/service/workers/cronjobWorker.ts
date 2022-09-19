import { Job } from 'bullmq';
import { Client } from '@takaro/apiclient';
import { config } from '../../config';
import { TakaroWorker, IJobData } from '@takaro/queues';
import { executeFunction } from './executeFunction';

export class CronJobWorker extends TakaroWorker<IJobData> {
  constructor() {
    super(config.get('queues.cronjobs.name'), processCronJob);
  }
}

async function processCronJob(job: Job<IJobData>) {
  const client = new Client({
    auth: {
      token: job.data.token,
    },
    url: config.get('takaro.url'),
  });

  const functionsToExecuteRes =
    await client.function.functionControllerGetRelated(job.data.itemId);
  const functionsToExecute = functionsToExecuteRes.data.data;

  for (const fn of functionsToExecute) {
    await executeFunction(fn, client);
  }
}
