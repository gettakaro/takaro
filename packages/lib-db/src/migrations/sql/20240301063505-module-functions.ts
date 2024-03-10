import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('functions', (table) => {
    table.string('name').nullable();
    table.uuid('moduleId').nullable();
    table.foreign('moduleId').references('id').inTable('modules');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('module_functions');

  await knex.schema.alterTable('functions', (table) => {
    table.dropColumn('name');
  });
}
