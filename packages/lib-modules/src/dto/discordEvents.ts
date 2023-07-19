import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TakaroDTO } from '@takaro/util';

export enum DiscordEvents {
  DISCORD_MESSAGE = 'discord-message',
}

export class EventDiscordUser extends TakaroDTO<EventDiscordUser> {
  @IsString()
  id: string;

  @IsString()
  username: string;

  @IsString()
  displayName: string;

  @IsBoolean()
  isBot: boolean;

  @IsBoolean()
  isTakaroBot: boolean;
}

export class EventDiscordChannel extends TakaroDTO<EventDiscordChannel> {
  @IsString()
  id: string;

  @IsString()
  name: string;
}

export class HookEventDiscordMessage extends TakaroDTO<HookEventDiscordMessage> {
  @IsString()
  type = DiscordEvents.DISCORD_MESSAGE;

  @IsString()
  msg: string;

  @ValidateNested()
  @Type(() => EventDiscordUser)
  author: EventDiscordUser;

  @ValidateNested()
  @Type(() => EventDiscordChannel)
  channel: EventDiscordChannel;
}

export function isDiscordMessageEvent(a: unknown): a is HookEventDiscordMessage {
  if (typeof a === 'object' && a !== null) {
    return 'type' in a && a.type === DiscordEvents.DISCORD_MESSAGE;
  }
  return false;
}
