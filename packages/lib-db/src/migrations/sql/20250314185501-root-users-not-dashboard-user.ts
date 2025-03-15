import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    UPDATE users
    SET "isDashboardUser" = false
    WHERE name = 'root'
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    UPDATE users
    SET "isDashboardUser" = true
    WHERE name = 'root'
  `);
}
