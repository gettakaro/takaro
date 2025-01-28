import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('moduleVersions', (table) => {
    table.text('description').notNullable().defaultTo('No description').alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('moduleVersions', (table) => {
    table.text('description').nullable().alter();
  });
}
