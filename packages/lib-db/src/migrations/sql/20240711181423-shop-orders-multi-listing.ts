import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('itemOnShopListing', (table) => {
    table.timestamps(true, true, true);
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid ()'));

    table.uuid('listingId').references('shopListing.id').onDelete('CASCADE').notNullable();
    table.uuid('itemId').references('items.id').onDelete('CASCADE');

    table.integer('amount').defaultTo(1).notNullable();
    // Amount must be positive and non-zero
    table.check('"amount" > 0');

    table.string('quality').nullable();
  });

  await knex.schema.alterTable('shopListing', (table) => {
    table.dropChecks('"shopListing_check"');
    table.dropColumn('functionId');
    table.dropColumn('itemId');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('shopListing', (table) => {
    table.uuid('itemId').references('items.id').onDelete('CASCADE');
    table.uuid('functionId').references('functions.id').onDelete('CASCADE');

    table.check('("itemId" IS NOT NULL) OR ("functionId" IS NOT NULL)');
  });

  await knex.schema.dropTable('itemOnShopListing');
}
