import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE "shopOrder" 
    DROP CONSTRAINT IF EXISTS shoporder_playerid_foreign;
  `);

  await knex.raw(`
    ALTER TABLE "shopOrder" 
    ADD CONSTRAINT shoporder_playerid_foreign 
    FOREIGN KEY ("playerId") REFERENCES players(id) ON DELETE CASCADE;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE "shopOrder" 
    DROP CONSTRAINT IF EXISTS shoporder_playerid_foreign;
  `);

  await knex.raw(`
    ALTER TABLE "shopOrder" 
    ADD CONSTRAINT shoporder_playerid_foreign 
    FOREIGN KEY ("playerId") REFERENCES players(id) ON DELETE NO ACTION;
  `);
}
