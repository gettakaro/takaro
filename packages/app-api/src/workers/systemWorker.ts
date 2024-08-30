import { IBaseJobData, TakaroWorker, queueService } from '@takaro/queues';
import { config } from '../config.js';
import { Job } from 'bullmq';
import { DomainRepo } from '../db/domain.js';
import ms from 'ms';
import { EventService } from '../service/EventService.js';
import { VariablesService } from '../service/VariablesService.js';

export class SystemWorker extends TakaroWorker<IBaseJobData> {
  constructor() {
    super(config.get('queues.system.name'), 1, processJob);

    queueService.queues.system.queue.add(
      { domainId: 'all' },
      {
        jobId: 'system',
        repeat: {
          jobId: 'system',
          every: ms('1h'),
        },
      },
    );
  }
}

export async function processJob(job: Job<IBaseJobData>) {
  if (job.data.domainId === 'all') {
    const domainRepo = new DomainRepo();
    const domains = await domainRepo.find({});
    for (const domain of domains.results) {
      await queueService.queues.system.queue.add(
        { domainId: domain.id },
        {
          jobId: `system-${domain.id.toString()}-${Date.now().toString()}`,
        },
      );
    }
  } else {
    await cleanEvents(job.data.domainId);
    await cleanExpiringVariables(job.data.domainId);
  }
}

async function cleanEvents(domainId: string) {
  const eventService = new EventService(domainId);
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  await eventService.deleteOldEvents(thirtyDaysAgo.toISOString());
}

async function cleanExpiringVariables(domainId: string) {
  const variableService = new VariablesService(domainId);
  await variableService.cleanExpiringVariables();
}
