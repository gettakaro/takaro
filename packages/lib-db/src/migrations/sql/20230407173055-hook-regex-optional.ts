import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('hooks', (table) => {
    table.string('regex').nullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('modules', (table) => {
    table.string('regex').notNullable().alter();
  });
}
