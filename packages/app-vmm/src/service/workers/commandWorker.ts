import { Job } from 'bullmq';
import { config } from '../../config.js';
import { TakaroWorker, IJobData } from '@takaro/queues';
import { ctx } from '@takaro/util';
import { executeFunction } from './executeFunction.js';

export class CommandWorker extends TakaroWorker<IJobData> {
  constructor(concurrency: number) {
    super(config.get('queues.commands.name'), concurrency, processCommand);
  }
}

async function processCommand(job: Job<IJobData>) {
  ctx.addData({
    domain: job.data.domainId,
    gameServer: job.data.gameServerId,
    jobId: job.id,
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
