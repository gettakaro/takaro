import { TakaroWorker, IConnectorQueueData } from '@takaro/queues';
import { Job } from 'bullmq';
import { ctx, errors, logger } from '@takaro/util';
import { gameServerManager } from './GameServerManager.js';

const log = logger('worker:connector');

export class ConnectorWorker extends TakaroWorker<IConnectorQueueData> {
  constructor() {
    super('connector', 1, processJob);
  }
}

async function processJob(job: Job<IConnectorQueueData>) {
  ctx.addData({
    domain: job.data.domainId,
    gameServer: job.data.gameServerId,
  });

  switch (job.data.operation) {
    case 'create':
      await gameServerManager.add(job.data.domainId, job.data.gameServerId);
      break;
    case 'update':
      await gameServerManager.update(job.data.domainId, job.data.gameServerId);
      break;
    case 'delete':
      await gameServerManager.remove(job.data.gameServerId);
      break;
    default:
      log.error('Unknown operation', job.data);
      throw new errors.InternalServerError();
  }
}
