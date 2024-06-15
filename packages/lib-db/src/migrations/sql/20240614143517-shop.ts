import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('shopListing', (table) => {
    table.timestamps(true, true, true);
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid ()'));
    table.string('domain').references('domains.id').onDelete('CASCADE').notNullable();
    table.index('domain');

    table.uuid('gameServerId').references('gameservers.id').onDelete('CASCADE').notNullable();

    table.uuid('itemId').references('items.id').onDelete('CASCADE');
    table.uuid('functionId').references('functions.id').onDelete('CASCADE');

    // Either an item or a function must be set
    table.check('("itemId" IS NOT NULL) OR ("functionId" IS NOT NULL)');

    table.integer('price').notNullable();

    // Price must be positive and non-zero
    table.check('"price" > 0');

    table.string('name').nullable();
  });

  // Listings can only be bought by users with the role
  await knex.schema.createTable('shopListingRole', (table) => {
    table.timestamps(true, true, true);
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid ()'));

    table.uuid('listingId').references('shopListing.id').onDelete('CASCADE').notNullable();
    table.uuid('roleId').references('roles.id').onDelete('CASCADE').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('shopListingRole');
  await knex.schema.dropTable('shopListing');
}
