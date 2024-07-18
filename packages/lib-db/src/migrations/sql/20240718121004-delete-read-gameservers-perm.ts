import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.table('permission').where('permission', 'READ_GAMESERVERS').delete();
}

export async function down(_knex: Knex): Promise<void> {
  // No down migration...
}
