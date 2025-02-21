import { IBaseJobData, TakaroWorker, queueService } from '@takaro/queues';
import { ctx, logger } from '@takaro/util';
import { config } from '../config.js';
import { Job } from 'bullmq';
import ms from 'ms';
import { EventService } from '../service/EventService.js';
import { VariablesService } from '../service/VariablesService.js';
import { DomainService } from '../service/DomainService.js';
import { ModuleService } from '../service/Module/index.js';
import { GameServerService } from '../service/GameServerService.js';
import { CronJobService } from '../service/CronJobService.js';

const log = logger(`worker:${config.get('queues.system.name')}`);
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
    const domainService = new DomainService();

    await seedModules('takaro-system');

    for await (const domain of domainService.getIterator()) {
      await queueService.queues.system.queue.add(
        { domainId: domain.id },
        {
          jobId: `system-${domain.id.toString()}-${Date.now().toString()}`,
        },
      );
    }
  } else if (job.name === 'gameServerDelete') {
    await deleteGameServers(job.data.domainId);
  } else {
    ctx.addData({ domain: job.data.domainId });
    log.info('🧹 Running system tasks for domain');
    await cleanEvents(job.data.domainId);
    await cleanExpiringVariables(job.data.domainId);
    await ensureCronjobsAreScheduled(job.data.domainId);
    await deleteGameServers(job.data.domainId);
  }
}

async function cleanEvents(domainId: string) {
  log.info('🧹 Cleaning old events');
  const eventService = new EventService(domainId);
  const domain = await new DomainService().findOne(domainId);
  if (!domain) throw new Error('Domain not found');
  const now = Date.now();
  const deleteAfter = new Date(now - domain.eventRetentionDays * 24 * 60 * 60 * 1000);
  await eventService.deleteOldEvents(deleteAfter.toISOString());
}

async function cleanExpiringVariables(domainId: string) {
  log.info('🧹 Cleaning expiring variables');
  const variableService = new VariablesService(domainId);
  await variableService.cleanExpiringVariables();
}

async function seedModules(domainId: string) {
  log.info('🌱 Seeding database with builtin modules');
  const moduleService = new ModuleService(domainId);
  await moduleService.seedBuiltinModules();
}

async function ensureCronjobsAreScheduled(domainId: string) {
  log.info('🕰 Ensuring cronjobs are scheduled');
  const gameServerService = new GameServerService(domainId);
  const cronjobService = new CronJobService(domainId);
  const moduleService = new ModuleService(domainId);

  for await (const gameserver of gameServerService.getIterator()) {
    ctx.addData({ gameServer: gameserver.id });
    const installedModules = await moduleService.getInstalledModules({
      gameserverId: gameserver.id,
    });
    await Promise.all(
      installedModules.map(async (mod) => {
        await cronjobService.syncModuleCronjobs(mod);
      }),
    );
  }
}

async function deleteGameServers(domainId: string) {
  const gameserverService = new GameServerService(domainId);
  const repo = gameserverService.repo;
  const { query } = await repo.getModel();
  await query.whereNotNull('deletedAt').delete();
}
