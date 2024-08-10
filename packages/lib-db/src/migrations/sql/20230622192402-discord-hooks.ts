import { Knex } from 'knex';
import { formatAlterTableEnumSql } from '../util/alterEnum.js';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    formatAlterTableEnumSql('hooks', 'eventType', [
      'log',
      'player-connected',
      'player-disconnected',
      'chat-message',
      'discord-message',
    ]),
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(
    formatAlterTableEnumSql('hooks', 'eventType', ['log', 'player-connected', 'player-disconnected', 'chat-message']),
  );
}
