import ms from 'ms';
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('variables', (table) => {
    table.timestamp('expiresAt').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('variables', (table) => {
    table.dropColumn('expiresAt');
  });
}
