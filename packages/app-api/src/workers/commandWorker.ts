import { Job } from 'bullmq';
import { TakaroWorker } from '@takaro/queues';
import { ICommandJobData } from './dataDefinitions.js';
import { ctx, logger } from '@takaro/util';
import { config } from '../config.js';
import { executeFunction } from '../executors/executeFunction.js';

export class CommandWorker extends TakaroWorker<ICommandJobData> {
  constructor(concurrency: number) {
    super(config.get('queues.commands.name'), concurrency, processCommand);
  }
}

async function processCommand(job: Job<ICommandJobData>) {
  ctx.addData({
    domain: job.data.domainId,
    gameServer: job.data.gameServerId,
    jobId: job.id,
  });

  const log = logger('commandWorker');
  log.debug('processCommand: Picked up command job from queue', {
    commandId: job.data.itemId,
    functionId: job.data.functionId,
    playerId: job.data.player?.id,
    queuedAt: job.timestamp,
    delay: job.opts.delay,
  });

  await executeFunction(job.data.functionId, job.data, job.data.domainId);

  log.debug('processCommand: Command execution completed');
}
