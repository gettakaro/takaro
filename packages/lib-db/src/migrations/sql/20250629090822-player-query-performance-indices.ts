import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create optimized indices for the slow player count query:
  // SELECT COUNT(DISTINCT players.id)
  // FROM players
  // INNER JOIN playerOnGameServer ON playerOnGameServer.playerId = players.id
  // WHERE players.domain = $1 AND playerOnGameServer.lastSeen > $2

  // Primary optimization: Composite index on playerOnGameServer for efficient join + filter
  // This allows PostgreSQL to use the index for both the JOIN and WHERE clause
  await knex.schema.alterTable('playerOnGameServer', (table) => {
    table.index(['playerId', 'lastSeen'], 'idx_playerongameserver_playerid_lastseen');
  });

  // Secondary optimization: Index on players.domain for the WHERE clause
  await knex.schema.alterTable('players', (table) => {
    table.index(['domain'], 'idx_players_domain');
  });

  // Covering index on players(domain, id) to avoid table lookups after index scan
  await knex.schema.alterTable('players', (table) => {
    table.index(['domain', 'id'], 'idx_players_domain_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  // Drop all indices created in the up function

  await knex.schema.alterTable('playerOnGameServer', (table) => {
    table.dropIndex([], 'idx_playerongameserver_playerid_lastseen');
  });

  await knex.schema.alterTable('players', (table) => {
    table.dropIndex([], 'idx_players_domain');
    table.dropIndex([], 'idx_players_domain_id');
  });
}
