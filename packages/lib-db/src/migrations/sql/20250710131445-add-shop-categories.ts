import { Knex } from 'knex';

const SHOP_CATEGORY_TABLE_NAME = 'shopCategory';
const SHOP_LISTING_CATEGORY_TABLE_NAME = 'shopListingCategory';

const DEFAULT_CATEGORIES = [
  { name: 'Weapons', emoji: '⚔️' },
  { name: 'Armor', emoji: '🛡️' },
  { name: 'Building', emoji: '🏗️' },
  { name: 'Tools', emoji: '🔧' },
  { name: 'Consumables', emoji: '💊' },
  { name: 'Resources', emoji: '📦' },
  { name: 'Base', emoji: '🏠' },
  { name: 'Vehicles', emoji: '🚗' },
];

export async function up(knex: Knex): Promise<void> {
  // Create shopCategory table (hierarchical categories)
  await knex.schema.createTable(SHOP_CATEGORY_TABLE_NAME, (table) => {
    table.timestamps(true, true, true);
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid ()'));
    table.string('domain').references('domains.id').onDelete('CASCADE').notNullable();
    table.string('name', 50).notNullable();
    table.string('emoji', 10).notNullable();
    table.uuid('parentId').nullable();

    // Add self-referencing foreign key for parent category
    table.foreign('parentId').references('id').inTable(SHOP_CATEGORY_TABLE_NAME).onDelete('SET NULL');

    // Indexes for performance
    table.index('domain');
    table.index('parentId');
    table.index(['domain', 'name']);
  });

  // Add case-insensitive unique constraint on domain + name
  await knex.raw(`
    CREATE UNIQUE INDEX shopCategory_domain_name_unique 
    ON "${SHOP_CATEGORY_TABLE_NAME}" ("domain", LOWER("name"))
  `);

  // Create shopListingCategory junction table (many-to-many)
  await knex.schema.createTable(SHOP_LISTING_CATEGORY_TABLE_NAME, (table) => {
    table.timestamps(true, true, true);
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid ()'));
    table.string('domain').references('domains.id').onDelete('CASCADE').notNullable();
    table.uuid('shopListingId').references('shopListing.id').onDelete('CASCADE').notNullable();
    table.uuid('shopCategoryId').references('shopCategory.id').onDelete('CASCADE').notNullable();

    // Indexes for performance
    table.index('domain');
    table.index('shopListingId');
    table.index('shopCategoryId');
    table.index(['shopListingId', 'shopCategoryId']);

    // Ensure a listing can only be in a category once
    table.unique(['shopListingId', 'shopCategoryId']);
  });

  // Insert default categories for all existing domains
  const domains = await knex('domains').select('id');

  for (const domain of domains) {
    const categoriesToInsert = DEFAULT_CATEGORIES.map((cat) => ({
      ...cat,
      domain: domain.id,
      parentId: null,
    }));

    // Insert categories, ignoring duplicates (in case some domains already have categories with these names)
    for (const category of categoriesToInsert) {
      const existing = await knex(SHOP_CATEGORY_TABLE_NAME)
        .where('domain', category.domain)
        .where('name', category.name)
        .whereNull('parentId')
        .first();

      if (!existing) {
        await knex(SHOP_CATEGORY_TABLE_NAME).insert(category);
      }
    }
  }
}

export async function down(knex: Knex): Promise<void> {
  // Remove default categories from all domains
  await knex(SHOP_CATEGORY_TABLE_NAME)
    .whereIn(
      'name',
      DEFAULT_CATEGORIES.map((c) => c.name),
    )
    .whereNull('parentId')
    .delete();

  // Drop tables in reverse dependency order
  await knex.schema.dropTable(SHOP_LISTING_CATEGORY_TABLE_NAME);
  await knex.schema.dropTable(SHOP_CATEGORY_TABLE_NAME);
}
