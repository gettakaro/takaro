import { IGameServerQueueData, TakaroWorker, queueService } from '@takaro/queues';
import { config } from '../config.js';
import { Job } from 'bullmq';
import { logger, ctx } from '@takaro/util';
import { DomainService } from '../service/DomainService.js';
import { PlayerService } from '../service/PlayerService.js';
import { steamApi } from '../lib/steamApi.js';

const log = logger('worker:steamSync');

export class SteamSyncWorker extends TakaroWorker<IGameServerQueueData> {
  constructor() {
    super(config.get('queues.steamSync.name'), 1, processJob);
    queueService.queues.steamSync.queue.add(
      { domainId: 'all' },
      {
        jobId: 'steamSync',
        repeat: {
          jobId: 'steamSync',
          every: config.get('queues.steamSync.interval'),
        },
      },
    );
  }
}

export async function processJob(job: Job<IGameServerQueueData>) {
  ctx.addData({
    domain: job.data.domainId,
    jobId: job.id,
  });

  if (job.data.domainId === 'all') {
    log.info('Processing steamSync job for all domains');

    await steamApi.refreshRateLimitedStatus();

    const remainingCalls = await steamApi.getRemainingCalls();
    if (remainingCalls < 10000) {
      log.warn('Less than 10k calls remaining, skipping job so realtime updates are not affected');
      return;
    }

    const domainsService = new DomainService();
    const domains = await domainsService.find({});

    const promises = [];

    for (const domain of domains.results) {
      const playerService = new PlayerService(domain.id);
      promises.push(playerService.handleSteamSync());
    }

    const res = await Promise.allSettled(promises);

    for (const r of res) {
      if (r.status === 'rejected') {
        log.error(r.reason);
        await job.log(r.reason);
      }

      if (r.status === 'fulfilled') {
        await job.log(`Synced ${r.value.toString()} players`);
      }
    }

    if (res.some((r) => r.status === 'rejected')) {
      throw new Error('Some promises failed');
    }

    return;
  }

  log.error(`Invalid job data: ${JSON.stringify(job.data)}`);
}
