import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // First drop the existing foreign key constraint
  await knex.schema.table('bans', (table) => {
    table.dropForeign(['gameServerId']);
  });

  // Make gameServerId nullable and recreate foreign key
  await knex.schema.alterTable('bans', (table) => {
    table.uuid('gameServerId').nullable().alter();
    table.foreign('gameServerId').references('id').inTable('gameservers').onDelete('CASCADE');
  });

  // Add the check constraint
  await knex.raw(`
    ALTER TABLE bans
    ADD CONSTRAINT bans_global_gameserver_check
    CHECK (
      ("isGlobal" = true AND "gameServerId" IS NULL) OR
      ("isGlobal" = false AND "gameServerId" IS NOT NULL)
    )
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Remove the check constraint
  await knex.raw(`
    ALTER TABLE bans
    DROP CONSTRAINT bans_global_gameserver_check
  `);

  // Drop the foreign key
  await knex.schema.table('bans', (table) => {
    table.dropForeign(['gameServerId']);
  });

  // Make gameServerId required again and recreate original foreign key
  await knex.schema.alterTable('bans', (table) => {
    table.uuid('gameServerId').notNullable().alter();
    table.foreign('gameServerId').references('id').inTable('gameservers').onDelete('CASCADE');
  });
}
