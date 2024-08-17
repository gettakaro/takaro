import { Knex } from 'knex';
import { formatAlterTableEnumSql } from '../util/alterEnum.js';

export async function up(knex: Knex): Promise<void> {
  await knex.raw('ALTER TABLE "permissionOnRole" DROP CONSTRAINT IF EXISTS "capabilityOnRole_capability_check";');

  await knex.schema.createTable('roleOnPlayer', (table) => {
    table.timestamps(true, true, true);
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid ()'));
    table.uuid('playerId').references('players.id').onDelete('CASCADE').notNullable();
    table.uuid('roleId').references('roles.id').onDelete('CASCADE').notNullable();
    table.uuid('gameServerId').references('gameservers.id').onDelete('CASCADE').nullable();
  });

  await knex.schema.createTable('modulePermission', (table) => {
    table.timestamps(true, true, true);
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid ()'));
    table.uuid('moduleId').references('modules.id').onDelete('CASCADE').notNullable();
    table.string('permission').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(
    formatAlterTableEnumSql('permissionOnRole', 'permission', [
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

  await knex.schema.dropTable('roleOnPlayer');
  await knex.schema.dropTable('modulePermission');
}
