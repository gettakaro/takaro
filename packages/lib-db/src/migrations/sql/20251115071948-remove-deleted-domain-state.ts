import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // First, migrate any existing DELETED domains to DISABLED state
  await knex.raw(`UPDATE domains SET state = 'DISABLED' WHERE state = 'DELETED'`);

  // PostgreSQL requires a multi-step process to update enum constraints
  // 1. Add a temporary column with the new enum values (without DELETED)
  // 2. Copy data from old column to new column
  // 3. Drop old column
  // 4. Rename new column to old column name

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

export async function down(knex: Knex): Promise<void> {
  // Drop the enum type if it exists to prevent "type already exists" errors
  await knex.raw('DROP TYPE IF EXISTS state_new CASCADE');

  // Revert to include DELETED in enum values
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
