import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('items', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid ()'));
    table.timestamps(true, true, true);
    table.string('domain').references('domains.id').onDelete('CASCADE').notNullable();
    table.uuid('gameserverId').references('gameservers.id').onDelete('CASCADE').notNullable();
    table.string('name').notNullable();
    table.string('code').notNullable();
    table.text('description').nullable();
    table.text('icon').nullable();
    // Add index on code since we'll use that in queries a lot
    table.index('code');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('items');
}
