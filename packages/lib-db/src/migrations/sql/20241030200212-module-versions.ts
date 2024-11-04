import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create a new table for module versions
  await knex.schema.createTable('moduleVersions', (table) => {
    table.timestamps(true, true, true);
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid ()'));
    table.string('domain').references('domains.id').onDelete('CASCADE').notNullable();
    table.index('domain');
    table.uuid('moduleId').notNullable().references('modules.id').onDelete('CASCADE');
    table.string('tag').notNullable().defaultTo('0.0.1');
    table.unique(['moduleId', 'tag']);

    table.text('description').nullable();
    table.text('configSchema').nullable();
    table.text('uiSchema').nullable();
  });

  // Copy over all existing modules
  const modules = await knex('modules').select('id', 'domain', 'description', 'configSchema', 'uiSchema');
  for (const mod of modules) {
    await knex('moduleVersions').insert({
      domain: mod.domain,
      moduleId: mod.id,
      description: mod.description,
      configSchema: mod.configSchema,
      uiSchema: mod.uiSchema,
      tag: 'latest',
    });
  }

  // Delete the old columns
  await knex.schema.table('modules', (table) => {
    table.dropColumn('description');
    table.dropColumn('configSchema');
    table.dropColumn('uiSchema');
  });

  // Rename table moduleAssignments to moduleInstallations
  await knex.schema.renameTable('moduleAssignments', 'moduleInstallations');

  // Prepare versionId column in moduleInstallations
  await knex.schema.table('moduleInstallations', (table) => {
    table.uuid('versionId');
  });

  // For each module installation, find the latest version and set it as the versionId
  // There's a lot of installs, so we'll do this in batches
  const batchSize = 100;
  let offset = 0;
  let installs;
  do {
    installs = await knex('moduleInstallations').select('id', 'moduleId').limit(batchSize).offset(offset);
    for (const install of installs) {
      const latestVersion = await knex('moduleVersions').select('id').where('moduleId', install.moduleId).orderBy('createdAt', 'desc').first();
      await knex('moduleInstallations').where('id', install.id).update({ versionId: latestVersion.id });
    }
    offset += batchSize;
  } while (installs.length === batchSize);

  // Set versionId as not nullable and add foreign key constraint
  await knex.schema.alterTable('moduleInstallations', (table) => {
    table.uuid('versionId').notNullable().alter();
    table.foreign('versionId').references('moduleVersions.id').onDelete('CASCADE');
  });

  // Now, we also need to move the commands,hooks and cronjobs to the moduleVersions table
  // Currently, they have an FK to modules, but we need to replace them with moduleVersions
  // Same logic here, let's just link all of them to the latest version of the module (which is the only one that should exist)

  // First, let's remove the old FKs
  // And add a new column for the versionId
  await knex.schema.alterTable('commands', (table) => {
    table.dropForeign('moduleId');
    table.uuid('versionId');
  });

  await knex.schema.alterTable('hooks', (table) => {
    table.dropForeign('moduleId');
    table.uuid('versionId');
  });

  await knex.schema.alterTable('cronJobs', (table) => {
    table.dropForeign('moduleId');
    table.uuid('versionId');
  });

  await knex.schema.alterTable('permission', (table) => {
    table.dropForeign('moduleId', 'modulepermission_moduleid_foreign');
    table.uuid('moduleVersionId');
  });

  await knex.schema.alterTable('functions', (table) => {
    table.dropForeign('moduleId');
    table.uuid('versionId');
  });

  offset = 0;
  let commands;
  do {
    commands = await knex('commands').select('id', 'moduleId').limit(batchSize).offset(offset);
    for (const command of commands) {
      const latestVersion = await knex('moduleVersions').select('id').where('moduleId', command.moduleId).orderBy('createdAt', 'desc').first();
      await knex('commands').where('id', command.id).update({ versionId: latestVersion.id });
    }
    offset += batchSize;
  } while (commands.length === batchSize);

  offset = 0;
  let hooks;
  do {
    hooks = await knex('hooks').select('id', 'moduleId').limit(batchSize).offset(offset);
    for (const hook of hooks) {
      const latestVersion = await knex('moduleVersions').select('id').where('moduleId', hook.moduleId).orderBy('createdAt', 'desc').first();
      await knex('hooks').where('id', hook.id).update({ versionId: latestVersion.id });
    }
    offset += batchSize;
  } while (hooks.length === batchSize);

  offset = 0;
  let cronjobs;
  do {
    cronjobs = await knex('cronJobs').select('id', 'moduleId').limit(batchSize).offset(offset);
    for (const cronjob of cronjobs) {
      const latestVersion = await knex('moduleVersions').select('id').where('moduleId', cronjob.moduleId).orderBy('createdAt', 'desc').first();
      await knex('cronJobs').where('id', cronjob.id).update({ versionId: latestVersion.id });
    }
    offset += batchSize;
  } while (cronjobs.length === batchSize);

  offset = 0;
  let permissions;
  do {
    permissions = await knex('permission').select('id', 'moduleId').limit(batchSize).offset(offset);
    for (const permission of permissions) {
      if (!permission.moduleId) {
        // Not a module scoped permission, so skip
        continue;
      }
      const latestVersion = await knex('moduleVersions').select('id').where('moduleId', permission.moduleId).orderBy('createdAt', 'desc').first();
      await knex('permission').where('id', permission.id).update({ moduleVersionId: latestVersion.id });
    }
    offset += batchSize;
  } while (permissions.length === batchSize);

  offset = 0;
  let functions;
  do {
    functions = await knex('functions').select('id', 'moduleId').limit(batchSize).offset(offset);
    for (const func of functions) {
      if (!func.moduleId) {
        // Not module scoped, so skip
        continue;
      }
      const latestVersion = await knex('moduleVersions').select('id').where('moduleId', func.moduleId).orderBy('createdAt', 'desc').first();
      await knex('functions').where('id', func.id).update({ versionId: latestVersion.id });
    }
    offset += batchSize;
  } while (functions.length === batchSize);

  // Finally, let's drop old columns and ensure new FK is in place
  await knex.schema.alterTable('commands', (table) => {
    table.dropColumn('moduleId');
    table.uuid('versionId').notNullable().alter();
    table.foreign('versionId').references('moduleVersions.id').onDelete('CASCADE');
  });

  await knex.schema.alterTable('hooks', (table) => {
    table.dropColumn('moduleId');
    table.uuid('versionId').notNullable().alter();
    table.foreign('versionId').references('moduleVersions.id').onDelete('CASCADE');
  });

  await knex.schema.alterTable('cronJobs', (table) => {
    table.dropColumn('moduleId');
    table.uuid('versionId').notNullable().alter();
    table.foreign('versionId').references('moduleVersions.id').onDelete('CASCADE');
  });

  await knex.schema.alterTable('permission', (table) => {
    table.dropColumn('moduleId');
    table.uuid('moduleVersionId').nullable().alter();
    table.foreign('moduleVersionId').references('moduleVersions.id').onDelete('CASCADE');
  });

  await knex.schema.alterTable('functions', (table) => {
    table.dropColumn('moduleId');
    table.uuid('versionId').nullable().alter();
    table.foreign('versionId').references('moduleVersions.id').onDelete('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
  // Remove the FKs from commands, hooks and cronjobs
  await knex.schema.alterTable('commands', (table) => {
    table.dropForeign('versionId');
  });

  await knex.schema.alterTable('hooks', (table) => {
    table.dropForeign('versionId');
  });

  await knex.schema.alterTable('cronJobs', (table) => {
    table.dropForeign('versionId');
  });

  await knex.schema.alterTable('permission', (table) => {
    table.dropForeign('moduleVersionId');
  });

  await knex.schema.alterTable('functions', (table) => {
    table.dropForeign('versionId');
  });

  // Drop the new columns
  await knex.schema.alterTable('moduleInstallations', (table) => {
    table.dropForeign('versionId');
    table.dropColumn('versionId');
  });

  // Rename table moduleInstallations to moduleAssignments
  await knex.schema.renameTable('moduleInstallations', 'moduleAssignments');

  // Add back the old columns
  await knex.schema.table('modules', (table) => {
    table.text('description').nullable();
    table.text('configSchema').nullable();
    table.text('uiSchema').nullable();
  });

  // Add the old column back
  await knex.schema.alterTable('commands', (table) => {
    table.uuid('moduleId');
  });

  await knex.schema.alterTable('hooks', (table) => {
    table.uuid('moduleId');
  });

  await knex.schema.alterTable('cronJobs', (table) => {
    table.uuid('moduleId');
  });

  await knex.schema.alterTable('permission', (table) => {
    table.uuid('moduleId').nullable();
  });

  await knex.schema.alterTable('functions', (table) => {
    table.uuid('moduleId').nullable();
  });

  // Copy over the latest version of each module
  const versions = await knex('moduleVersions').select('id', 'moduleId', 'createdAt', 'description', 'configSchema', 'uiSchema').distinct('moduleId').orderBy('createdAt', 'desc');
  for (const version of versions) {
    await knex('modules').where('id', version.moduleId).update({
      description: version.description,
      configSchema: version.configSchema,
      uiSchema: version.uiSchema,
    });

    // Copy over the commands, hooks, cronjobs and permissions
    const commands = await knex('commands').select('id').where('versionId', version.id);
    for (const command of commands) {
      await knex('commands').where('id', command.id).update({ moduleId: version.moduleId });
    }

    const hooks = await knex('hooks').select('id').where('versionId', version.id);
    for (const hook of hooks) {
      await knex('hooks').where('id', hook.id).update({ moduleId: version.moduleId });
    }

    const cronjobs = await knex('cronJobs').select('id').where('versionId', version.id);
    for (const cronjob of cronjobs) {
      await knex('cronJobs').where('id', cronjob.id).update({ moduleId: version.moduleId });
    }

    const permissions = await knex('permission').select('id').where('moduleVersionId', version.id);
    for (const permission of permissions) {
      await knex('permission').where('id', permission.id).update({ moduleId: version.moduleId });
    }

    const functions = await knex('functions').select('id').where('versionId', version.id);
    for (const func of functions) {
      await knex('functions').where('id', func.id).update({ moduleId: version.moduleId });
    }
  }

  // Enable the old FKs
  await knex.schema.alterTable('commands', (table) => {
    table.foreign('moduleId').references('modules.id').onDelete('CASCADE');
    table.dropColumn('versionId');
  });

  await knex.schema.alterTable('hooks', (table) => {
    table.foreign('moduleId').references('modules.id').onDelete('CASCADE');
    table.dropColumn('versionId');
  });

  await knex.schema.alterTable('cronJobs', (table) => {
    table.foreign('moduleId').references('modules.id').onDelete('CASCADE');
    table.dropColumn('versionId');
  });

  await knex.schema.alterTable('permission', (table) => {
    table.foreign('moduleId', 'modulepermission_moduleid_foreign').references('modules.id').onDelete('CASCADE');
    table.dropColumn('moduleVersionId');
  });

  await knex.schema.alterTable('functions', (table) => {
    table.foreign('moduleId').references('modules.id').onDelete('CASCADE');
    table.dropColumn('versionId');
  });

  // Drop the moduleVersions table
  await knex.schema.dropTable('moduleVersions');
}
