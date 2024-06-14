import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.timestamp('lastSeen').defaultTo(knex.fn.now()).notNullable();
  });

  await knex.schema.alterTable('playerOnGameServer', (table) => {
    table.timestamp('lastSeen').defaultTo(knex.fn.now()).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('lastSeen');
  });

  await knex.schema.alterTable('playerOnGameServer', (table) => {
    table.dropColumn('lastSeen');
  });
}
