import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('gameservers', (table) => {
    table.boolean('reachable').defaultTo(true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('gameservers', (table) => {
    table.dropColumn('reachable');
  });
}
