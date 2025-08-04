import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('playerIpHistory', (table) => {
    table.index(['domain', 'playerId', 'createdAt'], 'idx_playeriphistory_domain_playerid_createdat');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('playerIpHistory', (table) => {
    table.dropIndex([], 'idx_playeriphistory_domain_playerid_createdat');
  });
}
