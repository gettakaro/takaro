import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.string('steamId').nullable();
    // Should be unique per domain, not globally
    table.unique(['steamId', 'domain']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.dropUnique(['steamId', 'domain']);
    table.dropColumn('steamId');
  });
}
