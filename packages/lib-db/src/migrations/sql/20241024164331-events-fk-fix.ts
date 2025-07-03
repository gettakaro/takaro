import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // When player, module, gameserver or userId is deleted, keep the event
  await knex.schema.alterTable('events', (table) => {
    table.dropForeign(['actingUserId']);
    table.dropForeign(['actingModuleId']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('events', (table) => {
    table.foreign('actingUserId').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('actingModuleId').references('id').inTable('modules').onDelete('CASCADE');
  });
}
