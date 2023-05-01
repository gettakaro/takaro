import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('moduleAssignments', (table) => {
    // Set a value for all existing rows
    table.json('systemConfig').notNullable().defaultTo('{}');
    // Make the column not nullable
    table.json('systemConfig').notNullable().alter();
    table.renameColumn('config', 'userConfig');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('moduleAssignments', (table) => {
    table.dropColumn('systemConfig');
    table.renameColumn('userConfig', 'config');
  });
}
