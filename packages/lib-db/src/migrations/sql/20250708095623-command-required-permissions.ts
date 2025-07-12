import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('commands', (table) => {
    table.jsonb('requiredPermissions').defaultTo('[]').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('commands', (table) => {
    table.dropColumn('requiredPermissions');
  });
}
