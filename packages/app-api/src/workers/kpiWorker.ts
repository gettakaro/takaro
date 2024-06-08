import { TakaroWorker, queueService } from '@takaro/queues';
import { config } from '../config.js';
import { Job } from 'bullmq';
import { logger } from '@takaro/util';
import { GameServerService } from '../service/GameServerService.js';
import { PlayerService } from '../service/PlayerService.js';
import { DomainRepo } from '../db/domain.js';
import { UserService } from '../service/UserService.js';
import { gateway, metrics } from '../lib/metrics.js';

const log = logger('worker:kpi');

export class KPIWorker extends TakaroWorker<unknown> {
  constructor() {
    super(config.get('queues.kpi.name'), config.get('queues.kpi.concurrency'), processJob);
    queueService.queues.kpi.queue.add(
      { domainId: 'all' },
      {
        jobId: 'kpi',
        repeat: {
          jobId: 'kpi',
          every: config.get('queues.kpi.interval'),
        },
      }
    );
  }
}

export async function processJob(_job: Job<unknown>) {
  log.debug('Updating KPI metrics');
  const domainRepo = new DomainRepo();

  const domains = await domainRepo.find({});
  metrics.domains.set(domains.total);

  // For each domain, expose the underlying metrics
  const results = await Promise.all(
    domains.results.map(async (domain) => {
      const domainId = domain.id;
      const gameServerService = new GameServerService(domainId);
      const playerService = new PlayerService(domainId);
      const userService = new UserService(domainId);

      const gameServers = await gameServerService.find({});
      metrics.gameServers.set({ domain: domainId }, gameServers.total);

      const players = await playerService.find({});
      metrics.players.set({ domain: domainId }, players.total);

      const users = await userService.find({});
      metrics.users.set({ domain: domainId }, users.total);

      let domainInstalledModules = 0;

      for (const server of gameServers.results) {
        const installedModules = await gameServerService.getInstalledModules({ gameserverId: server.id });
        metrics.installedModules.set({ domain: domainId, gameServer: server.id }, installedModules.length);
        domainInstalledModules += installedModules.length;
      }

      metrics.installedModules.set({ domain: domainId }, domainInstalledModules);

      return {
        gameServers: gameServers.total,
        players: players.total,
        users: users.total,
        installedModules: domainInstalledModules,
      };
    })
  );

  // Calculate the totals
  const totals = results.reduce(
    (acc, curr) => {
      acc.gameServers += curr.gameServers;
      acc.players += curr.players;
      acc.users += curr.users;
      acc.installedModules += curr.installedModules;
      return acc;
    },
    {
      gameServers: 0,
      players: 0,
      users: 0,
      installedModules: 0,
    }
  );

  metrics.gameServers.set(totals.gameServers);
  metrics.players.set(totals.players);
  metrics.users.set(totals.users);
  metrics.installedModules.set(totals.installedModules);

  await gateway.pushAdd({ jobName: 'playerSync' });
}
