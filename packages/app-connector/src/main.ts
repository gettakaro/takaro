import 'reflect-metadata';

import { HTTP } from '@takaro/http';
import { logger } from '@takaro/util';
import { config } from './config.js';
import { ConnectorWorker } from './lib/worker.js';

export const server = new HTTP(
  {
    controllers: [],
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

  await server.start();
  new ConnectorWorker();

  log.info('🚀 Server started');
}

main();
