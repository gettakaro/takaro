import { Knex } from 'knex';
import { formatAlterTableEnumSql } from '../util/alterEnum.js';

export async function up(knex: Knex): Promise<void> {
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
      'READ_COMMANDS',
      'MANAGE_COMMANDS',
    ]),
  );

  await knex.schema.alterTable('commands', (table) => {
    table.text('trigger');
    table.text('helpText').defaultTo('No help text available');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('commands', (table) => {
    table.dropColumn('trigger');
    table.dropColumn('helpText');
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
    ]),
  );
}
