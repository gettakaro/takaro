import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('hooks', (table) => {
    table.uuid('function').references('functions.id').onDelete('CASCADE');
  });

  await knex.schema.alterTable('commands', (table) => {
    table.uuid('function').references('functions.id').onDelete('CASCADE');
  });

  await knex.schema.alterTable('cronJobs', (table) => {
    table.uuid('function').references('functions.id').onDelete('CASCADE');
  });

  await knex.schema.dropTable('functionAssignments');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.createTable('functionAssignments', (table) => {
    table.timestamps(true, true, true);
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid ()'));
    table
      .uuid('function')
      .references('functions.id')
      .onDelete('CASCADE')
      .notNullable()
      .unique();
    table.uuid('cronJob').references('cronJobs.id').onDelete('CASCADE');
    table.uuid('hook').references('hooks.id').onDelete('CASCADE');
    table.uuid('command').references('commands.id').onDelete('CASCADE');
    table.check('(?? IS NOT NULL) OR (?? IS NOT NULL) OR (?? IS NOT NULL)', [
      'cronJob',
      'hook',
      'command',
    ]);
  });

  await knex.schema.alterTable('cronJobs', (table) => {
    table.dropColumn('function');
  });

  await knex.schema.alterTable('commands', (table) => {
    table.dropColumn('function');
  });

  await knex.schema.alterTable('hooks', (table) => {
    table.dropColumn('function');
  });
}
