import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('settings', (table) => {
    table.string('economyEnabled').defaultTo('false');
    table.string('currencyName').defaultTo('Takaro coins');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('playerOnGameServer', (table) => {
    table.dropColumn('economyEnabled');
    table.dropColumn('currencyName');
  });
}
