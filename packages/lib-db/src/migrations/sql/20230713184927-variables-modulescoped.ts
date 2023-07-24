import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // drop the old 'variables_key_domain_gameServerId_playerId_unique' constraint
  await knex.raw(`
    ALTER TABLE variables
    DROP CONSTRAINT variables_key_domain_gameServerId_playerId_unique;
  `);

  await knex.schema.alterTable('variables', (table) => {
    table.uuid('moduleId').references('modules.id').onDelete('CASCADE').nullable();
  });

  await knex.raw(`
  ALTER TABLE variables
  ADD CONSTRAINT variables_key_domain_gameServerId_moduleId_playerId_unique
  UNIQUE NULLS NOT DISTINCT (key, domain, "gameServerId", "playerId", "moduleId");
`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('variables', (table) => {
    table.dropForeign(['moduleId']);
    table.dropUnique(['key', 'domain', 'gameServerId', 'playerId', 'moduleId']);
  });

  await knex.raw(`
    ALTER TABLE variables
    ADD CONSTRAINT variables_key_domain_gameServerId_playerId_unique
    UNIQUE NULLS NOT DISTINCT (key, domain, "gameServerId", "playerId");
  `);
}
