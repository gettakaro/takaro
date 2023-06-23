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
    ])
  );

  // add discordChannelId column and a constraint, if eventType is discord-message it is required, otherwise it should be null
  await knex.schema.alterTable('hooks', (table) => {
    table.string('discordChannelId').nullable();
  });

  await knex.raw(`
    ALTER TABLE hooks
    ADD CONSTRAINT discord_channel_id_required_if_event_type_is_discord_message
    CHECK (
      ("eventType" <> 'discord-message' AND "discordChannelId" IS NULL)
      OR ("eventType" = 'discord-message' AND "discordChannelId" IS NOT NULL)
    )
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(
    formatAlterTableEnumSql('hooks', 'eventType', [
      'log',
      'player-connected',
      'player-disconnected',
      'chat-message',
    ])
  );

  await knex.schema.alterTable('hooks', (table) => {
    table.dropColumn('discordChannelId');
  });
}
