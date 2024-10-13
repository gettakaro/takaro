import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('functions', (table) => {
    table.index('moduleId');
  });
  await knex.schema.alterTable('commands', (table) => {
    table.index('moduleId');
  });
  await knex.schema.alterTable('hooks', (table) => {
    table.index('moduleId');
  });
  await knex.schema.alterTable('permission', (table) => {
    table.index('moduleId');
  });
  await knex.schema.alterTable('cronJobs', (table) => {
    table.index('moduleId');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('functions', (table) => {
    table.dropIndex('moduleId');
  });
  await knex.schema.alterTable('commands', (table) => {
    table.dropIndex('moduleId');
  });
  await knex.schema.alterTable('hooks', (table) => {
    table.dropIndex('moduleId');
  });
  await knex.schema.alterTable('permission', (table) => {
    table.dropIndex('moduleId');
  });
  await knex.schema.alterTable('cronJobs', (table) => {
    table.dropIndex('moduleId');
  });
}
