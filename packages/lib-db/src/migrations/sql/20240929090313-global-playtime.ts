import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('players', (table) => {
    table.integer('playtimeSeconds').defaultTo(0).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('players', (table) => {
    table.dropColumn('playtimeSeconds');
  });
}
