import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('playerOnGameServer', (table) => {
    table.string('ip').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('playerOnGameServer', (table) => {
    table.dropColumn('ip');
  });
}
