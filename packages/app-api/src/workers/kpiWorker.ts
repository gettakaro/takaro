import { TakaroWorker } from '@takaro/queues';
import { queueService } from './QueueService.js';
import { config } from '../config.js';
import { Job } from 'bullmq';
import { logger } from '@takaro/util';
import { kpiGateway, metrics } from '../lib/metrics.js';
import { getKnex } from '@takaro/db';

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

  const knex = await getKnex();

  const oneDayAgo = new Date(new Date().valueOf() - 1000 * 60 * 60 * 24).toISOString();
  const oneWeekAgo = new Date(new Date().valueOf() - 1000 * 60 * 60 * 24 * 7).toISOString();
  const oneMonthAgo = new Date(new Date().valueOf() - 1000 * 60 * 60 * 24 * 30).toISOString();

  // 1. Get total domain count
  const domainCountResult = await knex.raw(`
    SELECT COUNT(*) as count 
    FROM domains
  `);
  const domainCount = parseInt(domainCountResult.rows[0].count, 10);
  metrics.domains.set(domainCount);

  // 2. Get all domains with base metrics in one query
  const baseMetricsResult = await knex.raw(`
    WITH domain_metrics AS (
      SELECT 
        d.id as domain_id,
        (SELECT COUNT(*) FROM gameservers WHERE domain = d.id AND "deletedAt" IS NULL) as game_server_count,
        (SELECT COUNT(*) FROM players WHERE domain = d.id) as player_count,
        (SELECT COUNT(*) FROM users WHERE domain = d.id) as user_count
      FROM domains d
    )
    SELECT * FROM domain_metrics
  `);

  // Set per-domain base metrics
  for (const row of baseMetricsResult.rows) {
    metrics.gameServers.set({ domain: row.domain_id }, parseInt(row.game_server_count, 10));
    metrics.players.set({ domain: row.domain_id }, parseInt(row.player_count, 10));
    metrics.users.set({ domain: row.domain_id }, parseInt(row.user_count, 10));
  }

  // 3. Get player activity metrics per game server in one query
  const pogActivityResult = await knex.raw(
    `
    SELECT 
      pog."gameServerId",
      pog.domain,
      COUNT(CASE WHEN pog."lastSeen" > ? THEN 1 END) as daily_active,
      COUNT(CASE WHEN pog."lastSeen" > ? THEN 1 END) as weekly_active,
      COUNT(CASE WHEN pog."lastSeen" > ? THEN 1 END) as monthly_active
    FROM "playerOnGameServer" pog
    GROUP BY pog."gameServerId", pog.domain
  `,
    [oneDayAgo, oneWeekAgo, oneMonthAgo],
  );

  // Set per-gameserver player activity metrics
  for (const row of pogActivityResult.rows) {
    metrics.dap.set({ domain: row.domain, gameServer: row.gameServerId }, parseInt(row.daily_active, 10));
    metrics.wap.set({ domain: row.domain, gameServer: row.gameServerId }, parseInt(row.weekly_active, 10));
    metrics.map.set({ domain: row.domain, gameServer: row.gameServerId }, parseInt(row.monthly_active, 10));
  }

  // 4. Get domain-level unique player activity (DAU/WAU/MAU)
  const domainPlayerActivityResult = await knex.raw(
    `
    SELECT 
      pog.domain,
      COUNT(DISTINCT CASE WHEN pog."lastSeen" > ? THEN pog."playerId" END) as dau,
      COUNT(DISTINCT CASE WHEN pog."lastSeen" > ? THEN pog."playerId" END) as wau,
      COUNT(DISTINCT CASE WHEN pog."lastSeen" > ? THEN pog."playerId" END) as mau
    FROM "playerOnGameServer" pog
    GROUP BY pog.domain
  `,
    [oneDayAgo, oneWeekAgo, oneMonthAgo],
  );

  // Set domain-level player activity metrics
  for (const row of domainPlayerActivityResult.rows) {
    metrics.dap.set({ domain: row.domain }, parseInt(row.dau, 10));
    metrics.wap.set({ domain: row.domain }, parseInt(row.wau, 10));
    metrics.map.set({ domain: row.domain }, parseInt(row.mau, 10));
  }

  // 5. Get user activity metrics in one query
  const userActivityResult = await knex.raw(
    `
    SELECT 
      u.domain,
      COUNT(*) as total_users,
      COUNT(CASE WHEN u."lastSeen" > ? THEN 1 END) as daily_active_users,
      COUNT(CASE WHEN u."lastSeen" > ? THEN 1 END) as weekly_active_users,
      COUNT(CASE WHEN u."lastSeen" > ? THEN 1 END) as monthly_active_users
    FROM users u
    GROUP BY u.domain
  `,
    [oneDayAgo, oneWeekAgo, oneMonthAgo],
  );

  // Set user activity metrics
  for (const row of userActivityResult.rows) {
    metrics.dau.set({ domain: row.domain }, parseInt(row.daily_active_users, 10));
    metrics.wau.set({ domain: row.domain }, parseInt(row.weekly_active_users, 10));
    metrics.mau.set({ domain: row.domain }, parseInt(row.monthly_active_users, 10));
  }

  // 6. Get module installation counts in one query
  const moduleCountsResult = await knex.raw(`
    WITH module_counts AS (
      SELECT 
        mi."gameserverId",
        gs.domain,
        COUNT(*) as module_count
      FROM "moduleInstallations" mi
      JOIN gameservers gs ON gs.id = mi."gameserverId"
      WHERE gs."deletedAt" IS NULL
      GROUP BY mi."gameserverId", gs.domain
    ),
    domain_totals AS (
      SELECT 
        domain,
        SUM(module_count) as total_modules
      FROM module_counts
      GROUP BY domain
    )
    SELECT 
      mc.*,
      dt.total_modules as domain_total
    FROM module_counts mc
    JOIN domain_totals dt ON mc.domain = dt.domain
  `);

  // Track domain totals to avoid duplicates
  const domainModuleTotals = new Map<string, number>();

  // Set module installation metrics
  for (const row of moduleCountsResult.rows) {
    metrics.installedModules.set({ domain: row.domain, gameServer: row.gameserverId }, parseInt(row.module_count, 10));

    // Set domain total only once
    if (!domainModuleTotals.has(row.domain)) {
      domainModuleTotals.set(row.domain, parseInt(row.domain_total, 10));
      metrics.installedModules.set({ domain: row.domain }, parseInt(row.domain_total, 10));
    }
  }

  // 7. Calculate global totals using aggregated queries
  const totalsResult = await knex.raw(`
    SELECT 
      (SELECT COUNT(*) FROM gameservers WHERE "deletedAt" IS NULL) as total_game_servers,
      (SELECT COUNT(*) FROM players) as total_players,
      (SELECT COUNT(*) FROM users) as total_users,
      (SELECT COUNT(*) FROM "moduleInstallations") as total_modules
  `);

  const totals = totalsResult.rows[0];
  metrics.gameServers.set(parseInt(totals.total_game_servers, 10));
  metrics.players.set(parseInt(totals.total_players, 10));
  metrics.users.set(parseInt(totals.total_users, 10));
  metrics.installedModules.set(parseInt(totals.total_modules, 10));

  // Push metrics to gateway (skip in test environment)
  try {
    await kpiGateway.pushAdd({ jobName: 'kpi' });
  } catch (error) {
    log.warn('Failed to push metrics to gateway', { error });
  }
}
