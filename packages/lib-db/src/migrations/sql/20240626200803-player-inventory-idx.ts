import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('playerInventory', (table) => {
    table.index(['playerId', 'domain']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('playerInventory', (table) => {
    table.dropIndex(['playerId', 'domain']);
  });
}
