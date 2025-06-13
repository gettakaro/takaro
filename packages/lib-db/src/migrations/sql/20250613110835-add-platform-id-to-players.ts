import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Add platformId column to players table
  await knex.schema.alterTable('players', (table) => {
    table.string('platformId').nullable();
  });

  // Add unique constraint for domain + platformId
  await knex.schema.alterTable('players', (table) => {
    table.unique(['domain', 'platformId']);
  });

  // Drop the existing unique constraint
  await knex.raw(`
    ALTER TABLE players
    DROP CONSTRAINT players_domain_steam_xbox_eos_unique;
  `);

  // Add new unique constraint that includes platformId
  await knex.raw(`
    ALTER TABLE players
    ADD CONSTRAINT players_domain_steam_xbox_eos_platform_unique
    UNIQUE NULLS NOT DISTINCT (domain, "steamId", "xboxLiveId", "epicOnlineServicesId", "platformId");
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Drop the new unique constraint
  await knex.raw(`
    ALTER TABLE players
    DROP CONSTRAINT players_domain_steam_xbox_eos_platform_unique;
  `);

  // Drop the individual platformId unique constraint
  await knex.schema.alterTable('players', (table) => {
    table.dropUnique(['domain', 'platformId']);
  });

  // Remove platformId column
  await knex.schema.alterTable('players', (table) => {
    table.dropColumn('platformId');
  });

  // Re-add the original unique constraint
  await knex.raw(`
    ALTER TABLE players
    ADD CONSTRAINT players_domain_steam_xbox_eos_unique
    UNIQUE NULLS NOT DISTINCT (domain, "steamId", "xboxLiveId", "epicOnlineServicesId");
  `);
}
