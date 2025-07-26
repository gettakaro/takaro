import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create composite index for efficient stock filtering
  await knex.schema.alterTable('shopListing', (table) => {
    table.index(['stockEnabled', 'stock'], 'idx_shopListing_stock');
  });

  // Create partial index for stock-enabled listings
  await knex.raw(`
    CREATE INDEX idx_shopListing_stockEnabled_true 
    ON "shopListing" ("stock") 
    WHERE "stockEnabled" = true AND "deletedAt" IS NULL
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('shopListing', (table) => {
    table.dropIndex(['stockEnabled', 'stock'], 'idx_shopListing_stock');
  });

  await knex.raw('DROP INDEX IF EXISTS idx_shopListing_stockEnabled_true');
}
