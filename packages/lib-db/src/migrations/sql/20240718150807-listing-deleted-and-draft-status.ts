import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('shopListing', (table) => {
    table.timestamp('deletedAt').nullable();
    table.boolean('draft').defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('shopListing', (table) => {
    table.dropColumn('deletedAt');
    table.dropColumn('draft');
  });
}
