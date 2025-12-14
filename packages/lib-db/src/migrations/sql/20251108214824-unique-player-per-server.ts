import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Delete duplicate rows where the same playerId has multiple different gameIds on the same server
  // This violates the business rule that each player should have exactly one POG per server
  // Keep the oldest POG (lowest id) for each (playerId, gameServerId) pair
  await knex.raw(`
    DELETE FROM "playerOnGameServer"
    WHERE id IN (
      SELECT id
      FROM (
        SELECT id,
               ROW_NUMBER() OVER (PARTITION BY "playerId", "gameServerId" ORDER BY id) as rnk
        FROM "playerOnGameServer"
      ) t
      WHERE t.rnk > 1
    )
  `);

  // Add unique constraint to prevent one player from having multiple POGs on the same server
  await knex.schema.alterTable('playerOnGameServer', (table) => {
    table.unique(['playerId', 'gameServerId']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('playerOnGameServer', (table) => {
    table.dropUnique(['playerId', 'gameServerId']);
  });
}
