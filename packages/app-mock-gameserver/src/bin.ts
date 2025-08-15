import { HTTP } from '@takaro/http';
import { logger, errors, health } from '@takaro/util';
import { config } from './config.js';
import { getMockServer } from './main.js';
import { GameServer } from './lib/ws-gameserver/gameserver.js';

const log = logger('mock-gameserver');

let gameServerInstance: GameServer | null = null;

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

    // Retry connection with exponential backoff
    const maxRetries = 30; // Max 30 attempts (about 15 minutes with exponential backoff)
    let retryDelay = 5000; // Start with 5 seconds
    const maxDelay = 60000; // Max 60 seconds between retries
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        gameServerInstance = await getMockServer();
        log.info('✅ Successfully connected to Takaro server');
        break;
      } catch (error) {
        attempt++;
        const errorMessage = error instanceof Error ? error.message : String(error);

        if (errorMessage.includes('ECONNREFUSED')) {
          log.warn(
            `⚠️  Cannot connect to Takaro server (attempt ${attempt}/${maxRetries}). The connector service might not be ready yet.`,
          );
          log.warn(`   Retrying in ${retryDelay / 1000} seconds...`);

          if (attempt < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
            // Exponential backoff with jitter
            retryDelay = Math.min(retryDelay * 1.5 + Math.random() * 1000, maxDelay);
          } else {
            log.error(
              "❌ Failed to connect to Takaro server after maximum retries. The mock server will continue running but won't be registered.",
            );
            log.error('   Please ensure the connector service is running and accessible.');
          }
        } else {
          // For non-connection errors, don't retry
          log.error('❌ Failed to register with Takaro server:', errorMessage);
          throw error;
        }
      }
    }
  } else {
    log.info('❌ No registration and identity tokens provided, will not register with the Takaro server');
  }

  // Register health check hook
  health.registerHook('takaro-connection', () => {
    if (!gameServerInstance) {
      // No game server instance yet
      return false;
    }
    return gameServerInstance.isConnectedToTakaro();
  });

  process.on('uncaughtException', (err) => {
    log.error('uncaughtException', err);
  });
}

main();
