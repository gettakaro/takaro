import { HTTP } from '@takaro/http';
import { logger } from '@takaro/util';
import { config } from './config.js';
import { CronJobWorker } from './service/workers/cronjobWorker.js';
import { CommandWorker } from './service/workers/commandWorker.js';
import { HookWorker } from './service/workers/hookWorker.js';
import { VMM } from './service/vmm/index.js';

const log = logger('agent');

export const server = new HTTP(
  {},
  {
    port: config.get('http.port'),
    allowedOrigins: config.get('http.allowedOrigins'),
  }
);

// singleton
let vmm: VMM | undefined;

export async function getVMM() {
  if (!vmm) {
    vmm = new VMM();
  }

  return vmm;
}

async function main() {
  log.info('Starting...');

  const vmm = await getVMM();
  await vmm.initPoolSync();

  config.validate();
  log.info('✅ Config validated');

  await server.start();
  log.info('🚀 Server started');

  new CommandWorker();
  new CronJobWorker();
  new HookWorker();
}

process.on('uncaughtException', (err) => {
  log.error('uncaughtException', err);
});

main();
