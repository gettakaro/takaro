import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('domains', (table) => {
    table.timestamps(true, true, true);
    table.string('id').primary();
    table.string('name').unique();
  });

  await knex.schema.createTable('logins', (table) => {
    table.timestamps(true, true, true);
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid ()'));
    table.string('email').unique();
    table.uuid('userId').unique();
    table
      .string('domain')
      .references('domains.id')
      .onDelete('CASCADE')
      .notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('domains');
}
