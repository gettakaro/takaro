import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Index for filtering orders by domain, status, and date range
  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_shoporder_analytics 
    ON "shopOrder" (domain, status, "createdAt")
    WHERE status IN ('COMPLETED', 'PAID')
  `);

  // Index for joining orders with listings and filtering by date
  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_shoporder_listing_date 
    ON "shopOrder" ("listingId", "createdAt")
    WHERE status IN ('COMPLETED', 'PAID')
  `);

  // Index for customer analytics (unique players)
  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_shoporder_player_analytics 
    ON "shopOrder" (domain, "playerId", "createdAt")
    WHERE status IN ('COMPLETED', 'PAID')
  `);

  // Composite index for shop listings to speed up joins
  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_shoplisting_composite 
    ON "shopListing" (id, "gameServerId", price)
    WHERE "deletedAt" IS NULL AND draft = false
  `);

  // Index for filtering listings by game server and active status
  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_shoplisting_active 
    ON "shopListing" (domain, "gameServerId")
    WHERE "deletedAt" IS NULL AND draft = false
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP INDEX IF EXISTS idx_shoporder_analytics');
  await knex.raw('DROP INDEX IF EXISTS idx_shoporder_listing_date');
  await knex.raw('DROP INDEX IF EXISTS idx_shoporder_player_analytics');
  await knex.raw('DROP INDEX IF EXISTS idx_shoplisting_composite');
  await knex.raw('DROP INDEX IF EXISTS idx_shoplisting_active');
}