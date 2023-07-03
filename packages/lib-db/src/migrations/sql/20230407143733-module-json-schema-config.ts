import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('modules', (table) => {
    table
      .text('configSchema')
      .defaultTo('{"$schema": "http://json-schema.org/draft-07/schema#","type": "object","additionalProperties": true}')
      .notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('modules', (table) => {
    table.dropColumn('configSchema');
  });
}
