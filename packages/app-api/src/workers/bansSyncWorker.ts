import { IGameServerQueueData, TakaroWorker, queueService } from '@takaro/queues';
import { config } from '../config.js';
import { Job } from 'bullmq';
import { DomainService } from '../service/DomainService.js';
import { GameServerService } from '../service/GameServerService.js';
import { ctx, logger } from '@takaro/util';
import ms from 'ms';

const log = logger('worker:bansSync');

export class BansSyncWorker extends TakaroWorker<IGameServerQueueData> {
  constructor() {
    super(config.get('queues.bansSync.name'), 1, processJob, {
      stalledInterval: ms('10minutes'),
    });
    queueService.queues.bansSync.queue.add(
      { domainId: 'all' },
      {
        jobId: 'bansSync',
        repeat: {
          jobId: 'bansSync',
          every: config.get('queues.bansSync.interval'),
        },
      },
    );
  }
}

export async function processJob(job: Job<IGameServerQueueData>) {
  ctx.addData({
    domain: job.data.domainId,
    gameServer: job.data.gameServerId,
    jobId: job.id,
  });

  if (job.data.domainId === 'all') {
    log.info('Processing bans sync job for all domains');

    const domainsService = new DomainService();
    const domains = await domainsService.find({});

    for (const domain of domains.results) {
      const gameserverService = new GameServerService(domain.id);
      const gameServers = await gameserverService.find({});

      const promises = gameServers.results.map(async (gs) => {
        const reachable = await gameserverService.testReachability(gs.id);

        if (reachable.connectable) {
          await queueService.queues.bansSync.queue.add(
            { domainId: domain.id, gameServerId: gs.id },
            { jobId: `bansSync-${domain.id}-${gs.id}-${Date.now()}` },
          );
        }
      });

      await Promise.all(promises);
    }

    return;
  }

  if (job.data.gameServerId) {
    // Processing for a specific game server
    log.info(`Processing bans sync job for domain: ${job.data.domainId} and game server: ${job.data.gameServerId}`);
    const gameserverService = new GameServerService(job.data.domainId);
    await gameserverService.syncBans(job.data.gameServerId);

    return;
  }

  log.error(`Invalid job data: ${JSON.stringify(job.data)}`);
}
