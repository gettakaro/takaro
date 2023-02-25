import { Job } from 'bullmq';
import { Client } from '@takaro/apiclient';
import { config } from '../../config';
import { TakaroWorker, IJobData } from '@takaro/queues';
import { executeFunction } from './executeFunction';

export class HookWorker extends TakaroWorker<IJobData> {
  constructor() {
    super(config.get('queues.hooks.name'), processHook);
  }
}

async function processHook(job: Job<IJobData>) {
  const client = new Client({
    auth: {
      token: job.data.token,
    },
    url: config.get('takaro.url'),
  });

  await executeFunction(job.data.function, client);
}
