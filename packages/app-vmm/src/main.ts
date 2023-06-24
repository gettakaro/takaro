import { HTTP } from '@takaro/http';
import { logger } from '@takaro/util';
import { config } from './config.js';
import { CronJobWorker } from './service/workers/cronjobWorker.js';
import { CommandWorker } from './service/workers/commandWorker.js';
import { HookWorker } from './service/workers/hookWorker.js';
import { getVMM } from './service/vmm/index.js';

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

  if (config.get('functions.executionMode') === 'firecracker') {
    const vmm = await getVMM();
    const poolSize =
      config.get('queues.commands.concurrency') +
      config.get('queues.cronjobs.concurrency') +
      config.get('queues.hooks.concurrency');
    vmm.initPool(poolSize);
  }

  await server.start();
  log.info('🚀 Server started');

  new CommandWorker(config.get('queues.commands.concurrency'));
  new CronJobWorker(config.get('queues.cronjobs.concurrency'));
  new HookWorker(config.get('queues.hooks.concurrency'));
}

process.on('uncaughtException', (err) => {
  log.error('uncaughtException', err);
});

main();
