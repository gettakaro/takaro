import { Knex } from 'knex';

/**
 * This migration ensures that all commands,hooks,cronjobs have a unique name inside their module version
 * @param knex
 */

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `ALTER TABLE "commands" ADD CONSTRAINT "commands_unique_name_versionId" UNIQUE ("name", "versionId");`,
  );
  await knex.raw(`ALTER TABLE "hooks" ADD CONSTRAINT "hooks_unique_name_versionId" UNIQUE ("name", "versionId");`);
  await knex.raw(
    `ALTER TABLE "cronJobs" ADD CONSTRAINT "cronJobs_unique_name_versionId" UNIQUE ("name", "versionId");`,
  );
  await knex.raw(
    `ALTER TABLE "functions" ADD CONSTRAINT "functions_unique_name_versionId" UNIQUE ("name", "versionId");`,
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`ALTER TABLE "commands" DROP CONSTRAINT "commands_unique_name_versionId";`);
  await knex.raw(`ALTER TABLE "hooks" DROP CONSTRAINT "hooks_unique_name_versionId";`);
  await knex.raw(`ALTER TABLE "cronJobs" DROP CONSTRAINT "cronJobs_unique_name_versionId";`);
  await knex.raw(`ALTER TABLE "functions" DROP CONSTRAINT "functions_unique_name_versionId";`);
}
