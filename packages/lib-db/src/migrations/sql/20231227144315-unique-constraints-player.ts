import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Delete any duplicate rows first
  // Retain the record where createdAt is the oldest
  await knex.raw(`
    DELETE FROM "players"
    WHERE id IN (
      SELECT id
      FROM (
        SELECT id,
               ROW_NUMBER() OVER (PARTITION BY domain, "steamId" ORDER BY "createdAt") as rnk
        FROM "players"
        WHERE "steamId" IS NOT NULL
      ) t
      WHERE t.rnk > 1
    )
  `);

  // Also for epicOnlineServicesId
  await knex.raw(`
    DELETE FROM "players"
    WHERE id IN (
      SELECT id
      FROM (
        SELECT id,
               ROW_NUMBER() OVER (PARTITION BY domain, "epicOnlineServicesId" ORDER BY "createdAt") as rnk
        FROM "players"
        WHERE "epicOnlineServicesId" IS NOT NULL
      ) t
      WHERE t.rnk > 1
    )
  `);

  // And xbox
  await knex.raw(`
    DELETE FROM "players"
    WHERE id IN (
      SELECT id
      FROM (
        SELECT id,
               ROW_NUMBER() OVER (PARTITION BY domain, "xboxLiveId" ORDER BY "createdAt") as rnk
        FROM "players"
        WHERE "xboxLiveId" IS NOT NULL
      ) t
      WHERE t.rnk > 1
    )
  `);

  await knex.schema.alterTable('players', (table) => {
    table.unique(['domain', 'steamId']);
    table.unique(['domain', 'epicOnlineServicesId']);
    table.unique(['domain', 'xboxLiveId']);
  });

  await knex.raw(`
  ALTER TABLE players
  ADD CONSTRAINT players_domain_steam_xbox_eos_unique
  UNIQUE NULLS NOT DISTINCT (domain, "steamId", "xboxLiveId", "epicOnlineServicesId");
`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('players', (table) => {
    table.dropUnique(['domain', 'steamId']);
    table.dropUnique(['domain', 'epicOnlineServicesId']);
    table.dropUnique(['domain', 'xboxLiveId']);
  });

  await knex.raw(`
    ALTER TABLE players
    DROP CONSTRAINT players_domain_steam_xbox_eos_unique;
  `);
}
