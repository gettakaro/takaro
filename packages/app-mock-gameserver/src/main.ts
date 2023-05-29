import { HTTP } from '@takaro/http';
import { logger } from '@takaro/util';
import { config } from './config.js';
import { getSocketServer } from './lib/socket/index.js';
import { Server as HttpServer } from 'http';

const log = logger('agent');

export const server = new HTTP(
  {},
  {
    port: config.get('http.port'),
    allowedOrigins: config.get('http.allowedOrigins'),
  }
);

async function main() {
  log.info('Starting...');

  config.validate();
  log.info('✅ Config validated');

  getSocketServer(server.server as HttpServer);
  await server.start();
  log.info('🚀 HTTP Server started');

  process.on('uncaughtException', (err) => {
    log.error('uncaughtException', err);
  });
}

main();
