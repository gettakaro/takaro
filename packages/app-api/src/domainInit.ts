import 'reflect-metadata';

import { ctx, logger } from '@takaro/util';
import { CronJobService } from './service/CronJobService.js';
import { DomainOutputDTO, DomainService } from './service/DomainService.js';
import { GameServerService } from './service/GameServerService.js';
import { ModuleService } from './service/ModuleService.js';

const log = logger('domainInit');

export async function domainInit(domain: DomainOutputDTO) {
  ctx.addData({ domain: domain.id });
  log.info('🌱 Seeding database with builtin modules');
  const moduleService = new ModuleService(domain.id);
  await moduleService.seedBuiltinModules();

  log.info('🔌 Starting all game servers');
  const gameServerService = new GameServerService(domain.id);
  const cronjobService = new CronJobService(domain.id);
  const gameServers = await gameServerService.find({});

  await Promise.all(
    gameServers.results.map(async (gameserver) => {
      const installedModules = await gameServerService.getInstalledModules({
        gameserverId: gameserver.id,
      });
      await Promise.all(
        installedModules.map(async (mod) => {
          await cronjobService.syncModuleCronjobs(mod);
        }),
      );
    }),
  );
}

async function main() {
  const domainService = new DomainService();
  const domains = await domainService.find({});

  const results = await Promise.allSettled(domains.results.map(ctx.wrap('domainInit', domainInit)));
  const rejected = results.map((r) => (r.status === 'rejected' ? r.reason : null)).filter(Boolean);
  if (rejected.length) {
    log.error('Failed to initialize some domains', { errors: rejected });
  }

  process.exit(0);
}

main();
