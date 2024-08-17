import 'reflect-metadata';

import { HTTP } from '@takaro/http';
import { ctx, errors, logger } from '@takaro/util';
import { DomainController } from './controllers/DomainController.js';
import { Server as HttpServer } from 'http';
import { config } from './config.js';
import { UserController } from './controllers/UserController.js';
import { RoleController } from './controllers/Rolecontroller.js';
import { GameServerController } from './controllers/GameServerController.js';
import { DomainOutputDTO, DomainService } from './service/DomainService.js';
import { GameServerService } from './service/GameServerService.js';
import { FunctionController } from './controllers/FunctionController.js';
import { CronJobController } from './controllers/CronJobController.js';
import { ModuleController } from './controllers/ModuleController.js';
import { EventsWorker } from './workers/eventWorker.js';
import { getSocketServer } from './lib/socketServer.js';
import { HookController } from './controllers/HookController.js';
import { PlayerController } from './controllers/PlayerController.js';
import { SettingsController } from './controllers/SettingsController.js';
import { CommandController } from './controllers/CommandController.js';
import { ModuleService } from './service/ModuleService.js';
import { VariableController } from './controllers/VariableController.js';
import { CronJobService } from './service/CronJobService.js';
import { ExternalAuthController } from './controllers/ExternalAuthController.js';
import { AuthService } from './service/AuthService.js';
import { DiscordController } from './controllers/DiscordController.js';
import { discordBot } from './lib/DiscordBot.js';
import { EventController } from './controllers/EventController.js';
import { HookWorker } from './workers/hookWorker.js';
import { CronJobWorker } from './workers/cronjobWorker.js';
import { CommandWorker } from './workers/commandWorker.js';
import { PlayerOnGameServerController } from './controllers/PlayerOnGameserverController.js';
import { ItemController } from './controllers/ItemController.js';
import { ItemsSyncWorker } from './workers/ItemsSyncWorker.js';
import { PlayerSyncWorker } from './workers/playerSyncWorker.js';
import { CSMMImportWorker } from './workers/csmmImportWorker.js';
import { SteamSyncWorker } from './workers/steamSyncWorker.js';
import { AxiosError } from 'axios';
import { StatsController } from './controllers/StatsController.js';
import { KPIWorker } from './workers/kpiWorker.js';
import { ShopOrderController } from './controllers/Shop/Order.js';
import { ShopListingController } from './controllers/Shop/Listing.js';
import { SystemWorker } from './workers/systemWorker.js';

export const server = new HTTP(
  {
    controllers: [
      DomainController,
      UserController,
      RoleController,
      GameServerController,
      FunctionController,
      CronJobController,
      ModuleController,
      HookController,
      PlayerController,
      SettingsController,
      CommandController,
      VariableController,
      ExternalAuthController,
      DiscordController,
      EventController,
      PlayerOnGameServerController,
      ItemController,
      StatsController,
      ShopListingController,
      ShopOrderController,
    ],
  },
  {
    port: config.get('http.port'),
    allowedOrigins: config.get('http.allowedOrigins'),
  },
);

const log = logger('main');

async function main() {
  log.info('Starting...');

  try {
    config.validate();
    log.info('✅ Config validated');
  } catch (error) {
    if (error instanceof Error) {
      throw new errors.ConfigError(`Config validation failed: ${error.message}`);
    } else {
      throw error;
    }
  }

  const initProviders = await AuthService.initPassport();
  log.info(`🔑 External auth provider(s) initialized: ${initProviders.join(' ')}`);

  if (config.get('takaro.startWorkers')) {
    new EventsWorker();
    log.info('👷 Event worker started');

    new CommandWorker(config.get('queues.commands.concurrency'));
    log.info('👷 Command worker started');

    new CronJobWorker(config.get('queues.cronjobs.concurrency'));
    log.info('👷 CronJob worker started');

    new HookWorker(config.get('queues.hooks.concurrency'));
    log.info('👷 Hook worker started');

    new ItemsSyncWorker();
    log.info('👷 Items sync worker started');

    new PlayerSyncWorker();
    log.info('👷 playerSync worker started');

    new SteamSyncWorker();
    log.info('👷 steamSync worker started');

    new CSMMImportWorker();
    log.info('👷 csmmImport worker started');

    new KPIWorker();
    log.info('👷 kpi worker started');

    new SystemWorker();
    log.info('👷 system worker started');
  }

  await getSocketServer(server.server as HttpServer);
  await server.start();

  log.info('🚀 Server started');

  await discordBot.start();

  const domainService = new DomainService();
  const domains = await domainService.find({});

  const results = await Promise.allSettled(domains.results.map(ctx.wrap('domainInit', domainInit)));
  const rejected = results.map((r) => (r.status === 'rejected' ? r.reason : null)).filter(Boolean);
  if (rejected.length) {
    log.error('Failed to initialize some domains', { errors: rejected });
  }
}

main();

async function domainInit(domain: DomainOutputDTO) {
  ctx.addData({ domain: domain.id });
  log.info('🌱 Seeding database with builtin modules');
  const moduleService = new ModuleService(domain.id);
  await moduleService.seedBuiltinModules();

  log.info('🔌 Starting all game servers');
  const gameServerService = new GameServerService(domain.id);
  const cronjobService = new CronJobService(domain.id);
  const gameServers = await gameServerService.find({});

  await Promise.all(
    gameServers.results.map(async (gameserver) => {
      const installedModules = await gameServerService.getInstalledModules({
        gameserverId: gameserver.id,
      });
      await Promise.all(
        installedModules.map(async (mod) => {
          await cronjobService.syncModuleCronjobs(mod);
        }),
      );
    }),
  );
}

process.on('unhandledRejection', (reason) => {
  if (reason instanceof AxiosError) {
    log.error('Unhandled HTTP client error', {
      url: reason.config?.url,
      status: reason.response?.status,
      statusText: reason.response?.statusText,
      data: JSON.stringify(reason.response?.data),
    });
  } else {
    log.error('Unhandled Rejection at:', { reason: String(reason) });
  }
});

process.on('uncaughtException', (error: Error) => {
  log.error(`Caught exception: ${error}\n Exception origin: ${error.stack}`);
});
