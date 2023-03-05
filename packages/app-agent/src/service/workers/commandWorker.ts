import { Job } from 'bullmq';
import { config } from '../../config.js';
import { TakaroWorker, IJobData } from '@takaro/queues';
import { executeFunction } from './executeFunction.js';

export class CommandWorker extends TakaroWorker<IJobData> {
  constructor() {
    super(config.get('queues.commands.name'), processCommand);
  }
}

async function processCommand(job: Job<IJobData>) {
  await executeFunction(
    job.data.function,
    {
      ...job.data.data,
      gameServerId: job.data.gameServerId,
    },
    job.data.token
  );
}
