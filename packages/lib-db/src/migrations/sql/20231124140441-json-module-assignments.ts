import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Change moduleAssignments.systemConfig from json to jsonb
  await knex.raw(`
  ALTER TABLE "moduleAssignments"
  ALTER COLUMN "systemConfig" TYPE jsonb USING "systemConfig"::jsonb;
`);

  // same for userConfig
  await knex.raw(`
  ALTER TABLE "moduleAssignments"
  ALTER COLUMN "userConfig" TYPE jsonb USING "userConfig"::jsonb;
`);
}

export async function down(knex: Knex): Promise<void> {
  // Change moduleAssignments.systemConfig from jsonb to json
  await knex.raw(`
  ALTER TABLE "moduleAssignments"
  ALTER COLUMN "systemConfig" TYPE json USING "systemConfig"::json;
`);

  // same for userConfig
  await knex.raw(`
  ALTER TABLE "moduleAssignments"
  ALTER COLUMN "userConfig" TYPE json USING "userConfig"::json;
`);
}
