import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('domains', (table) => {
    table.enum('state', ['ACTIVE', 'DISABLED', 'MAINTENANCE']).notNullable().defaultTo('ACTIVE');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('domains', (table) => {
    table.dropColumn('state');
  });
}
