import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Add index for playerOnGameServer activity queries (DAU/WAU/MAU)
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_pog_domain_lastseen 
    ON "playerOnGameServer"(domain, "lastSeen" DESC)
  `);

  // Add index for user activity queries
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_users_domain_lastseen
    ON users(domain, "lastSeen" DESC)
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.raw('DROP INDEX IF EXISTS idx_pog_domain_lastseen');
  await knex.schema.raw('DROP INDEX IF EXISTS idx_users_domain_lastseen');
}
