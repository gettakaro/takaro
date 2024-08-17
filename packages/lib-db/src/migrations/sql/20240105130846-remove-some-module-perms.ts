import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // All perms to-be-deleted
  const readPermissions = ['READ_FUNCTIONS', 'READ_CRONJOBS', 'READ_HOOKS', 'READ_COMMANDS'];

  const managePermissions = ['MANAGE_FUNCTIONS', 'MANAGE_CRONJOBS', 'MANAGE_HOOKS', 'MANAGE_COMMANDS'];

  // First, find all permissions that are to be deleted
  const readPerms = await knex('permission').whereIn('permission', readPermissions).select('id');

  const managePerms = await knex('permission').whereIn('permission', managePermissions).select('id');

  // Then, find the READ_MODULES and MANAGE_MODULES permissions
  const readModulePerm = await knex('permission').where('permission', 'READ_MODULES').select('id').first();

  const manageModulePerm = await knex('permission').where('permission', 'MANAGE_MODULES').select('id').first();

  // Then, find all permissionOnRole entries that reference those permissions
  const readPermissionOnRole = await knex('permissionOnRole')
    .whereIn(
      'permissionId',
      readPerms.map((p) => p.id),
    )
    .select('id');

  const managePermissionOnRole = await knex('permissionOnRole')
    .whereIn(
      'permissionId',
      managePerms.map((p) => p.id),
    )
    .select('id');

  // Then, update the permissionOnRole entries to reference the new permissions
  await knex('permissionOnRole')
    .whereIn(
      'id',
      readPermissionOnRole.map((p) => p.id),
    )
    .update({
      permissionId: readModulePerm.id,
    });

  await knex('permissionOnRole')
    .whereIn(
      'id',
      managePermissionOnRole.map((p) => p.id),
    )
    .update({
      permissionId: manageModulePerm.id,
    });

  // Then, delete the old perms
  await knex('permission')
    .whereIn('permission', [...readPermissions, ...managePermissions])
    .del();
}

export async function down(knex: Knex): Promise<void> {
  // Cant actually undo this, we deleted the data (:
  // Just put back the old perms
  await knex('permission').insert([
    {
      permission: 'READ_FUNCTIONS',
      description: 'Read functions',
      friendlyName: 'Read Functions',
    },
    {
      permission: 'READ_CRONJOBS',
      description: 'Read cronjobs',
      friendlyName: 'Read Cronjobs',
    },
    {
      permission: 'READ_HOOKS',
      description: 'Read hooks',
      friendlyName: 'Read Hooks',
    },
    {
      permission: 'READ_COMMANDS',
      description: 'Read commands',
      friendlyName: 'Read Commands',
    },
    {
      permission: 'MANAGE_FUNCTIONS',
      description: 'Manage functions',
      friendlyName: 'Manage Functions',
    },
    {
      permission: 'MANAGE_CRONJOBS',
      description: 'Manage cronjobs',
      friendlyName: 'Manage Cronjobs',
    },
    {
      permission: 'MANAGE_HOOKS',
      description: 'Manage hooks',
      friendlyName: 'Manage Hooks',
    },
    {
      permission: 'MANAGE_COMMANDS',
      description: 'Manage commands',
      friendlyName: 'Manage Commands',
    },
  ]);
}
