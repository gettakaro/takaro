import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('modulePermission', (table) => {
    table.boolean('canHaveCount').defaultTo(false);
    // drop not null constraint
    table.uuid('moduleId').nullable().alter();
  });

  await knex.schema.renameTable('modulePermission', 'permission');

  // Create default permissions
  const perms = [
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
  ];

  await knex('permission').insert(
    perms.map((perm) => ({
      permission: perm,
      canHaveCount: false,
    })),
  );

  await knex.schema.createTable('temp_permissiononrole', (table) => {
    table.timestamps(true, true, true);
    table.uuid('id').primary();
    table.uuid('roleId');
    table.string('permission');
    table.string('domain');
  });

  await knex.raw('INSERT INTO temp_permissiononrole SELECT * FROM "permissionOnRole"');

  await knex.schema.alterTable('permissionOnRole', (table) => {
    table.integer('count').defaultTo(0);
    table.uuid('permissionId').references('permission.id').onDelete('CASCADE').nullable();
  });

  await knex.raw(`
    UPDATE "permissionOnRole" AS por
    SET "permissionId" = p.id
    FROM "temp_permissiononrole" AS temp, "permission" AS p
    WHERE temp.id = por.id AND temp.permission = p.permission
  `);

  await knex.schema.alterTable('permissionOnRole', (table) => {
    table.dropColumn('permission');
    // make permissionId not nullable
    table.uuid('permissionId').notNullable().alter();
  });

  await knex.schema.dropTable('temp_permissiononrole');
}

export async function down(knex: Knex): Promise<void> {
  // Step 1: Re-create the original 'permission' column in 'permissionOnRole'
  await knex.schema.alterTable('permissionOnRole', (table) => {
    table.string('permission').nullable();
  });

  // Populate the original 'permission' based on 'permissionId'
  await knex.raw(`
    UPDATE "permissionOnRole" AS por
    SET "permission" = p.permission
    FROM "permission" AS p
    WHERE por."permissionId" = p.id
  `);

  // Step 2: Drop the new columns and constraints in 'permissionOnRole'
  await knex.schema.alterTable('permissionOnRole', (table) => {
    table.dropColumn('count');
    table.dropColumn('permissionId');
  });

  // Step 3: Rename the 'permission' table back to 'modulePermission'
  await knex.schema.renameTable('permission', 'modulePermission');

  // Step 4: Restore the original columns and constraints in 'modulePermission'
  await knex.schema.alterTable('modulePermission', (table) => {
    table.dropColumn('canHaveCount');
    table.uuid('moduleId').notNullable().alter(); // Re-add the NOT NULL constraint
  });
}
