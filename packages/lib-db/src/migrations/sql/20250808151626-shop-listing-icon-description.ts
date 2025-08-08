import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Add icon and description columns to shopListing table
  await knex.schema.alterTable('shopListing', (table) => {
    table.text('icon').nullable();
    table.text('description').nullable();
  });

  // Add length constraints following existing patterns from 20250305210650-more-module-metadata.ts
  // Icon constraint: 350000 characters to accommodate 250KB image + Base64 overhead + data URI header
  await knex.raw('ALTER TABLE "shopListing" ADD CONSTRAINT icon_length_check CHECK (length(icon) <= 350000)');

  // Description constraint: 500 characters as per requirements
  await knex.raw(
    'ALTER TABLE "shopListing" ADD CONSTRAINT description_length_check CHECK (length(description) <= 500)',
  );
}

export async function down(knex: Knex): Promise<void> {
  // Remove constraints first
  await knex.raw('ALTER TABLE "shopListing" DROP CONSTRAINT IF EXISTS icon_length_check');
  await knex.raw('ALTER TABLE "shopListing" DROP CONSTRAINT IF EXISTS description_length_check');

  // Remove columns
  await knex.schema.alterTable('shopListing', (table) => {
    table.dropColumn('icon');
    table.dropColumn('description');
  });
}
