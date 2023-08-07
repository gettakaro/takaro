import { Job } from 'bullmq';
import { TakaroWorker, IHookJobData } from '@takaro/queues';
import { ctx } from '@takaro/util';
import { config } from '../config.js';
import { executeFunction } from '../executors/executeFunction.js';

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
