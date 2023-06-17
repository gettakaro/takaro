import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.string('discordId').nullable();
    // Should be unique per domain, not globally
    table.unique(['discordId', 'domain']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.dropUnique(['discordId', 'domain']);
    table.dropColumn('discordId');
  });
}
