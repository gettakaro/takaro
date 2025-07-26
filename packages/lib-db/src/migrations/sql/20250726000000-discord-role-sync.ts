import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Add linkedDiscordRoleId to roles table
  await knex.schema.alterTable('roles', (table) => {
    table.string('linkedDiscordRoleId').nullable();
    table.index('linkedDiscordRoleId');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('roles', (table) => {
    table.dropColumn('linkedDiscordRoleId');
  });
}
