import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Set all listings w/o name to 'Unnamed'
  await knex('shopListing').whereNull('name').update({ name: 'Unnamed' });

  await knex.schema.alterTable('shopListing', (table) => {
    table.string('name').notNullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('shopListing', (table) => {
    table.string('name').nullable().alter();
  });
}
