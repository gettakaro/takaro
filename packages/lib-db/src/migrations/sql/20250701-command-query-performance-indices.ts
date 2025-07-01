import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Optimize the getTriggeredCommands query performance
  // The query joins multiple tables and performs complex JSONB operations

  // 1. Case-insensitive index on commands.trigger for efficient trigger matching
  // This allows the LOWER(commands.trigger) = ? condition to use an index
  await knex.raw('CREATE INDEX idx_commands_trigger_lower ON commands (LOWER(trigger))');

  // 2. Index on moduleInstallations.gameserverId for efficient filtering
  // The query filters by gameserverId through the join chain
  await knex.schema.alterTable('moduleInstallations', (table) => {
    table.index(['gameserverId'], 'idx_moduleinstallations_gameserverid');
  });

  // 3. Index on moduleInstallations.versionId for join optimization
  // This helps the join between moduleInstallations and moduleVersions
  await knex.schema.alterTable('moduleInstallations', (table) => {
    table.index(['versionId'], 'idx_moduleinstallations_versionid');
  });

  // 4. GIN index on moduleInstallations.systemConfig for JSONB queries
  // This optimizes the complex EXISTS subquery that searches command aliases
  await knex.raw(`
    CREATE INDEX idx_moduleinstallations_systemconfig_commands_gin 
    ON "moduleInstallations" 
    USING gin ((("systemConfig" -> 'commands')))
  `);

  // 5. Composite index on commands for better join performance
  // This helps when joining from moduleVersions to commands
  await knex.schema.alterTable('commands', (table) => {
    table.index(['versionId', 'domain'], 'idx_commands_versionid_domain');
  });
}

export async function down(knex: Knex): Promise<void> {
  // Drop all indices created in the up function

  await knex.raw('DROP INDEX IF EXISTS idx_commands_trigger_lower');

  await knex.schema.alterTable('moduleInstallations', (table) => {
    table.dropIndex([], 'idx_moduleinstallations_gameserverid');
    table.dropIndex([], 'idx_moduleinstallations_versionid');
  });

  await knex.raw('DROP INDEX IF EXISTS idx_moduleinstallations_systemconfig_commands_gin');

  await knex.schema.alterTable('commands', (table) => {
    table.dropIndex([], 'idx_commands_versionid_domain');
  });
}
