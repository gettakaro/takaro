import { Gauge, Counter, Pushgateway, Registry } from 'prom-client';
import { config } from '../config.js';

const playerSyncRegistry = new Registry();
const kpiRegistry = new Registry();

export const playerSyncGateway = new Pushgateway(config.get('metrics.pushgatewayUrl'), {}, playerSyncRegistry);
export const kpiGateway = new Pushgateway(config.get('metrics.pushgatewayUrl'), {}, kpiRegistry);

const metricsPrefix = 'takaro_';

export const metrics: Record<string, Gauge> = {
  // KPIs
  domains: new Gauge({
    name: `${metricsPrefix}domains`,
    help: 'Number of domains',
    registers: [kpiRegistry],
  }),

  gameServers: new Gauge({
    name: `${metricsPrefix}gameServers`,
    help: 'Number of gameServers',
    labelNames: ['domain'],
    registers: [kpiRegistry],
  }),

  players: new Gauge({
    name: `${metricsPrefix}players`,
    help: 'Number of players',
    labelNames: ['domain'],
    registers: [kpiRegistry],
  }),

  // Daily active players
  dap: new Gauge({
    name: `${metricsPrefix}daily_active_players`,
    help: 'Daily active players',
    labelNames: ['domain', 'gameServer'],
    registers: [kpiRegistry],
  }),

  // Weekly active players
  wap: new Gauge({
    name: `${metricsPrefix}weekly_active_players`,
    help: 'Weekly active players',
    labelNames: ['domain', 'gameServer'],
    registers: [kpiRegistry],
  }),

  // Monthly active players
  map: new Gauge({
    name: `${metricsPrefix}monthly_active_players`,
    help: 'Monthly active players',
    labelNames: ['domain', 'gameServer'],
    registers: [kpiRegistry],
  }),

  users: new Gauge({
    name: `${metricsPrefix}users`,
    help: 'Number of users',
    labelNames: ['domain'],
    registers: [kpiRegistry],
  }),

  // Daily active users
  dau: new Gauge({
    name: `${metricsPrefix}daily_active_users`,
    help: 'Daily active users',
    labelNames: ['domain'],
    registers: [kpiRegistry],
  }),

  // Weekly active users
  wau: new Gauge({
    name: `${metricsPrefix}weekly_active_users`,
    help: 'Weekly active users',
    labelNames: ['domain'],
    registers: [kpiRegistry],
  }),

  // Monthly active users
  mau: new Gauge({
    name: `${metricsPrefix}monthly_active_users`,
    help: 'Monthly active users',
    labelNames: ['domain'],
    registers: [kpiRegistry],
  }),

  installedModules: new Gauge({
    name: `${metricsPrefix}installedModules`,
    help: 'Number of installedModules',
    labelNames: ['domain', 'gameServer'],
    registers: [kpiRegistry],
  }),
};

// TODO: this might be a memory leak?
// I dont _think_ so but it's sketchy code...
export function getWorkerMetrics(gameserver: string) {
  const registry = new Registry();
  const gateway = new Pushgateway(config.get('metrics.pushgatewayUrl'), {}, registry);

  const finalize = async () => {
    return gateway.pushAdd({ jobName: 'worker', groupings: { gameserver } });
  };

  return {
    finalize,
    registry,
    gateway,
    metrics: {
      player_ping: new Gauge({
        name: `${metricsPrefix}player_ping`,
        help: 'Player ping',
        labelNames: ['domain', 'player', 'gameserver'],
        registers: [registry],
      }),
      players_online: new Gauge({
        name: `${metricsPrefix}players_online`,
        help: 'Players online',
        labelNames: ['domain', 'gameserver'],
        registers: [registry],
      }),
      player_currency: new Gauge({
        name: `${metricsPrefix}player_currency`,
        help: 'Player currency',
        labelNames: ['domain', 'player', 'gameserver'],
        registers: [registry],
      }),
    },
  };
}

export const eventsMetric = new Counter({
  name: `${metricsPrefix}events`,
  help: 'Counter for the different event types',
  labelNames: ['domain', 'event', 'player', 'gameserver', 'module', 'user'],
});

export const gameServerLatency = new Gauge({
  name: `${metricsPrefix}gameServer_latency`,
  help: 'Game server latency in ms',
  labelNames: ['domain', 'gameserver'],
});
