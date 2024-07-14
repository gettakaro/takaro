import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('shopOrder', (table) => {
    table.timestamps(true, true, true);
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid ()'));
    table.string('domain').references('domains.id').onDelete('CASCADE').notNullable();
    table.index('domain');

    table.uuid('listingId').references('shopListing.id').onDelete('CASCADE').notNullable();
    table.uuid('userId').references('users.id').onDelete('CASCADE').notNullable();

    table.integer('amount').defaultTo(1).notNullable();
    table.enum('status', ['COMPLETED', 'PAID', 'CANCELED']).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('shopOrder');
}
