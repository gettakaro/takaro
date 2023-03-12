import { Job } from 'bullmq';
import { config } from '../../config.js';
import { TakaroWorker, IJobData } from '@takaro/queues';
import { executeFunction } from './executeFunction.js';
import { ctx } from '@takaro/util';

export class HookWorker extends TakaroWorker<IJobData> {
  constructor() {
    super(config.get('queues.hooks.name'), processHook);
  }
}

async function processHook(job: Job<IJobData>) {
  ctx.addData({
    fnType: 'hook',
    domain: job.data.domainId,
    gameServer: job.data.gameServerId,
  });

  await executeFunction(
    job.data.function,
    {
      ...job.data.data,
      gameServerId: job.data.gameServerId,
    },
    job.data.token
  );
}
