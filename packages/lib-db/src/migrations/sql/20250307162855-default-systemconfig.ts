import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('moduleVersions', (table) => {
    table.jsonb('defaultSystemConfig').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('moduleVersions', (table) => {
    table.dropColumn('defaultSystemConfig');
  });
}
