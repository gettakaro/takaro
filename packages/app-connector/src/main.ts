import 'reflect-metadata';

import { HTTP } from '@takaro/http';
import { logger, errors } from '@takaro/util';
import { config } from './config.js';
import { ConnectorWorker } from './lib/worker.js';
import { gameServerManager } from './lib/GameServerManager.js';

export const server = new HTTP(
  {
    controllers: [],
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

  await server.start();
  new ConnectorWorker();
  try {
    await gameServerManager.init();
  } catch (error) {
    log.error('Error initializing game server manager', { error });
    process.exit(1);
  }

  log.info('🚀 Server started');
}

main();
