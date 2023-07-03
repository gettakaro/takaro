import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('moduleAssignments', (table) => {
    table.timestamps(true, true, true);
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid ()'));
    table.json('config').defaultTo('{}');
    table.uuid('moduleId').references('modules.id').onDelete('CASCADE');
    table.uuid('gameserverId').references('gameservers.id').onDelete('CASCADE').notNullable();
    table.string('domain').references('domains.id').onDelete('CASCADE').notNullable();

    table.unique(['gameserverId', 'moduleId', 'domain']);
  });

  await knex.schema.alterTable('modules', (table) => {
    table.dropColumn('config');
    table.dropColumn('enabled');
    table.string('builtin').nullable();

    table.unique(['builtin', 'domain']);
  });

  await knex.schema.alterTable('commands', (table) => {
    table.dropColumn('enabled');
  });

  await knex.schema.alterTable('cronJobs', (table) => {
    table.dropColumn('enabled');
  });

  await knex.schema.alterTable('hooks', (table) => {
    table.dropColumn('enabled');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('modules', (table) => {
    table.boolean('enabled').notNullable().defaultTo(true);
    table.json('config').defaultTo('{}');
    table.dropColumn('builtin');
  });

  await knex.schema.alterTable('commands', (table) => {
    table.boolean('enabled');
  });

  await knex.schema.alterTable('cronJobs', (table) => {
    table.boolean('enabled');
  });

  await knex.schema.alterTable('hooks', (table) => {
    table.boolean('enabled');
  });

  await knex.schema.dropTable('moduleAssignments');
}
