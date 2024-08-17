import { HTTP } from '@takaro/http';
import { logger, errors } from '@takaro/util';
import { config } from './config.js';
import { getSocketServer } from './lib/socket/index.js';
import { Server as HttpServer } from 'http';
import { getMockServer } from './lib/gameserver/index.js';

const log = logger('agent');

export const server = new HTTP(
  {},
  {
    port: config.get('http.port'),
    allowedOrigins: config.get('http.allowedOrigins'),
  },
);

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

  getSocketServer(server.server as HttpServer);
  await server.start();
  log.info('🚀 HTTP Server started');

  await getMockServer();
  log.info('🚀 Mock Server started');

  process.on('uncaughtException', (err) => {
    log.error('uncaughtException', err);
  });
}

main();
