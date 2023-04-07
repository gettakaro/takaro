import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('modules', (table) => {
    table
      .text('description')
      .notNullable()
      .defaultTo('No description provided.');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('modules', (table) => {
    table.dropColumn('description');
  });
}
