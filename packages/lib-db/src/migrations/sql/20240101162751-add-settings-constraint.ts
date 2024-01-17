import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Delete any settings where duplicate key, same domain and null gameServerId
  await knex.raw(`
    DELETE FROM settings
    WHERE id IN (
      SELECT id
      FROM (
        SELECT id, ROW_NUMBER() OVER (partition BY key, domain ORDER BY id) AS rnum
        FROM settings
        WHERE "gameServerId" IS NULL
      ) t
      WHERE t.rnum > 1
    );
  `);

  // Drop the old constraint
  await knex.schema.alterTable('settings', (table) => {
    table.dropUnique(['key', 'domain', 'gameServerId'], 'new_settings_domain_key_gameserverid_unique');
  });

  await knex.raw(`
  ALTER TABLE settings
  ADD CONSTRAINT settings_key_domain_unique
  UNIQUE NULLS NOT DISTINCT (key, domain, "gameServerId");
`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE settings
    DROP CONSTRAINT settings_key_domain_unique;
  `);

  await knex.schema.alterTable('settings', (table) => {
    table.unique(['key', 'domain', 'gameServerId'], 'new_settings_domain_key_gameserverid_unique');
  });
}
