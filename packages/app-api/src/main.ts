import 'reflect-metadata';

import { HTTP } from '@takaro/http';
import { ctx, errors, logger } from '@takaro/util';
import { migrate } from '@takaro/db';
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
    ],
  },
  {
    port: config.get('http.port'),
    allowedOrigins: config.get('http.allowedOrigins'),
  }
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

  log.info('📖 Running database migrations');
  await migrate();

  log.info('🦾 Database up to date');

  const initProviders = await AuthService.initPassport();
  log.info(`🔑 External auth provider(s) initialized: ${initProviders.join(' ')}`);

  new EventsWorker();
  log.info('👷 Event worker started');

  await getSocketServer(server.server as HttpServer);
  await server.start();

  log.info('🚀 Server started');

  await discordBot.start();

  const domainService = new DomainService();
  const domains = await domainService.find({});

  await Promise.all(domains.results.map(ctx.wrap('domainInit', domainInit)));
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
        })
      );
    })
  );
}
