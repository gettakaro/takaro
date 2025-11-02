import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // PostgreSQL requires a multi-step process to update enum constraints
  // 1. Add a temporary column with the new enum values
  // 2. Copy data from old column to new column
  // 3. Drop old column
  // 4. Rename new column to old column name

  await knex.schema.alterTable('domains', (table) => {
    table.enum('state_new', ['ACTIVE', 'DISABLED', 'MAINTENANCE', 'DELETED']).notNullable().defaultTo('ACTIVE');
  });

  await knex.raw(`UPDATE domains SET state_new = state::text::varchar`);

  await knex.schema.alterTable('domains', (table) => {
    table.dropColumn('state');
  });

  await knex.schema.alterTable('domains', (table) => {
    table.renameColumn('state_new', 'state');
  });
}

export async function down(knex: Knex): Promise<void> {
  // Revert to the original enum values (removing DELETED)
  // First, ensure no domains are in DELETED state (or this will fail)
  await knex.raw(`DELETE FROM domains WHERE state = 'DELETED'`);

  await knex.schema.alterTable('domains', (table) => {
    table.enum('state_new', ['ACTIVE', 'DISABLED', 'MAINTENANCE']).notNullable().defaultTo('ACTIVE');
  });

  await knex.raw(`UPDATE domains SET state_new = state::text::varchar`);

  await knex.schema.alterTable('domains', (table) => {
    table.dropColumn('state');
  });

  await knex.schema.alterTable('domains', (table) => {
    table.renameColumn('state_new', 'state');
  });
}
