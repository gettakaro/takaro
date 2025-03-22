import { HTTP } from '@takaro/http';
import { logger, errors } from '@takaro/util';
import { config } from './config.js';
import { getMockServer } from './main.js';

const log = logger('mock-gameserver');

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

  await server.start();
  log.info('🚀 HTTP Server started');

  await getMockServer();
  process.on('uncaughtException', (err) => {
    log.error('uncaughtException', err);
  });
}

main();
