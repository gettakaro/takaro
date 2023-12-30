import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('playerOnGameServer', (table) => {
    table.dropColumn('ip');
  });

  await knex.schema.createTable('playerOnGameServerIp', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid ()'));
    table.timestamps(true, true, true);
    table.string('domain').references('domains.id').onDelete('CASCADE').notNullable();
    table.uuid('pogId').references('playerOnGameServer.id').onDelete('CASCADE').notNullable();
    table.specificType('ip', 'inet').notNullable();
    table.string('country');
    table.string('city');
    table.string('longitude');
    table.string('latitude');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('playerOnGameServerIp');

  await knex.schema.alterTable('playerOnGameServer', (table) => {
    table.specificType('ip', 'inet').nullable();
  });
}
