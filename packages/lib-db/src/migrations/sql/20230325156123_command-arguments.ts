import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('commandArguments', async (table) => {
    table.timestamps(true, true, true);
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid ()'));
    table.string('name').notNullable();
    table.string('type').defaultTo('string').notNullable();
    table.string('helpText');
    table.string('defaultValue');
    table.smallint('position').notNullable();

    table
      .uuid('commandId')
      .references('commands.id')
      .onDelete('CASCADE')
      .notNullable();

    table
      .string('domain')
      .references('domains.id')
      .onDelete('CASCADE')
      .notNullable();

    table.unique(['name', 'commandId', 'domain']);
    table.unique(['position', 'commandId', 'domain']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('commandArguments');
}
