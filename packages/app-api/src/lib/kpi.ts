/**
 * The goal of this file is to expose business metrics to track the overall health/growth of the application.
 */

import { Gauge } from 'prom-client';
import { DomainRepo } from '../db/domain.js';
import { GameServerService } from '../service/GameServerService.js';
import { PlayerService } from '../service/PlayerService.js';
import { UserService } from '../service/UserService.js';
import { config } from '../config.js';
import { addCounter } from '@takaro/util';

class KPI {
  private gauges: Record<string, Gauge> = {
    domains: new Gauge({
      name: 'takaro_domains',
      help: 'Number of domains',
    }),

    gameServers: new Gauge({
      name: 'takaro_gameServers',
      help: 'Number of gameServers',
      labelNames: ['domain'],
    }),

    players: new Gauge({
      name: 'takaro_players',
      help: 'Number of players',
      labelNames: ['domain'],
    }),

    users: new Gauge({
      name: 'takaro_users',
      help: 'Number of users',
      labelNames: ['domain'],
    }),

    installedModules: new Gauge({
      name: 'takaro_installedModules',
      help: 'Number of installedModules',
      labelNames: ['domain', 'gameServer'],
    }),
  };

  private interval: NodeJS.Timeout;

  async start() {
    this.interval = setInterval(
      addCounter(
        async () => {
          const domainRepo = new DomainRepo();

          const domains = await domainRepo.find({});
          this.gauges.domains.set(domains.total);

          // For each domain, expose the underlying metrics
          const results = await Promise.all(
            domains.results.map(async (domain) => {
              const domainId = domain.id;
              const gameServerService = new GameServerService(domainId);
              const playerService = new PlayerService(domainId);
              const userService = new UserService(domainId);

              const gameServers = await gameServerService.find({});
              this.gauges.gameServers.set({ domain: domainId }, gameServers.total);

              const players = await playerService.find({});
              this.gauges.players.set({ domain: domainId }, players.total);

              const users = await userService.find({});
              this.gauges.users.set({ domain: domainId }, users.total);

              let domainInstalledModules = 0;

              for (const server of gameServers.results) {
                const installedModules = await gameServerService.getInstalledModules({ gameserverId: server.id });
                this.gauges.installedModules.set({ domain: domainId, gameServer: server.id }, installedModules.length);
                domainInstalledModules += installedModules.length;
              }

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

          this.gauges.gameServers.set(totals.gameServers);
          this.gauges.players.set(totals.players);
          this.gauges.users.set(totals.users);
          this.gauges.installedModules.set(totals.installedModules);
        },
        {
          name: 'kpi',
          help: 'KPI metrics',
        }
      ),
      config.get('takaro.kpiInterval')
    );
  }

  async stop() {
    clearInterval(this.interval);
  }
}

export const kpi = new KPI();
