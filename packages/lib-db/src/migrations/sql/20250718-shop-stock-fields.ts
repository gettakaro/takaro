import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('shopListing', (table) => {
    table.integer('stock').nullable();
    table.boolean('stockEnabled').defaultTo(false);
  });
  
  // Add check constraint with proper name
  await knex.raw('ALTER TABLE "shopListing" ADD CONSTRAINT "check_stock_non_negative" CHECK (stock >= 0)');
  
  // Set all existing listings to unlimited stock (stockEnabled = false)
  await knex('shopListing').update({
    stock: null,
    stockEnabled: false
  });
}

export async function down(knex: Knex): Promise<void> {
  // Drop the check constraint first
  await knex.raw('ALTER TABLE "shopListing" DROP CONSTRAINT IF EXISTS "check_stock_non_negative"');
  
  await knex.schema.alterTable('shopListing', (table) => {
    table.dropColumn('stock');
    table.dropColumn('stockEnabled');
  });
}