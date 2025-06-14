import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Add dimension column to playerOnGameServer table
  await knex.schema.alterTable('playerOnGameServer', (table) => {
    table.string('dimension').nullable();
  });

  // Add dimension column to playerLocation table
  await knex.schema.alterTable('playerLocation', (table) => {
    table.string('dimension').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  // Remove dimension column from playerOnGameServer table
  await knex.schema.alterTable('playerOnGameServer', (table) => {
    table.dropColumn('dimension');
  });

  // Remove dimension column from playerLocation table
  await knex.schema.alterTable('playerLocation', (table) => {
    table.dropColumn('dimension');
  });
}
