import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('variables', (table) => {
    table.uuid('gameServerId').references('gameservers.id').onDelete('CASCADE').nullable();
    table.uuid('playerId').references('players.id').onDelete('CASCADE').nullable();
    // drop the old key, domain constraint
    table.dropUnique(['key', 'domain']);
  });

  // key should be unique per domain, gameServerId and playerId
  await knex.raw(`
    ALTER TABLE variables
    ADD CONSTRAINT variables_key_domain_gameServerId_playerId_unique
    UNIQUE NULLS NOT DISTINCT (key, domain, "gameServerId", "playerId");
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE variables
    DROP CONSTRAINT variables_key_domain_gameServerId_playerId_unique;
  `);

  await knex.schema.alterTable('variables', (table) => {
    table.dropForeign(['gameServerId']);
    table.dropForeign(['playerId']);

    table.unique(['key', 'domain']);
  });
}
