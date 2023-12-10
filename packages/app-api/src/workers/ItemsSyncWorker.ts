import { IItemsSyncQueueData, TakaroWorker, queueService } from '@takaro/queues';
import { config } from '../config.js';
import { Job } from 'bullmq';
import { logger } from '@takaro/util';
import { DomainService } from '../service/DomainService.js';
import { GameServerService } from '../service/GameServerService.js';

const log = logger('worker:itemsSync');

export class ItemsSyncWorker extends TakaroWorker<IItemsSyncQueueData> {
  constructor() {
    super(config.get('queues.itemsSync.name'), 1, processJob);
    queueService.queues.itemsSync.queue.add(
      { domainId: 'all' },
      {
        jobId: 'itemsSync',
        repeat: {
          jobId: 'itemsSync',
          every: config.get('queues.itemsSync.interval'),
        },
      }
    );
  }
}

export async function processJob(job: Job<IItemsSyncQueueData>) {
  if (job.data.domainId === 'all') {
    log.info('Processing items sync job for all domains');

    const domainsService = new DomainService();
    const domains = await domainsService.find({});

    for (const domain of domains.results) {
      const gameserverService = new GameServerService(domain.id);
      const gameServers = await gameserverService.find({});
      for (const gs of gameServers.results) {
        await queueService.queues.itemsSync.queue.add(
          { domainId: domain.id, gameServerId: gs.id },
          { jobId: `itemsSync-${domain.id}-${gs.id}-${Date.now()}` }
        );
      }
    }

    return;
  }

  if (job.data.gameServerId) {
    // Processing for a specific game server
    log.info(`Processing items sync job for domain: ${job.data.domainId} and game server: ${job.data.gameServerId}`);
    const gameserverService = new GameServerService(job.data.domainId);
    await gameserverService.syncItems(job.data.gameServerId);

    return;
  }

  log.error(`Invalid job data: ${JSON.stringify(job.data)}`);
}
