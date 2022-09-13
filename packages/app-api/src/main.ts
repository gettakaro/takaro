import 'reflect-metadata';

import { HTTP } from '@takaro/http';
import { logger } from '@takaro/logger';
import { migrateSystem } from '@takaro/db';
import { DomainController } from './controllers/DomainController';
import { config } from './config';
import { UserController } from './controllers/UserController';
import { RoleController } from './controllers/Rolecontroller';
import { GameServerController } from './controllers/GameServerController';
import { DomainService } from './service/DomainService';
import { GameServerService } from './service/GameServerService';

export const server = new HTTP(
  {
    controllers: [
      DomainController,
      UserController,
      RoleController,
      GameServerController,
    ],
  },
  { port: config.get('http.port') }
);

const log = logger('main');

async function main() {
  log.info('Starting...');
  config.validate();
  log.info('✅ Config validated');

  log.info('📖 Ensuring database is up to date');
  await migrateSystem();
  log.info('🦾 Database up to date');

  await server.start();

  log.info('🚀 Server started');

  log.info('🔌 Starting all game servers');

  const domainService = new DomainService();
  const domains = await domainService.find({});

  for (const domain of domains) {
    const gameServerService = new GameServerService(domain.id);
    const gameServers = await gameServerService.find({});
    await gameServerService.manager.init(gameServers);
  }
}

main();
