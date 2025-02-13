import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create system domain for core/public modules
  await knex.raw(`
    INSERT INTO domains (id, name, state, "externalReference")
    VALUES ('takaro-system', 'System Domain', 'ACTIVE', 'system')
    ON CONFLICT (id) DO NOTHING
  `);

  // Add public registry columns to modules table
  await knex.schema.alterTable('modules', (table) => {
    table.boolean('isPublic').defaultTo(false);

    table
      .uuid('ownerId') // Module creator reference
      .references('id')
      .inTable('users')
      .nullable()
      .onDelete('SET NULL');

    table
      .timestamp('archivedAt') // Soft delete handling, Track unpublication/removal while preserving installs
      .nullable()
      .defaultTo(null);

    table.text('contact_info');
  });

  await knex.schema.alterTable('moduleVersions', (table) => {
    // Just some text where the module author can write about the changes in this version
    table.text('changelog').nullable();
  });

  /**
   * Builtin modules are copied into all domains at the moment, and we want to end up with a SINGLE set of core modules in the system domain.
   * So first, we find all builtin modules from the oldest domain and copy them to the system domain.
   * We move the modules and their versions to the system domain
   * Afterwards, we find all the installations of old builtin modules and update their FKs to point to the core modules in the system domain
   * We also change FKs for all related data (versions, commands, hooks, ...)
   * Finally, we can delete all the old builtin modules
   */

  // Step 1: Create system modules
  await knex.raw(`
    WITH distinct_builtins AS (
        SELECT DISTINCT ON (builtin) 
          id as original_id,
          builtin,
          name,
          "createdAt"
        FROM modules
        WHERE builtin IS NOT NULL
          AND domain != 'takaro-system'
        ORDER BY builtin, "createdAt" ASC
    ),
    inserted_modules AS (
        INSERT INTO modules (
          id,
          "createdAt",
          "updatedAt",
          name,
          domain,
          builtin,
          "isPublic",
          "ownerId",
          "archivedAt",
          "contact_info"
        )
        SELECT 
          gen_random_uuid(),
          NOW(),
          NOW(),
          name,
          'takaro-system',
          builtin,
          TRUE,
          NULL,
          NULL,
          'https://takaro.io'
        FROM distinct_builtins
        RETURNING id, builtin
    ),
    module_id_mapping AS (
        SELECT 
            db.original_id,
            im.id as new_id
        FROM distinct_builtins db
        JOIN inserted_modules im ON db.builtin = im.builtin
    )
    SELECT * INTO TEMPORARY TABLE module_mapping_result FROM module_id_mapping;
  `);

  // Step 2: Transfer module versions
  await knex.raw(`
    WITH versions_to_move AS (
      SELECT 
        mv.id,
        mv.tag,
        mv."moduleId" as old_module_id,
        mim.new_id as new_module_id,
        mv."createdAt",
        mv."updatedAt"
      FROM "moduleVersions" mv
      JOIN modules m ON mv."moduleId" = m.id
      JOIN module_mapping_result mim ON m.id = mim.original_id
      WHERE m.domain != 'takaro-system'
        AND m.builtin IS NOT NULL
    )
    -- Instead of creating new versions, update existing ones
    UPDATE "moduleVersions" mv
    SET "moduleId" = vtm.new_module_id, domain = 'takaro-system'
    FROM versions_to_move vtm
    WHERE mv.id = vtm.id;
  `);

  // Step 3: Update module installations to point to new system modules
  await knex.raw(`
    UPDATE "moduleInstallations" mi
    SET 
      "moduleId" = bmm.new_id,
      "versionId" = new_mv.id
    FROM "moduleVersions" old_mv, 
        module_mapping_result bmm,
        "moduleVersions" new_mv
    WHERE old_mv.id = mi."versionId"
      AND mi."moduleId" = bmm.original_id
      AND new_mv."moduleId" = bmm.new_id 
      AND new_mv.tag = old_mv.tag;
`);

  // Step 3.5 Update all installations that used to point to builtins that we didn't move
  // Step 3.5: Handle installations pointing to unmoved built-in modules
  await knex.raw(`
    WITH orphaned_installations AS (
      SELECT 
        mi.id as installation_id,
        mi."moduleId" as old_module_id,
        mi."versionId" as old_version_id,
        m.builtin as builtin_name,
        mv.tag as version_tag
      FROM "moduleInstallations" mi
      JOIN modules m ON mi."moduleId" = m.id
      JOIN "moduleVersions" mv ON mi."versionId" = mv.id
      WHERE m.domain != 'takaro-system'
        AND m.builtin IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 
          FROM module_mapping_result mmr 
          WHERE mmr.original_id = mi."moduleId"
        )
    ),
    matching_system_modules AS (
      SELECT 
        oi.installation_id,
        m.id as new_module_id,
        mv.id as new_version_id
      FROM orphaned_installations oi
      JOIN modules m ON m.builtin = oi.builtin_name
      JOIN "moduleVersions" mv ON mv."moduleId" = m.id AND mv.tag = oi.version_tag
      WHERE m.domain = 'takaro-system'
    )
    UPDATE "moduleInstallations" mi
    SET 
      "moduleId" = msm.new_module_id,
      "versionId" = msm.new_version_id
    FROM matching_system_modules msm
    WHERE mi.id = msm.installation_id;
  `);

  // Step 4: Update variables referencing modules
  await knex.raw(`
  UPDATE variables AS v
  SET "moduleId" = mim.new_id
  FROM module_mapping_result mim
  WHERE v."moduleId" = mim.original_id;
`);

  // Step 5: Delete old built-in modules from non-system domains
  await knex.raw(`
  DELETE FROM modules
  WHERE domain != 'takaro-system'
    AND builtin IS NOT NULL;
`);

  // Step 6: Drop builtin column and constraints
  await knex.schema.alterTable('modules', (table) => {
    table.dropUnique(['builtin', 'domain']);
    table.dropColumn('builtin');
  });
}

export async function down(knex: Knex): Promise<void> {
  // No data migration possible in this direction :(

  await knex.schema.alterTable('modules', (table) => {
    table.dropColumn('isPublic');
    table.dropColumn('ownerId');
    table.dropColumn('archivedAt');
    table.dropColumn('contact_info');
  });

  await knex.schema.alterTable('moduleVersions', (table) => {
    table.dropColumn('changelog');
  });
}
