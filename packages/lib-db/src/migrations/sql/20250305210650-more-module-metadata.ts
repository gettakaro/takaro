import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('hooks', (table) => {
    table.text('description').nullable();
  });

  await knex.schema.alterTable('commands', (table) => {
    table.text('description').nullable();
  });

  await knex.schema.alterTable('cronJobs', (table) => {
    table.text('description').nullable();
  });

  await knex.schema.alterTable('functions', (table) => {
    table.text('description').nullable();
  });

  await knex.raw('ALTER TABLE hooks ADD CONSTRAINT description_length_check CHECK (length(description) <= 131072)');
  await knex.raw('ALTER TABLE commands ADD CONSTRAINT description_length_check CHECK (length(description) <= 131072)');
  await knex.raw(
    'ALTER TABLE "cronJobs" ADD CONSTRAINT description_length_check CHECK (length(description) <= 131072)',
  );
  await knex.raw('ALTER TABLE functions ADD CONSTRAINT description_length_check CHECK (length(description) <= 131072)');
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('ALTER TABLE hooks DROP CONSTRAINT description_length_check');
  await knex.raw('ALTER TABLE commands DROP CONSTRAINT description_length_check');
  await knex.raw('ALTER TABLE "cronJobs" DROP CONSTRAINT description_length_check');
  await knex.raw('ALTER TABLE functions DROP CONSTRAINT description_length_check');

  await knex.schema.alterTable('hooks', (table) => {
    table.dropColumn('description');
  });

  await knex.schema.alterTable('commands', (table) => {
    table.dropColumn('description');
  });

  await knex.schema.alterTable('cronJobs', (table) => {
    table.dropColumn('description');
  });

  await knex.schema.alterTable('functions', (table) => {
    table.dropColumn('description');
  });
}
