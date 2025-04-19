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
import { BanService } from '../service/Ban/index.js';
import { PlayerService } from '../service/Player/index.js';
import { steamApi } from '../lib/steamApi.js';

const log = logger(`worker:${config.get('queues.system.name')}`);

export enum SystemTaskType {
  SEED_MODULES = 'seedModules',
  CLEAN_EVENTS = 'cleanEvents',
  CLEAN_EXPIRING_VARIABLES = 'cleanExpiringVariables',
  ENSURE_CRONJOBS_SCHEDULED = 'ensureCronjobsScheduled',
  DELETE_GAME_SERVERS = 'deleteGameServers',
  SYNC_ITEMS = 'syncItems',
  SYNC_BANS = 'syncBans',
  SYNC_STEAM = 'syncSteam',
}

export interface ISystemJobData extends IBaseJobData {
  taskType?: SystemTaskType;
}

export function getAllSystemTasks(): SystemTaskType[] {
  return Object.values(SystemTaskType);
}

export class SystemWorker extends TakaroWorker<ISystemJobData> {
  constructor() {
    super(config.get('queues.system.name'), 1, processJob, {
      stalledInterval: ms('10minutes'),
    });

    queueService.queues.system.queue.add(
      { domainId: 'all' },
      {
        jobId: 'system-trigger',
        repeat: {
          jobId: 'system-trigger',
          every: ms('1h'),
        },
      },
    );
  }
}

export async function processJob(job: Job<ISystemJobData>) {
  if (job.data.domainId === 'all') {
    log.info('🔍 Discovering domains and scheduling all system tasks');
    const domainService = new DomainService();

    const domains = [];
    for await (const domain of domainService.getIterator()) {
      domains.push(domain);
    }

    if (domains.length === 0) {
      return;
    }

    const tasks = getAllSystemTasks();
    const allJobs = [];

    // Create a flat list of all domain+task combinations
    for (const domain of domains) {
      for (const taskType of tasks) {
        allJobs.push({
          domainId: domain.id,
          taskType,
        });
      }
    }

    // Calculate the delay between each job to spread across the hour
    const hourInMs = ms('1h');
    const spreadDuration = hourInMs * 0.9; // Use 90% of the hour
    const delayBetweenJobs = allJobs.length > 1 ? Math.floor(spreadDuration / (allJobs.length - 1)) : 0;

    // Schedule all jobs with increasing delays
    for (let i = 0; i < allJobs.length; i++) {
      const job = allJobs[i];
      const delay = i * delayBetweenJobs;

      await queueService.queues.system.queue.add(
        {
          domainId: job.domainId,
          taskType: job.taskType,
        },
        {
          jobId: `system-${job.domainId}-${job.taskType}-${Date.now().toString()}`,
          delay: delay,
        },
      );
    }

    return;
  }

  // Individual task execution
  ctx.addData({
    domain: job.data.domainId,
    jobId: job.id,
  });
  log.info(`🔧 Executing ${job.data.taskType} for domain ${job.data.domainId}`);

  try {
    switch (job.data.taskType) {
      case SystemTaskType.SEED_MODULES:
        await seedModules(job.data.domainId);
        break;
      case SystemTaskType.CLEAN_EVENTS:
        await cleanEvents(job.data.domainId);
        break;
      case SystemTaskType.CLEAN_EXPIRING_VARIABLES:
        await cleanExpiringVariables(job.data.domainId);
        break;
      case SystemTaskType.ENSURE_CRONJOBS_SCHEDULED:
        await ensureCronjobsScheduled(job.data.domainId);
        break;
      case SystemTaskType.DELETE_GAME_SERVERS:
        await deleteGameServers(job.data.domainId);
        break;
      case SystemTaskType.SYNC_ITEMS:
        await syncItems(job.data.domainId);
        break;
      case SystemTaskType.SYNC_BANS:
        await syncBans(job.data.domainId);
        break;
      case SystemTaskType.SYNC_STEAM:
        await syncSteam(job.data.domainId);
        break;
      default:
        log.error(`❌ Unknown task type: ${job.data.taskType}`);
        break;
    }
    log.info(`✅ Completed ${job.data.taskType} for domain ${job.data.domainId}`);
  } catch (error) {
    log.error(`❌ Error executing ${job.data.taskType} for domain ${job.data.domainId}`, error);
    throw error;
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

async function ensureCronjobsScheduled(domainId: string) {
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
  log.info('🗑️ Deleting marked game servers');
  const gameserverService = new GameServerService(domainId);
  const repo = gameserverService.repo;
  const { query } = await repo.getModel();
  await query.whereNotNull('deletedAt').delete();
}

async function syncItems(domainId: string) {
  log.info('🔄 Syncing items for all game servers');
  const gameServerService = new GameServerService(domainId);

  for await (const gameServer of gameServerService.getIterator()) {
    ctx.addData({ gameServer: gameServer.id });
    log.info(`🔄 Testing reachability for game server ${gameServer.id}`);

    const reachable = await gameServerService.testReachability(gameServer.id);
    if (reachable.connectable) {
      log.info(`🔄 Syncing items for game server ${gameServer.id}`);
      await gameServerService.syncItems(gameServer.id);
    } else {
      log.info(`⚠️ Game server ${gameServer.id} not reachable, skipping items sync`);
    }
  }
}

async function syncBans(domainId: string) {
  log.info('🔄 Syncing bans for all game servers');
  const gameServerService = new GameServerService(domainId);
  const banService = new BanService(domainId);

  for await (const gameServer of gameServerService.getIterator()) {
    ctx.addData({ gameServer: gameServer.id });
    log.info(`🔄 Testing reachability for game server ${gameServer.id}`);

    const reachable = await gameServerService.testReachability(gameServer.id);
    if (reachable.connectable) {
      log.info(`🔄 Syncing bans for game server ${gameServer.id}`);
      await banService.syncBans(gameServer.id);
    } else {
      log.info(`⚠️ Game server ${gameServer.id} not reachable, skipping bans sync`);
    }
  }
}

async function syncSteam(domainId: string) {
  log.info('🔄 Syncing Steam data');

  const playerService = new PlayerService(domainId);
  await steamApi.refreshRateLimitedStatus();
  const remainingCalls = await steamApi.getRemainingCalls();

  if (remainingCalls < 10000) {
    log.warn(`⚠️ Less than 10k API calls remaining, skipping Steam sync for domain ${domainId}`);
    return;
  }

  log.info(`🔄 Syncing Steam data for domain ${domainId}`);
  const syncedCount = await playerService.handleSteamSync();
  log.info(`✅ Successfully synced ${syncedCount} players for domain ${domainId}`);
}
