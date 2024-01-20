import { IsEnum, IsString, ValidateNested, IsOptional, IsNumber } from 'class-validator';
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
  msg: string;
}

export interface IPosition {
  x: number;
  y: number;
  z: number;
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

export class EventChatMessage extends BaseGameEvent<EventChatMessage> {
  type = GameEvents.CHAT_MESSAGE;
  @ValidateNested()
  @Type(() => IGamePlayer)
  player?: IGamePlayer;

  declare msg: string;
}

export class IPosition {
  @IsNumber()
  x: number;
  @IsNumber()
  y: number;
  @IsNumber()
  z: number;
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

export function isConnectedEvent(a: BaseGameEvent<unknown>): a is EventPlayerConnected {
  return a.type === GameEvents.PLAYER_CONNECTED;
}

export function isDisconnectedEvent(a: BaseGameEvent<unknown>): a is EventPlayerDisconnected {
  return a.type === GameEvents.PLAYER_DISCONNECTED;
}

export function isChatMessageEvent(a: BaseGameEvent<unknown>): a is EventChatMessage {
  return a.type === GameEvents.CHAT_MESSAGE;
}

export function isPlayerDeathEvent(a: BaseGameEvent<unknown>): a is EventPlayerDeath {
  return a.type === GameEvents.PLAYER_DEATH;
}

export function isEntityKilledEvent(a: BaseGameEvent<unknown>): a is EventEntityKilled {
  return a.type === GameEvents.ENTITY_KILLED;
}

export const GameEventsMapping = {
  [GameEvents.PLAYER_CONNECTED]: EventPlayerConnected,
  [GameEvents.PLAYER_DISCONNECTED]: EventPlayerDisconnected,
  [GameEvents.CHAT_MESSAGE]: EventChatMessage,
  [GameEvents.PLAYER_DEATH]: EventPlayerDeath,
  [GameEvents.ENTITY_KILLED]: EventEntityKilled,
  [GameEvents.LOG_LINE]: EventLogLine,
} as const;
