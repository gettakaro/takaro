import { TakaroWorker, queueService } from '@takaro/queues';
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
import { ISystemJobData, systemTaskDefinitions, SystemTaskType } from './systemWorkerDefinitions.js';

const log = logger(`worker:${config.get('queues.system.name')}`);

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

    if (domains.length === 0) return;

    const tasks = getAllSystemTasks();
    const allJobs = [];

    for (const domain of domains) {
      for (const taskType of tasks) {
        const taskDef = systemTaskDefinitions[taskType];

        if (taskDef.perGameserver) {
          const gameServerService = new GameServerService(domain.id);
          for await (const gs of gameServerService.getIterator()) {
            allJobs.push({
              domainId: domain.id,
              taskType,
              gameServerId: gs.id,
            });
          }
        } else {
          allJobs.push({
            domainId: domain.id,
            taskType,
          });
        }
      }
    }

    const hourInMs = ms('1h');
    const spreadDuration = hourInMs * 0.9; // Use 90% of the hour
    const delayBetweenJobs = allJobs.length > 1 ? Math.floor(spreadDuration / (allJobs.length - 1)) : 0;

    for (let i = 0; i < allJobs.length; i++) {
      const jobConfig = allJobs[i];
      await queueService.queues.system.queue.add(
        { ...jobConfig },
        {
          jobId: `system-${jobConfig.domainId}-${jobConfig.taskType}-${jobConfig.gameServerId || 'domain'}-${Date.now()}`,
          delay: i * delayBetweenJobs,
        },
      );
    }
    return;
  }

  ctx.addData({
    domain: job.data.domainId,
    jobId: job.id,
    gameServer: job.data.gameServerId,
  });

  const logTarget = job.data.gameServerId ? `game server ${job.data.gameServerId}` : `domain ${job.data.domainId}`;

  log.info(`🔧 Executing ${job.data.taskType} for ${logTarget}`);

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
        await ensureCronjobsScheduled(job.data.domainId, job.data.gameServerId);
        break;
      case SystemTaskType.DELETE_GAME_SERVERS:
        await deleteGameServers(job.data.domainId);
        break;
      case SystemTaskType.SYNC_ITEMS:
        await syncItems(job.data.domainId, job.data.gameServerId);
        break;
      case SystemTaskType.SYNC_BANS:
        await syncBans(job.data.domainId, job.data.gameServerId);
        break;
      case SystemTaskType.SYNC_STEAM:
        await syncSteam(job.data.domainId);
        break;
      default:
        log.error(`❌ Unknown task type: ${job.data.taskType}`);
        break;
    }
    log.info(`✅ Completed ${job.data.taskType} for ${logTarget}`);
  } catch (error) {
    log.error(`❌ Error executing ${job.data.taskType} for ${logTarget}`, error);
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

async function ensureCronjobsScheduled(domainId: string, gameServerId?: string) {
  log.info('🕰 Ensuring cronjobs are scheduled');
  const gameServerService = new GameServerService(domainId);
  const cronjobService = new CronJobService(domainId);
  const moduleService = new ModuleService(domainId);

  const processGameServer = async (gsId: string) => {
    const gameserver = await gameServerService.findOne(gsId, false);
    if (!gameserver) return;

    ctx.addData({ gameServer: gsId });
    log.info(`🕰 Processing cronjobs for game server ${gsId}`);
    const installedModules = await moduleService.getInstalledModules({ gameserverId: gsId });
    await Promise.all(installedModules.map((mod) => cronjobService.syncModuleCronjobs(mod)));
  };

  if (gameServerId) {
    await processGameServer(gameServerId);
  } else {
    for await (const gs of gameServerService.getIterator()) {
      await processGameServer(gs.id);
    }
  }
}

async function deleteGameServers(domainId: string) {
  log.info('🗑️ Deleting marked game servers');
  const gameserverService = new GameServerService(domainId);
  const repo = gameserverService.repo;
  const { query } = await repo.getModel();
  await query.whereNotNull('deletedAt').delete();
}

async function syncItems(domainId: string, gameServerId?: string) {
  log.info('🔄 Syncing items');
  const gameServerService = new GameServerService(domainId);

  const processGameServer = async (gsId: string) => {
    ctx.addData({ gameServer: gsId });
    log.info(`🔄 Testing reachability for game server ${gsId}`);

    const reachable = await gameServerService.testReachability(gsId);
    if (reachable.connectable) {
      log.info(`🔄 Syncing items for game server ${gsId}`);
      await gameServerService.syncItems(gsId);
    } else {
      log.info(`⚠️ Game server ${gsId} not reachable, skipping items sync`);
    }
  };

  if (gameServerId) {
    await processGameServer(gameServerId);
  } else {
    for await (const gs of gameServerService.getIterator()) {
      await processGameServer(gs.id);
    }
  }
}

async function syncBans(domainId: string, gameServerId?: string) {
  log.info('🔄 Syncing bans');
  const gameServerService = new GameServerService(domainId);
  const banService = new BanService(domainId);

  const processGameServer = async (gsId: string) => {
    ctx.addData({ gameServer: gsId });
    log.info(`🔄 Testing reachability for game server ${gsId}`);

    const reachable = await gameServerService.testReachability(gsId);
    if (reachable.connectable) {
      log.info(`🔄 Syncing bans for game server ${gsId}`);
      await banService.syncBans(gsId);
    } else {
      log.info(`⚠️ Game server ${gsId} not reachable, skipping bans sync`);
    }
  };

  if (gameServerId) {
    await processGameServer(gameServerId);
  } else {
    for await (const gs of gameServerService.getIterator()) {
      await processGameServer(gs.id);
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
