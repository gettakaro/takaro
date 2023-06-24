import { IsString } from 'class-validator';
import { EventMapping, GameEvents } from '@takaro/gameserver';
import { TakaroDTO } from '@takaro/util';

export enum DiscordEvents {
  DISCORD_MESSAGE = 'discord-message',
}

export class HookEventDiscordMessage extends TakaroDTO<HookEventDiscordMessage> {
  @IsString()
  type = DiscordEvents.DISCORD_MESSAGE;

  @IsString()
  msg: string;

  @IsString()
  senderDiscordId: string;

  @IsString()
  channelDiscordId: string;
}

export type HookEvents = EventMapping[GameEvents] | HookEventDiscordMessage;
export type HookEventTypes = HookEvents['type'];
