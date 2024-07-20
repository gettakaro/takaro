import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('events', (table) => {
    table.uuid('actingUserId').nullable();
    table.foreign('actingUserId').references('id').inTable('users');

    table.uuid('actingModuleId').nullable();
    table.foreign('actingModuleId').references('id').inTable('modules');

    table.index('actingUserId');
    table.index('actingModuleId');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('events', (table) => {
    table.dropForeign(['actingUserId']);
    table.dropColumn('actingUserId');

    table.dropForeign(['actingModuleId']);
    table.dropColumn('actingModuleId');
  });
}
