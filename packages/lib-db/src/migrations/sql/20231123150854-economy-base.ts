import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('playerOnGameServer', (table) => {
    table.integer('currency').defaultTo(0);
    table.check('currency >= 0', [], 'currency_positive');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('playerOnGameServer', (table) => {
    table.dropChecks('currency_positive');
    table.dropColumn('currency');
  });
}
