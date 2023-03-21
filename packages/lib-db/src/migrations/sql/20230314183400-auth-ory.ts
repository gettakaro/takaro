import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', async (table) => {
    table.dropColumn('password');
    table.dropColumn('email');
    table.string('idpId').notNullable().unique();
  });

  await knex.schema.renameTable('capabilityOnRole', 'permissionOnRole');
  await knex.schema.table('permissionOnRole', async (table) => {
    table.renameColumn('capability', 'permission');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', async (table) => {
    table.string('password');
    table.string('email').unique();
    table.dropColumn('idpId');
  });

  await knex.schema.renameTable('permissionOnRole', 'capabilityOnRole');
  await knex.schema.table('capabilityOnRole', async (table) => {
    table.renameColumn('permission', 'capability');
  });
}
