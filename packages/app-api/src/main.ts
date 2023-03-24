import 'reflect-metadata';

import { HTTP } from '@takaro/http';
import { logger } from '@takaro/util';
import { migrate } from '@takaro/db';
import { DomainController } from './controllers/DomainController.js';
import { Server as HttpServer } from 'http';
import { config } from './config.js';
import { UserController } from './controllers/UserController.js';
import { RoleController } from './controllers/Rolecontroller.js';
import { GameServerController } from './controllers/GameServerController.js';
import { DomainService } from './service/DomainService.js';
import { GameServerService } from './service/GameServerService.js';
import { FunctionController } from './controllers/FunctionController.js';
import { CronJobController } from './controllers/CronJobController.js';
import { ModuleController } from './controllers/ModuleController.js';
import { EventsWorker } from './workers/eventWorker.js';
import { QueuesService } from '@takaro/queues';
import { getSocketServer } from './lib/socketServer.js';
import { HookController } from './controllers/HookController.js';
import { PlayerController } from './controllers/PlayerController.js';
import { SettingsController } from './controllers/SettingsController.js';
import { CommandController } from './controllers/CommandController.js';
import { ModuleService } from './service/ModuleService.js';
import { VariableController } from './controllers/VariableController.js';

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
  config.validate();
  log.info('✅ Config validated');

  log.info('📖 Running database migrations');
  await migrate();

  log.info('🦾 Database up to date');

  getSocketServer(server.server as HttpServer);
  await server.start();

  log.info('🚀 Server started');

  const domainService = new DomainService();
  const domains = await domainService.find({});

  for (const domain of domains.results) {
    log.info('🌱 Seeding database with builtin modules');
    const moduleService = new ModuleService(domain.id);
    await moduleService.seedBuiltinModules();

    log.info('🔌 Starting all game servers');
    const gameServerService = new GameServerService(domain.id);
    const gameServers = await gameServerService.find({});

    // GameService.find() does not decrypt the connectioninfo
    const gameServersDecrypted = await Promise.all(
      gameServers.results.map(async (gameserver) => {
        const gs = await gameServerService.findOne(gameserver.id);
        return gs;
      })
    );

    await gameServerService.manager.init(domain.id, gameServersDecrypted);
  }

  await QueuesService.getInstance().registerWorker(new EventsWorker());
}

main();
