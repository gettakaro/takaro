import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('domains', (table) => {
    table.integer('maxGameservers').defaultTo(1);
    table.integer('maxUsers').defaultTo(1);
    table.integer('eventRetentionDays').defaultTo(7);
    table.integer('maxVariables').defaultTo(10000);
    table.integer('maxModules').defaultTo(1000);
    table.integer('maxFunctionsInModule').defaultTo(50);
  });

  await knex.schema.alterTable('users', (table) => {
    table.boolean('isDashboardUser').defaultTo(false);
  });

  /**
   * We need to find all the 'root' users and make them dashboard users. Root users have name === 'root'
   * Also, we need to find any users with the "ROOT"" permission and make them dashboard users
   */
  await knex('users').where('name', 'root').update({ isDashboardUser: true });

  // Then update users with ROOT permission
  const usersWithRootPermission = await knex('users as u')
    .distinct('u.id')
    .join('roleOnUser as ru', 'u.id', 'ru.userId')
    .join('permissionOnRole as pr', 'ru.roleId', 'pr.roleId')
    .join('permission as p', 'pr.permissionId', 'p.id')
    .where('p.permission', 'ROOT')
    .select('u.id');

  if (usersWithRootPermission.length > 0) {
    await knex('users')
      .whereIn(
        'id',
        usersWithRootPermission.map((user) => user.id),
      )
      .update({ isDashboardUser: true });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('domains', (table) => {
    table.dropColumn('maxGameservers');
    table.dropColumn('maxUsers');
    table.dropColumn('eventRetentionDays');
    table.dropColumn('maxVariables');
    table.dropColumn('maxModules');
    table.dropColumn('maxFunctionsInModule');
  });

  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('isDashboardUser');
  });
}
