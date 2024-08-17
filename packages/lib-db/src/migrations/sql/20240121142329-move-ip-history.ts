import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('playerIpHistory', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid ()'));
    table.timestamps(true, true, true);
    table.string('domain').references('domains.id').onDelete('CASCADE').notNullable();
    table.uuid('playerId').references('players.id').onDelete('CASCADE').notNullable();
    table.uuid('gameServerId').references('gameservers.id').onDelete('SET NULL').nullable();
    table.specificType('ip', 'inet').notNullable();
    table.string('country');
    table.string('city');
    table.string('longitude');
    table.string('latitude');
  });

  // Transfer all the old IP history to new table

  const oldIpHistory = await knex('playerOnGameServerIp').select('*');

  const newRecords = await Promise.all(
    oldIpHistory.map(async (ipHistory) => {
      const pog = await knex('playerOnGameServer').select('*').where('id', ipHistory.pogId).first();
      delete ipHistory.pogId;
      return {
        ...ipHistory,
        playerId: pog.playerId,
        gameServerId: pog.gameServerId,
      };
    }),
  );

  if (newRecords.length) {
    await knex('playerIpHistory').insert(newRecords);
  }
  await knex.schema.dropTable('playerOnGameServerIp');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('playerIpHistory');

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
