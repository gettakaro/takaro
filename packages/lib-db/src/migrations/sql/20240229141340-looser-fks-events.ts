import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // When player, module, gameserver or userId is deleted, keep the event
  await knex.schema.alterTable('events', (table) => {
    table.dropForeign(['playerId']);
    table.dropForeign(['moduleId']);
    table.dropForeign(['gameserverId']);
    table.dropForeign(['userId']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('events', (table) => {
    table.foreign('playerId').references('id').inTable('players').onDelete('CASCADE');
    table.foreign('moduleId').references('id').inTable('modules').onDelete('CASCADE');
    table.foreign('gameserverId').references('id').inTable('gameservers').onDelete('CASCADE');
    table.foreign('userId').references('id').inTable('users').onDelete('CASCADE');
  });
}
