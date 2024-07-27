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
      'READ_VARIABLES',
      'MANAGE_VARIABLES',
    ]),
  );

  await knex.schema.createTable('variables', (table) => {
    table.timestamps(true, true, true);
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid ()'));

    table.string('key').notNullable();
    table.string('value').notNullable();

    table.string('domain').references('domains.id').onDelete('CASCADE').notNullable();

    table.unique(['key', 'domain']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('variables');

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
}
