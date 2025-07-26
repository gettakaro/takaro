import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('shopListing', (table) => {
    table.boolean('stockManagementEnabled').defaultTo(false).notNullable();
    table.integer('stock').nullable();

    // Constraint following existing patterns
    table.check(
      `(("stockManagementEnabled" = false AND "stock" IS NULL) OR 
        ("stockManagementEnabled" = true AND "stock" >= 0))`,
      [],
      'stock_management_check',
    );
  });

  // Performance index following existing patterns
  await knex.raw(`
    CREATE INDEX idx_shop_listing_stock 
    ON "shopListing"("stockManagementEnabled", "stock") 
    WHERE "stockManagementEnabled" = true
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('shopListing', (table) => {
    table.dropColumn('stockManagementEnabled');
    table.dropColumn('stock');
  });
}
