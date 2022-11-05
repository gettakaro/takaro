import { Knex } from 'knex';
import { formatAlterTableEnumSql } from '../util/alterEnum';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('settings', (table) => {
    table.timestamps(true, true, true);
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid ()'));
    table.string('domainId').unique();
    table.string('commandPrefix');
    table.string('serverChatName');
  });

  await knex.schema.createTable('gameServerSettings', (table) => {
    table.inherits('settings');
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid ()'));
    table
      .uuid('gameServerId')
      .references('gameservers.id')
      .onDelete('CASCADE')
      .notNullable()
      .unique();
  });

  await knex.raw(
    formatAlterTableEnumSql('capabilityOnRole', 'capability', [
      'ROOT',
      'MANAGE_USERS',
      'READ_USERS',
      'MANAGE_ROLES',
      'READ_ROLES',
      'MANAGE_GAMESERVERS',
      'READ_GAMESERVERS',
      'READ_FUNCTIONS',
      'MANAGE_FUNCTIONS',
      'READ_CRONJOBS',
      'MANAGE_CRONJOBS',
      'READ_HOOKS',
      'MANAGE_HOOKS',
      'READ_MODULES',
      'MANAGE_MODULES',
      'READ_PLAYERS',
      'MANAGE_PLAYERS',
      'MANAGE_SETTINGS',
      'READ_SETTINGS',
    ])
  );
}

export async function down(knex: Knex): Promise<void> {
  knex.schema.dropTable('gameServerSettings');
  knex.schema.dropTable('settings');

  await knex.raw(
    formatAlterTableEnumSql('capabilityOnRole', 'capability', [
      'ROOT',
      'MANAGE_USERS',
      'READ_USERS',
      'MANAGE_ROLES',
      'READ_ROLES',
      'MANAGE_GAMESERVERS',
      'READ_GAMESERVERS',
      'READ_FUNCTIONS',
      'MANAGE_FUNCTIONS',
      'READ_CRONJOBS',
      'MANAGE_CRONJOBS',
      'READ_HOOKS',
      'MANAGE_HOOKS',
      'READ_MODULES',
      'MANAGE_MODULES',
      'READ_PLAYERS',
      'MANAGE_PLAYERS',
    ])
  );
}
