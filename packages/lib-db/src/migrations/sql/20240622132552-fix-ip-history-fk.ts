import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('playerIpHistory', (table) => {
    table.uuid('gameServerId').nullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('playerIpHistory', (table) => {
    table.uuid('gameServerId').notNullable().alter();
  });
}
