import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('permissionOnRole', (table) => {
    table.index(['roleId']);
  });

  await knex.schema.alterTable('playerOnGameServer', (table) => {
    table.index(['domain', 'playerId']);
  });

  await knex.schema.alterTable('playerInventory', (table) => {
    table.dropIndex(['playerId', 'domain']);
    table.index(['playerId', 'domain', 'itemId']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('permissionOnRole', (table) => {
    table.dropIndex(['roleId']);
  });

  await knex.schema.alterTable('playerOnGameServer', (table) => {
    table.dropIndex(['domain', 'playerId']);
  });

  await knex.schema.alterTable('playerInventory', (table) => {
    table.dropIndex(['domain', 'playerId', 'itemId']);
    table.index(['playerId', 'domain']);
  });
}
