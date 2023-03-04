import { Job } from 'bullmq';
import { config } from '../../config';
import { TakaroWorker, IJobData } from '@takaro/queues';
import { executeFunction } from './executeFunction';

export class HookWorker extends TakaroWorker<IJobData> {
  constructor() {
    super(config.get('queues.hooks.name'), processHook);
  }
}

async function processHook(job: Job<IJobData>) {
  await executeFunction(
    job.data.function,
    {
      ...job.data.data,
      gameServerId: job.data.gameServerId,
    },
    job.data.token
  );
}
