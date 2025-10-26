import { TakaroWorker } from '@takaro/queues';
import { GameEvents, GameEventsMapping } from '@takaro/modules';
import { ValueOf } from 'type-fest';

export interface IConnectorQueueData {
  domainId: string;
  gameServerId: string;
  operation: 'create' | 'update' | 'delete';
}

export interface IEventQueueData extends Record<string, unknown> {
  domainId: string;
  type: ValueOf<typeof GameEvents>;
  gameServerId: string;
  event: ValueOf<(typeof GameEventsMapping)[ValueOf<typeof GameEvents>]>;
}
import { Job } from 'bullmq';
import { ctx, errors, logger } from '@takaro/util';
import { gameServerManager } from './GameServerManager.js';
import { config } from '../config.js';

const log = logger('worker:connector');

export class ConnectorWorker extends TakaroWorker<IConnectorQueueData> {
  constructor() {
    super('connector', config.get('connector.queue.concurrency'), processJob);
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
