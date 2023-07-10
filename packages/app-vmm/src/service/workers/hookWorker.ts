import { Job } from 'bullmq';
import { config } from '../../config.js';
import { TakaroWorker, IHookJobData } from '@takaro/queues';
import { executeFunction } from './executeFunction.js';
import { ctx } from '@takaro/util';

export class HookWorker extends TakaroWorker<IHookJobData> {
  constructor(concurrency: number) {
    super(config.get('queues.hooks.name'), concurrency, processHook);
  }
}

async function processHook(job: Job<IHookJobData>) {
  ctx.addData({
    domain: job.data.domainId,
    gameServer: job.data.gameServerId,
  });

  await executeFunction(job.data.functionId, job.data, job.data.domainId);
}
