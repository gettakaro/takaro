import { Knex } from 'knex';

/**
 * This migration adds author and supportedGames fields to the modules table
 * @param knex
 */

export async function up(knex: Knex): Promise<void> {
  // Add author column
  await knex.schema.alterTable('modules', (table) => {
    table.string('author').nullable();
  });

  // Add supportedGames column as JSON array
  await knex.schema.alterTable('modules', (table) => {
    table.json('supportedGames').defaultTo('["all"]');
  });

  // Update existing modules to have default values
  await knex('modules').update({
    author: 'Unknown',
    supportedGames: JSON.stringify(['all']),
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('modules', (table) => {
    table.dropColumn('author');
    table.dropColumn('supportedGames');
  });
}
