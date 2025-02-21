import { Knex } from 'knex';

/**
 * Alters the variables.value column from varchat to text
 * Reason being is that users frequently want to store strings longer than 255 characters
 * And length of this doesn't really matter for us...
 * We still add a constraint to ensure that there's an upper bound
 * Otherwise, users could upload 1TB of data to a single variable and crash postgres :)
 */

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('variables', (table) => {
    // Alter column type to text
    table.text('value').alter();
  });

  // Add CHECK constraint to prevent extremely large values (128KB)
  await knex.raw('ALTER TABLE variables ADD CONSTRAINT value_length_check CHECK (length(value) <= 131072)');
}

/**
 * Reverts the variables.value column back to varchar(255)
 * Removes the CHECK constraint
 *
 * @param knex Knex instance
 */
export async function down(knex: Knex): Promise<void> {
  // Remove CHECK constraint first
  await knex.raw('ALTER TABLE variables DROP CONSTRAINT value_length_check');

  await knex.schema.alterTable('variables', (table) => {
    // Revert column type to varchar(255)
    table.string('value', 255).alter();
  });
}
