import 'reflect-metadata';

import { HTTP } from '@takaro/http';
import { logger } from '@takaro/util';
import { config } from './config.js';
import { ConnectorService } from './service/ConnectorService.js';

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

  const connectorService = new ConnectorService();

  await connectorService.init();
}

main();
