import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('events', (table) => {
    table.timestamps(true, true, true);
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid ()'));
    table.string('domain').references('domains.id').onDelete('CASCADE').notNullable();

    table.string('eventName').notNullable();

    table.uuid('playerId').nullable().references('id').inTable('players').onDelete('CASCADE');
    table.uuid('gameserverId').nullable().references('id').inTable('gameservers').onDelete('CASCADE');
    table.uuid('moduleId').nullable().references('id').inTable('modules').onDelete('CASCADE');

    table.json('meta').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('events');
}
