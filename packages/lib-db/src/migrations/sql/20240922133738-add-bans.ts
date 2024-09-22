import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('bans', (table) => {
    table.timestamps(true, true, true);
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid ()'));
    table.string('domain').references('domains.id').onDelete('CASCADE').notNullable();
    table.index('domain');

    table.uuid('gameServerId').references('gameservers.id').onDelete('CASCADE').notNullable();
    table.uuid('playerId').references('players.id').onDelete('CASCADE').notNullable();

    table.boolean('takaroManaged').notNullable();
    table.timestamp('until').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('bans');
}
