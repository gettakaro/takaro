import { TakaroWorker } from '@takaro/queues';
import { queueService } from './QueueService.js';
import { config } from '../config.js';
import { Job } from 'bullmq';
import { logger } from '@takaro/util';
import { GameServerService } from '../service/GameServerService.js';
import { PlayerService } from '../service/Player/index.js';
import { DomainRepo } from '../db/domain.js';
import { UserService } from '../service/User/index.js';
import { kpiGateway, metrics } from '../lib/metrics.js';
import { PlayerOnGameServerService } from '../service/PlayerOnGameserverService.js';
import { ModuleService } from '../service/Module/index.js';

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
      },
    );
  }
}

export async function processJob(_job: Job<unknown>) {
  log.debug('Updating KPI metrics');
  const domainRepo = new DomainRepo();

  const domains = await domainRepo.find({});
  metrics.domains.set(domains.total);

  const oneDayAgo = new Date(new Date().valueOf() - 1000 * 60 * 60 * 24).toISOString();
  const oneWeekAgo = new Date(new Date().valueOf() - 1000 * 60 * 60 * 24 * 7).toISOString();
  const oneMonthAgo = new Date(new Date().valueOf() - 1000 * 60 * 60 * 24 * 30).toISOString();

  // For each domain, expose the underlying metrics
  const results = await Promise.all(
    domains.results.map(async (domain) => {
      const domainId = domain.id;
      const gameServerService = new GameServerService(domainId);
      const playerService = new PlayerService(domainId);
      const pogService = new PlayerOnGameServerService(domainId);
      const userService = new UserService(domainId);
      const moduleService = new ModuleService(domainId);

      const gameServers = await gameServerService.find({});
      metrics.gameServers.set({ domain: domainId }, gameServers.total);

      const players = await playerService.find({});
      metrics.players.set({ domain: domainId }, players.total);

      await Promise.all(
        gameServers.results.map(async (gameserver) => {
          const dailyActivePlayers = await pogService.find({
            greaterThan: { lastSeen: oneDayAgo },
            filters: { gameServerId: [gameserver.id] },
          });
          metrics.dap.set({ domain: domainId, gameServer: gameserver.id }, dailyActivePlayers.total);

          const weeklyActivePlayers = await pogService.find({
            greaterThan: { lastSeen: oneWeekAgo },
            filters: { gameServerId: [gameserver.id] },
          });
          metrics.wap.set({ domain: domainId, gameServer: gameserver.id }, weeklyActivePlayers.total);

          const monthlyActivePlayers = await pogService.find({
            greaterThan: { lastSeen: oneMonthAgo },
            filters: { gameServerId: [gameserver.id] },
          });
          metrics.map.set({ domain: domainId, gameServer: gameserver.id }, monthlyActivePlayers.total);

          return {
            gameServer: gameserver.id,
            dailyActivePlayers: dailyActivePlayers.total,
            weeklyActivePlayers: weeklyActivePlayers.total,
            monthlyActivePlayers: monthlyActivePlayers.total,
          };
        }),
      );

      const playerActivityMetrics = await playerService.calculatePlayerActivityMetrics();

      metrics.dap.set({ domain: domainId }, playerActivityMetrics.dau);
      metrics.wap.set({ domain: domainId }, playerActivityMetrics.wau);
      metrics.map.set({ domain: domainId }, playerActivityMetrics.mau);

      const users = await userService.find({});
      metrics.users.set({ domain: domainId }, users.total);

      const dailyActiveUsers = await userService.find({ greaterThan: { lastSeen: oneDayAgo } });
      metrics.dau.set({ domain: domainId }, dailyActiveUsers.total);

      const weeklyActiveUsers = await userService.find({ greaterThan: { lastSeen: oneWeekAgo } });
      metrics.wau.set({ domain: domainId }, weeklyActiveUsers.total);

      const monthlyActiveUsers = await userService.find({ greaterThan: { lastSeen: oneMonthAgo } });
      metrics.mau.set({ domain: domainId }, monthlyActiveUsers.total);

      let domainInstalledModules = 0;

      for (const server of gameServers.results) {
        const installedModules = await moduleService.getInstalledModules({ gameserverId: server.id });
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
    }),
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
    },
  );

  metrics.gameServers.set(totals.gameServers);
  metrics.players.set(totals.players);
  metrics.users.set(totals.users);
  metrics.installedModules.set(totals.installedModules);

  await kpiGateway.pushAdd({ jobName: 'kpi' });
}
