import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('playerInventory', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid ()'));
    table.timestamps(true, true, true);
    table.string('domain').references('domains.id').onDelete('CASCADE').notNullable();
    table.uuid('playerId').references('playerOnGameServer.id').onDelete('CASCADE').notNullable();
    table.uuid('itemId').references('items.id').onDelete('CASCADE').notNullable();
    table.integer('quantity').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('playerInventory');
}
