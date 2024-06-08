import { Gauge, Counter, Pushgateway, Registry } from 'prom-client';
import { config } from '../config.js';

const pushRegistry = new Registry();

export const gateway = new Pushgateway(config.get('metrics.pushgatewayUrl'), {}, pushRegistry);

const metricsPrefix = 'takaro_';

export const metrics = {
  // KPIs
  domains: new Gauge({
    name: `${metricsPrefix}domains`,
    help: 'Number of domains',
    registers: [pushRegistry],
  }),

  gameServers: new Gauge({
    name: `${metricsPrefix}gameServers`,
    help: 'Number of gameServers',
    labelNames: ['domain'],
    registers: [pushRegistry],
  }),

  players: new Gauge({
    name: `${metricsPrefix}players`,
    help: 'Number of players',
    labelNames: ['domain'],
    registers: [pushRegistry],
  }),

  users: new Gauge({
    name: `${metricsPrefix}users`,
    help: 'Number of users',
    labelNames: ['domain'],
    registers: [pushRegistry],
  }),

  installedModules: new Gauge({
    name: `${metricsPrefix}installedModules`,
    help: 'Number of installedModules',
    labelNames: ['domain', 'gameServer'],
    registers: [pushRegistry],
  }),

  // Domain metrics
  player_ping: new Gauge({
    name: `${metricsPrefix}player_ping`,
    help: 'Player ping',
    labelNames: ['domain', 'player', 'gameserver'],
    registers: [pushRegistry],
  }),
  players_online: new Gauge({
    name: `${metricsPrefix}players_online`,
    help: 'Players online',
    labelNames: ['domain', 'gameserver'],
    registers: [pushRegistry],
  }),
  player_currency: new Gauge({
    name: `${metricsPrefix}player_currency`,
    help: 'Player currency',
    labelNames: ['domain', 'player', 'gameserver'],
    registers: [pushRegistry],
  }),
  events: new Counter({
    name: `${metricsPrefix}events`,
    help: 'Counter for the different event types',
    labelNames: ['domain', 'event', 'player', 'gameserver', 'module', 'user'],
  }),
};
