import ms from 'ms';
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('domains', (table) => {
    table.dropUnique(['name'], 'domains_name_unique');
  });
}

export async function down(knex: Knex): Promise<void> {
  // None, this is a one-way migration
}
