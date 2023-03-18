import { HTTP } from '@takaro/http';
import { errors, logger } from '@takaro/util';
import { config } from './config.js';
import { BullBoardRouter } from './controllers/bullboard.js';
import { QueuesService } from '@takaro/queues';
import { CronJobWorker } from './service/workers/cronjobWorker.js';
import { CommandWorker } from './service/workers/commandWorker.js';
import { HookWorker } from './service/workers/hookWorker.js';
import { ory } from '@takaro/auth';

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

  try {
    await ory.init();
    log.info('🔑 Ory initialized');
  } catch (error) {
    log.error('🔑 Ory initialization failed', { error });
    throw new errors.ConfigError('Ory initialization failed');
  }

  server.expressInstance.use('/queues', BullBoardRouter);
  await server.start();
  log.info('🚀 Server started');

  await QueuesService.getInstance().registerWorker(new CronJobWorker());
  await QueuesService.getInstance().registerWorker(new CommandWorker());
  await QueuesService.getInstance().registerWorker(new HookWorker());
}

main();
