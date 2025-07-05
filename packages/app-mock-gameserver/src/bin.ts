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

  if (
    config.get('mockserver.registrationToken') !== 'default-token' &&
    config.get('mockserver.identityToken') !== 'default-mock'
  ) {
    log.info('✅ Registration and identity tokens provided, will register with the Takaro server');
    await getMockServer();
  } else {
    log.info('❌ No registration and identity tokens provided, will not register with the Takaro server');
  }

  process.on('uncaughtException', (err) => {
    log.error('uncaughtException', err);
  });
}

main();
