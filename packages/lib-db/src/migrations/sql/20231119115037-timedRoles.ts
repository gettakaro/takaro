import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('roleOnPlayer', (table) => {
    table.timestamp('expiresAt').nullable();
  });

  await knex.schema.alterTable('roleOnUser', (table) => {
    table.timestamp('expiresAt').nullable();
    table.uuid('id').defaultTo(knex.raw('gen_random_uuid ()'));
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('roleOnPlayer', (table) => {
    table.dropColumn('expiresAt');
  });

  await knex.schema.alterTable('roleOnUser', (table) => {
    table.dropColumn('expiresAt');
    table.dropColumn('id');
  });
}
