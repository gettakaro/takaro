import { Knex } from 'knex';
import { formatAlterTableEnumSql } from '../util/alterEnum.js';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(formatAlterTableEnumSql('gameservers', 'type', ['MOCK', 'RUST', 'SEVENDAYSTODIE', 'MINECRAFT']));
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(formatAlterTableEnumSql('gameservers', 'type', ['MOCK', 'RUST', 'SEVENDAYSTODIE']));
}
