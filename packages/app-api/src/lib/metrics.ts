import { Gauge, Counter, Pushgateway, Registry } from 'prom-client';
import { config } from '../config.js';

const playerSyncRegistry = new Registry();
const kpiRegistry = new Registry();

export const playerSyncGateway = new Pushgateway(config.get('metrics.pushgatewayUrl'), {}, playerSyncRegistry);
export const kpiGateway = new Pushgateway(config.get('metrics.pushgatewayUrl'), {}, kpiRegistry);

const metricsPrefix = 'takaro_';

export const metrics = {
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

  users: new Gauge({
    name: `${metricsPrefix}users`,
    help: 'Number of users',
    labelNames: ['domain'],
    registers: [kpiRegistry],
  }),

  installedModules: new Gauge({
    name: `${metricsPrefix}installedModules`,
    help: 'Number of installedModules',
    labelNames: ['domain', 'gameServer'],
    registers: [kpiRegistry],
  }),

  // Domain metrics
  player_ping: new Gauge({
    name: `${metricsPrefix}player_ping`,
    help: 'Player ping',
    labelNames: ['domain', 'player', 'gameserver'],
    registers: [playerSyncRegistry],
  }),
  players_online: new Gauge({
    name: `${metricsPrefix}players_online`,
    help: 'Players online',
    labelNames: ['domain', 'gameserver'],
    registers: [playerSyncRegistry],
  }),
  player_currency: new Gauge({
    name: `${metricsPrefix}player_currency`,
    help: 'Player currency',
    labelNames: ['domain', 'player', 'gameserver'],
    registers: [playerSyncRegistry],
  }),
  events: new Counter({
    name: `${metricsPrefix}events`,
    help: 'Counter for the different event types',
    labelNames: ['domain', 'event', 'player', 'gameserver', 'module', 'user'],
  }),
};
