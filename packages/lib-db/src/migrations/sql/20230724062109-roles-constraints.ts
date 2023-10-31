import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE "roleOnPlayer"
    ADD CONSTRAINT role_on_player_unique_idx
    UNIQUE NULLS NOT DISTINCT ("gameServerId", "playerId", "roleId");
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Removing the unique constraint
  await knex.raw(`
    DROP INDEX role_on_player_unique_idx;
  `);
}
