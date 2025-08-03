import 'reflect-metadata';

import { randomUUID } from 'crypto';
import { getBullBoard, queueService } from '@takaro/queues';
import { getAdminBasicAuth, HTTP } from '@takaro/http';
import { errors, logger } from '@takaro/util';
import { DomainController } from './controllers/DomainController.js';
import { Server as HttpServer } from 'http';
import { config } from './config.js';
import { UserController } from './controllers/UserController.js';
import { RoleController } from './controllers/Rolecontroller.js';
import { GameServerController } from './controllers/GameServerController.js';
import { FunctionController } from './controllers/FunctionController.js';
import { CronJobController } from './controllers/CronJobController.js';
import { EventsWorker } from './workers/eventWorker.js';
import { getSocketServer } from './lib/socketServer.js';
import { HookController } from './controllers/HookController.js';
import { PlayerController } from './controllers/PlayerController.js';
import { SettingsController } from './controllers/SettingsController.js';
import { CommandController } from './controllers/CommandController.js';
import { VariableController } from './controllers/VariableController.js';
import { DiscordController } from './controllers/DiscordController.js';
import { discordBot } from './lib/DiscordBot.js';
import { EventController } from './controllers/EventController.js';
import { HookWorker } from './workers/hookWorker.js';
import { CronJobWorker } from './workers/cronjobWorker.js';
import { CommandWorker } from './workers/commandWorker.js';
import { PlayerOnGameServerController } from './controllers/PlayerOnGameserverController.js';
import { ItemController } from './controllers/ItemController.js';
import { EntityController } from './controllers/EntityController.js';
import { PlayerSyncWorker } from './workers/playerSyncWorker.js';
import { CSMMImportWorker } from './workers/csmmImportWorker.js';
import { AxiosError } from 'axios';
import { StatsController } from './controllers/StatsController.js';
import { KPIWorker } from './workers/kpiWorker.js';
import { ShopOrderController } from './controllers/Shop/Order.js';
import { ShopListingController } from './controllers/Shop/Listing.js';
import { ShopCategoryController } from './controllers/Shop/Category.js';
import { SystemWorker } from './workers/systemWorker.js';
import { BanController } from './controllers/BanController.js';
import { ModuleController } from './controllers/Module/modules.js';
import { ModuleVersionController } from './controllers/Module/versions.js';
import { ModuleInstallationsController } from './controllers/Module/installations.js';
import { TrackingController } from './controllers/TrackingController.js';

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
      ModuleVersionController,
      ModuleInstallationsController,
      HookController,
      PlayerController,
      SettingsController,
      CommandController,
      VariableController,
      DiscordController,
      EventController,
      PlayerOnGameServerController,
      ItemController,
      EntityController,
      StatsController,
      ShopListingController,
      ShopOrderController,
      ShopCategoryController,
      BanController,
      TrackingController,
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

  // External auth providers are now handled by Ory Kratos
  log.info(`🔑 External auth handled by Ory Kratos`);

  if (config.get('takaro.startWorkers')) {
    new EventsWorker();
    log.info('👷 Event worker started');

    new CommandWorker(config.get('queues.commands.concurrency'));
    log.info('👷 Command worker started');

    new CronJobWorker(config.get('queues.cronjobs.concurrency'));
    log.info('👷 CronJob worker started');

    new HookWorker(config.get('queues.hooks.concurrency'));
    log.info('👷 Hook worker started');

    new PlayerSyncWorker();
    log.info('👷 playerSync worker started');

    new CSMMImportWorker();
    log.info('👷 csmmImport worker started');

    new KPIWorker();
    log.info('👷 kpi worker started');

    new SystemWorker();
    log.info('👷 system worker started');
  }

  await getSocketServer(server.server as HttpServer);
  server.expressInstance.use('/queues', getAdminBasicAuth(config.get('adminClientSecret')), getBullBoard());

  await server.start();

  log.info('🚀 Server started');

  await discordBot.start();
}

main();

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

/**
 * Nodemon sends a SIGUSR2 signal when it restarts the process
 * So we know we're in localdev -> so reload the modules
 */
process.on('SIGUSR2', async () => {
  console.log('Adding job to reload modules');
  await queueService.queues.system.queue.add({ domainId: 'all' }, { jobId: randomUUID(), delay: 1000 });
  process.exit(0);
});
