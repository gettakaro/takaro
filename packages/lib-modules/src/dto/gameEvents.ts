import { IsEnum, IsString, ValidateNested, IsOptional, IsNumber, Matches } from 'class-validator';
import { TakaroDTO } from '@takaro/util';
import { Type } from 'class-transformer';
import { BaseEvent } from './base.js';
import { ValueOf } from 'type-fest';

export const GameEvents = {
  LOG_LINE: 'log',
  PLAYER_CONNECTED: 'player-connected',
  PLAYER_DISCONNECTED: 'player-disconnected',
  CHAT_MESSAGE: 'chat-message',
  PLAYER_DEATH: 'player-death',
  ENTITY_KILLED: 'entity-killed',
} as const;

export type GameEventTypes = ValueOf<typeof GameEvents>;

export class IGamePlayer extends TakaroDTO<IGamePlayer> {
  /**
   * Unique identifier for this player, as used by the game
   */
  @IsString()
  gameId!: string;
  /**
   * The players username
   */
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  steamId?: string;

  @IsString()
  @IsOptional()
  epicOnlineServicesId?: string;

  @IsString()
  @IsOptional()
  xboxLiveId?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$/, {
    message: "Platform ID must be in format 'platform:id' (e.g., 'minecraft:player-uuid')",
  })
  platformId?: string;

  @IsString()
  @IsOptional()
  ip?: string;

  @IsNumber()
  @IsOptional()
  ping?: number;
}

export class BaseGameEvent<T> extends BaseEvent<T> {
  @IsEnum(GameEvents)
  declare type: ValueOf<typeof GameEvents>;

  @IsString()
  @IsOptional()
  msg: string;
}

export class EventLogLine extends BaseGameEvent<EventLogLine> {
  @IsString()
  type = GameEvents.LOG_LINE;
}

export class EventPlayerConnected extends BaseGameEvent<EventPlayerConnected> {
  type = GameEvents.PLAYER_CONNECTED;
  @ValidateNested()
  @Type(() => IGamePlayer)
  player: IGamePlayer;
}

export class EventPlayerDisconnected extends BaseGameEvent<EventPlayerDisconnected> {
  type = GameEvents.PLAYER_DISCONNECTED;
  @ValidateNested()
  @Type(() => IGamePlayer)
  player: IGamePlayer;
}

export enum ChatChannel {
  GLOBAL = 'global',
  TEAM = 'team',
  FRIENDS = 'friends',
  WHISPER = 'whisper',
}

export class EventChatMessage extends BaseGameEvent<EventChatMessage> {
  type = GameEvents.CHAT_MESSAGE;
  @ValidateNested()
  @Type(() => IGamePlayer)
  player?: IGamePlayer;

  @IsEnum(Object.values(ChatChannel))
  channel: ChatChannel;

  declare msg: string;
}

export class IPosition extends TakaroDTO<IPosition> {
  @IsNumber()
  x: number;
  @IsNumber()
  y: number;
  @IsNumber()
  z: number;
  @IsString()
  @IsOptional()
  dimension?: string;
}

export class EventPlayerDeath extends BaseGameEvent<EventPlayerDeath> {
  type = GameEvents.PLAYER_DEATH;
  @ValidateNested()
  @Type(() => IGamePlayer)
  player: IGamePlayer;

  @IsOptional()
  @ValidateNested()
  @Type(() => IGamePlayer)
  attacker?: IGamePlayer;

  @IsOptional()
  @ValidateNested()
  @Type(() => IPosition)
  position: IPosition;
}

export class EventEntityKilled extends BaseGameEvent<EventEntityKilled> {
  type = GameEvents.ENTITY_KILLED;
  @ValidateNested()
  @Type(() => IGamePlayer)
  player: IGamePlayer;

  @IsString()
  entity: string;

  @IsString()
  weapon: string;
}

export const GameEventsMapping = {
  [GameEvents.PLAYER_CONNECTED]: EventPlayerConnected,
  [GameEvents.PLAYER_DISCONNECTED]: EventPlayerDisconnected,
  [GameEvents.CHAT_MESSAGE]: EventChatMessage,
  [GameEvents.PLAYER_DEATH]: EventPlayerDeath,
  [GameEvents.ENTITY_KILLED]: EventEntityKilled,
  [GameEvents.LOG_LINE]: EventLogLine,
} as const;
