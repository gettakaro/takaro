import { Knex } from 'knex';
import { formatAlterTableEnumSql } from '../util/alterEnum.js';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(formatAlterTableEnumSql('gameservers', 'type', ['MOCK', 'RUST', 'SEVENDAYSTODIE', 'GENERIC']));

  await knex.schema.alterTable('domains', (table) => {
    // Generate a secure random token using PostgreSQL's cryptographic functions
    // This combines multiple UUID v4s and encodes them in base64 to create a secure token
    const secureTokenGeneration = `
      encode(
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
      )
    `;

    table.string('serverRegistrationToken', 128).notNullable().defaultTo(knex.raw(secureTokenGeneration));
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(formatAlterTableEnumSql('gameservers', 'type', ['MOCK', 'RUST', 'SEVENDAYSTODIE']));

  await knex.schema.alterTable('domains', (table) => {
    table.dropColumn('serverRegistrationToken');
  });
}
