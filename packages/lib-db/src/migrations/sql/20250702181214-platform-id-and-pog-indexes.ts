import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Add indexes for platform ID lookups in resolveRef
  await knex.schema.alterTable('players', (table) => {
    table.index(['domain', 'steamId'], 'idx_players_domain_steamid');
    table.index(['domain', 'epicOnlineServicesId'], 'idx_players_domain_epiconlineservicesid');
    table.index(['domain', 'xboxLiveId'], 'idx_players_domain_xboxliveid');
    table.index(['domain', 'platformId'], 'idx_players_domain_platformid');
  });

  // Add composite index for playerOnGameServer findAssociations query
  await knex.schema.alterTable('playerOnGameServer', (table) => {
    table.index(['domain', 'gameId', 'gameServerId'], 'idx_pog_domain_gameid_gameserverid');
  });
}

export async function down(knex: Knex): Promise<void> {
  // Drop platform ID indexes
  await knex.schema.alterTable('players', (table) => {
    table.dropIndex([], 'idx_players_domain_steamid');
    table.dropIndex([], 'idx_players_domain_epiconlineservicesid');
    table.dropIndex([], 'idx_players_domain_xboxliveid');
    table.dropIndex([], 'idx_players_domain_platformid');
  });

  // Drop playerOnGameServer composite index
  await knex.schema.alterTable('playerOnGameServer', (table) => {
    table.dropIndex([], 'idx_pog_domain_gameid_gameserverid');
  });
}
