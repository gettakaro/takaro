import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('playerNameHistory', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid ()'));
    table.timestamps(true, true, true);
    table.string('domain').references('domains.id').onDelete('CASCADE').notNullable();
    table.uuid('playerId').references('players.id').onDelete('CASCADE').notNullable();
    table.uuid('gameServerId').references('gameservers.id').onDelete('SET NULL').nullable();
    table.string('name').notNullable();

    // Indexes for performance
    table.index(['playerId', 'createdAt'], 'idx_player_name_history_player_created');
    table.index('name', 'idx_player_name_history_name');
  });

  // Populate initial data from existing player names
  const players = await knex('players').select('id', 'name', 'domain', 'createdAt').whereNotNull('name');

  if (players.length > 0) {
    const nameHistoryRecords = players.map((player) => ({
      playerId: player.id,
      name: player.name,
      domain: player.domain,
      createdAt: player.createdAt,
      updatedAt: player.createdAt,
    }));

    await knex('playerNameHistory').insert(nameHistoryRecords);
  }
}

export async function down(knex: Knex): Promise<void> {
  // Update players table with latest name from history before dropping
  const latestNames = await knex('playerNameHistory')
    .select('playerId', 'name')
    .distinctOn('playerId')
    .orderBy('playerId')
    .orderBy('createdAt', 'desc');

  for (const record of latestNames) {
    await knex('players').where('id', record.playerId).update({ name: record.name });
  }

  await knex.schema.dropTable('playerNameHistory');
}
