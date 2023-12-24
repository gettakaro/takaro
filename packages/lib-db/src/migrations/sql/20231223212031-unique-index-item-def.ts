import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Delete duplicates while keeping the first occurrence
  await knex.raw(`
    DELETE FROM items
    WHERE id IN (
      SELECT id
      FROM (
        SELECT id,
               ROW_NUMBER() OVER (PARTITION BY code, "gameserverId", domain ORDER BY id) as rnk
        FROM items
      ) t
      WHERE t.rnk > 1
    )
  `);

  await knex.schema.alterTable('items', (table) => {
    table.unique(['code', 'gameserverId', 'domain']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('items', (table) => {
    table.dropUnique(['code', 'gameserverId', 'domain']);
  });
}
