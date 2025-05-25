import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('bans', (table) => {
    table.text('reason').alter();
  });

  await knex.raw(`
    CREATE OR REPLACE FUNCTION truncate_reason()
    RETURNS TRIGGER AS $$
    BEGIN
      IF char_length(NEW.reason) > 10000 THEN
        NEW.reason = left(NEW.reason, 10000);
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await knex.raw(`
    CREATE TRIGGER truncate_reason_trigger
      BEFORE INSERT OR UPDATE ON "bans"
      FOR EACH ROW
      EXECUTE FUNCTION truncate_reason();
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP TRIGGER IF EXISTS truncate_reason_trigger ON "bans"');
  await knex.raw('DROP FUNCTION IF EXISTS truncate_reason()');

  await knex.schema.alterTable('bans', (table) => {
    table.string('reason', 255).alter();
  });
}
