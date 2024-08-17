import ms from 'ms';
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('domains', (table) => {
    table.integer('rateLimitPoints').notNullable().defaultTo(2500);
    table.integer('rateLimitDuration').notNullable().defaultTo(ms('15min'));
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('domains', (table) => {
    table.dropColumn('rateLimitPoints');
    table.dropColumn('rateLimitDuration');
  });
}
