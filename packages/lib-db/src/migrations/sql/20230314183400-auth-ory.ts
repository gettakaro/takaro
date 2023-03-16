import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', async (table) => {
    table.dropColumn('password');
    table.dropColumn('email');
    table.string('idpId').notNullable().unique();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', async (table) => {
    table.string('password');
    table.string('email').unique();
    table.dropColumn('idpId');
  });
}
