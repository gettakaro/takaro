import { Knex } from 'knex';
import { formatAlterTableEnumSql } from '../util/alterEnum.js';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE OR REPLACE FUNCTION generate_registration_token()
    RETURNS text
    LANGUAGE sql
    AS $$
      SELECT encode(
        decode(
          replace(
            array_to_string(
              ARRAY[
                gen_random_uuid()::text,
                gen_random_uuid()::text
              ],
              ''
            ),
            '-',
            ''
          ),
          'hex'
        ),
        'base64'
      );
    $$;
  `);

  // Then run the migrations
  await knex.raw(formatAlterTableEnumSql('gameservers', 'type', ['MOCK', 'RUST', 'SEVENDAYSTODIE', 'GENERIC']));

  await knex.schema.alterTable('domains', (table) => {
    table
      .string('serverRegistrationToken', 128)
      .notNullable()
      .defaultTo(knex.raw('generate_registration_token()'));
  });

  await knex.schema.alterTable('gameservers', (table) => {
    table.string('identityToken').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(formatAlterTableEnumSql('gameservers', 'type', ['MOCK', 'RUST', 'SEVENDAYSTODIE']));

  await knex.schema.alterTable('domains', (table) => {
    table.dropColumn('serverRegistrationToken');
  });

  await knex.schema.alterTable('gameservers', (table) => {
    table.dropColumn('identityToken');
  });

  // Drop the function
  await knex.raw('DROP FUNCTION IF EXISTS generate_registration_token();');
}