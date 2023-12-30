import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Delete duplicate rows first
  await knex.raw(`
    DELETE FROM "playerOnGameServer"
    WHERE id IN (
      SELECT id
      FROM (
        SELECT id,
               ROW_NUMBER() OVER (PARTITION BY "gameId", "gameServerId" ORDER BY id) as rnk
        FROM "playerOnGameServer"
      ) t
      WHERE t.rnk > 1
    )
  `);

  await knex.schema.alterTable('playerOnGameServer', (table) => {
    table.unique(['gameId', 'gameServerId']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('playerOnGameServer', (table) => {
    table.dropUnique(['gameId', 'gameServerId']);
  });
}
