import { IGameServerQueueData, TakaroWorker, queueService } from '@takaro/queues';
import { config } from '../config.js';
import { Job } from 'bullmq';
import { logger } from '@takaro/util';
import { DomainService } from '../service/DomainService.js';
import { GameServerService } from '../service/GameServerService.js';

const log = logger('worker:inventory');

export class InventoryWorker extends TakaroWorker<IGameServerQueueData> {
  constructor() {
    super(config.get('queues.inventory.name'), config.get('queues.inventory.concurrency'), processJob);
    queueService.queues.inventory.queue.add(
      { domainId: 'all' },
      {
        jobId: 'inventory',
        repeat: {
          jobId: 'inventory',
          every: config.get('queues.inventory.interval'),
        },
      }
    );
  }
}

export async function processJob(job: Job<IGameServerQueueData>) {
  if (job.data.domainId === 'all') {
    log.info('Processing inventory job for all domains');

    const domainsService = new DomainService();
    const domains = await domainsService.find({});

    for (const domain of domains.results) {
      const gameserverService = new GameServerService(domain.id);
      const gameServers = await gameserverService.find({});
      for (const gs of gameServers.results) {
        await queueService.queues.inventory.queue.add(
          { domainId: domain.id, gameServerId: gs.id },
          { jobId: `inventory-${domain.id}-${gs.id}-${Date.now()}` }
        );
      }
    }

    return;
  }

  if (job.data.gameServerId) {
    const gameserverService = new GameServerService(job.data.domainId);

    // Processing for a specific game server
    log.info(`Processing inventory job for domain: ${job.data.domainId} and game server: ${job.data.gameServerId}`);
    await gameserverService.syncInventories(job.data.gameServerId);
    return;
  }

  log.error(`Invalid job data: ${JSON.stringify(job.data)}`);
}
