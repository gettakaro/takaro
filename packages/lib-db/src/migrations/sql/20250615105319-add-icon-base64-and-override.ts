import { Knex } from 'knex';

/**
 * Add base64 icon storage and override flag to items table
 * - Rename existing 'icon' column to 'iconId' for clarity
 * - Add 'iconBase64' column to store base64 encoded icon data
 * - Add 'iconOverride' column to flag when user has uploaded custom icon
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('items', (table) => {
    // Rename existing icon column to iconId
    table.renameColumn('icon', 'iconId');

    // Add new columns for base64 icon storage
    table.text('iconBase64').nullable();
    table.boolean('iconOverride').defaultTo(false).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('items', (table) => {
    // Remove the new columns
    table.dropColumn('iconBase64');
    table.dropColumn('iconOverride');

    // Rename iconId back to icon
    table.renameColumn('iconId', 'icon');
  });
}
