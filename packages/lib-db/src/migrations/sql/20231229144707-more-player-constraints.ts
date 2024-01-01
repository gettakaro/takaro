import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Find all players that have epicOnlineServicesId starting with EOS_ and delete them
  await knex.raw(`
    DELETE FROM "players"
    WHERE "epicOnlineServicesId" LIKE 'EOS_%'
  `);

  await knex.schema.alterTable('players', (table) => {
    // epicOnlineServicesId is always 32 chars
    table.string('epicOnlineServicesId', 32).alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('players', (table) => {
    table.string('epicOnlineServicesId', 255).alter();
  });
}
