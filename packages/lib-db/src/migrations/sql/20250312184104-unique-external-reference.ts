import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('domains', (table) => {
    table.unique(['externalReference']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('domains', (table) => {
    table.dropUnique(['externalReference']);
  });
}
