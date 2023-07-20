import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('modulePermission', (table) => {
    table.string('description').defaultTo('No description provided');
    table.string('friendlyName');
  });

  await knex.raw(`
    CREATE OR REPLACE FUNCTION set_friendly_name() 
    RETURNS TRIGGER AS $$
    BEGIN
      IF NEW."friendlyName" IS NULL THEN
        NEW."friendlyName" := NEW.permission;
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await knex.raw(`
    CREATE TRIGGER check_friendly_name 
    BEFORE INSERT OR UPDATE ON "modulePermission"
    FOR EACH ROW EXECUTE PROCEDURE set_friendly_name();
  `);

  await knex.raw('ALTER TABLE "permissionOnRole" DROP CONSTRAINT IF EXISTS "capabilityOnRole_capability_check";');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('modulePermission', (table) => {
    table.dropColumn('description');
    table.dropColumn('friendlyName');
  });

  await knex.raw('DROP TRIGGER IF EXISTS check_friendly_name ON "modulePermission";');
  await knex.raw('DROP FUNCTION IF EXISTS set_friendly_name();');
}
