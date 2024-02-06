import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex('modules').where('builtin', '=', 'economy').update({
    builtin: 'economyUtils',
    name: 'economyUtils',
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex('modules').where('builtin', '=', 'economyUtils').update({
    builtin: 'economy',
    name: 'economy',
  });
}
