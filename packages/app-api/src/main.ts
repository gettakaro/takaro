import 'reflect-metadata';

import { HTTP } from '@takaro/http';
import { logger } from '@takaro/logger';
import { migrateSystem } from '@takaro/db';
import { DomainController } from './controllers/DomainController';
import { Server as HttpServer } from 'http';
import { config } from './config';
import { UserController } from './controllers/UserController';
import { RoleController } from './controllers/Rolecontroller';
import { GameServerController } from './controllers/GameServerController';
import { DomainService } from './service/DomainService';
import { GameServerService } from './service/GameServerService';
import { FunctionController } from './controllers/FunctionController';
import { CronJobController } from './controllers/CronJobController';
import { ModuleController } from './controllers/ModuleController';
import { EventsWorker } from './workers/eventWorker';
import { QueuesService } from '@takaro/queues';
import { getSocketServer } from './lib/socketServer';
import { HookController } from './controllers/HookController';
import { PlayerController } from './controllers/PlayerController';

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

  log.info('📖 Ensuring database is up to date');
  await migrateSystem();
  log.info('🦾 Database up to date');

  getSocketServer(server.server as HttpServer);
  await server.start();

  log.info('🚀 Server started');

  log.info('🔌 Starting all game servers');

  const domainService = new DomainService();
  const domains = await domainService.find({});

  for (const domain of domains.results) {
    const gameServerService = new GameServerService(domain.id);
    const gameServers = await gameServerService.find({});
    await gameServerService.manager.init(
      gameServers.results.map((g) => ({ ...g, domainId: domain.id }))
    );
  }

  await QueuesService.getInstance().registerWorker(new EventsWorker());
}

main();
