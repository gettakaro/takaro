import { Type } from 'class-transformer';
import { TakaroDTO } from '@takaro/util';
import { IsDate, IsEnum, IsString, ValidateNested } from 'class-validator';
import { IGamePlayer } from './GamePlayer.js';

export enum GameEvents {
  LOG_LINE = 'log',
  PLAYER_CONNECTED = 'player-connected',
  PLAYER_DISCONNECTED = 'player-disconnected',
  CHAT_MESSAGE = 'chat-message',
}

export type EventMapping = {
  [GameEvents.LOG_LINE]: EventLogLine;
  [GameEvents.PLAYER_CONNECTED]: EventPlayerConnected;
  [GameEvents.PLAYER_DISCONNECTED]: EventPlayerDisconnected;
  [GameEvents.CHAT_MESSAGE]: EventChatMessage;
};

export class BaseEvent<T> extends TakaroDTO<T> {
  @IsDate()
  timestamp: Date = new Date();

  @IsEnum(GameEvents)
  type: string;

  @IsString()
  msg: string;
}

export class EventLogLine extends BaseEvent<EventLogLine> {
  type = GameEvents.LOG_LINE;
}

export class EventPlayerConnected extends BaseEvent<EventPlayerConnected> {
  type = GameEvents.PLAYER_CONNECTED;
  @ValidateNested()
  @Type(() => IGamePlayer)
  player: IGamePlayer;
}

export class EventPlayerDisconnected extends BaseEvent<EventPlayerDisconnected> {
  type = GameEvents.PLAYER_DISCONNECTED;
  @ValidateNested()
  @Type(() => IGamePlayer)
  player: IGamePlayer;
}

export class EventChatMessage extends BaseEvent<EventChatMessage> {
  type = GameEvents.CHAT_MESSAGE;
  @ValidateNested()
  @Type(() => IGamePlayer)
  player?: IGamePlayer;

  declare msg: string;
}
