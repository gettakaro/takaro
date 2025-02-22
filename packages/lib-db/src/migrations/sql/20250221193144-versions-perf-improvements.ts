import { Knex } from 'knex';

/**
 * Adds performance optimization indices for module version querying
 */
export async function up(knex: Knex): Promise<void> {
  // ModuleVersions composite index
  await knex.schema.raw(
    'CREATE INDEX IF NOT EXISTS idx_moduleversions_moduleid_tag ON "moduleVersions" ("moduleId", tag)',
  );

  // Add indices on versionId foreign keys
  await knex.schema.alterTable('functions', (table) => {
    table.index(['versionId'], 'idx_functions_versionid');
  });

  await knex.schema.alterTable('commands', (table) => {
    table.index(['versionId'], 'idx_commands_versionid');
  });

  await knex.schema.alterTable('hooks', (table) => {
    table.index(['versionId'], 'idx_hooks_versionid');
  });

  await knex.schema.alterTable('cronJobs', (table) => {
    table.index(['versionId'], 'idx_cronjobs_versionid');
  });

  // Add indices on functionId foreign keys
  await knex.schema.alterTable('hooks', (table) => {
    table.index(['functionId'], 'idx_hooks_functionid');
  });

  await knex.schema.alterTable('cronJobs', (table) => {
    table.index(['functionId'], 'idx_cronjobs_functionid');
  });

  await knex.schema.alterTable('commands', (table) => {
    table.index(['functionId'], 'idx_commands_functionid');
  });
}

/**
 * Removes performance optimization indices
 */
export async function down(knex: Knex): Promise<void> {
  // Drop ModuleVersions composite index
  await knex.schema.raw('DROP INDEX IF EXISTS idx_moduleversions_moduleid_tag');

  // Drop versionId indices
  await knex.schema.alterTable('functions', (table) => {
    table.dropIndex(['versionId'], 'idx_functions_versionid');
  });

  await knex.schema.alterTable('commands', (table) => {
    table.dropIndex(['versionId'], 'idx_commands_versionid');
  });

  await knex.schema.alterTable('hooks', (table) => {
    table.dropIndex(['versionId'], 'idx_hooks_versionid');
  });

  await knex.schema.alterTable('cronJobs', (table) => {
    table.dropIndex(['versionId'], 'idx_cronjobs_versionid');
  });

  // Drop functionId indices
  await knex.schema.alterTable('hooks', (table) => {
    table.dropIndex(['functionId'], 'idx_hooks_functionid');
  });

  await knex.schema.alterTable('cronJobs', (table) => {
    table.dropIndex(['functionId'], 'idx_cronjobs_functionid');
  });

  await knex.schema.alterTable('commands', (table) => {
    table.dropIndex(['functionId'], 'idx_commands_functionid');
  });
}
