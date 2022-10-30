import { Type } from 'class-transformer';
import { TakaroDTO } from '@takaro/util';
import { IsEnum, IsISO8601, IsString, ValidateNested } from 'class-validator';
import { IGamePlayer } from './GamePlayer';

export enum GameEvents {
  LOG_LINE = 'log',
  PLAYER_CONNECTED = 'player-connected',
  PLAYER_DISCONNECTED = 'player-disconnected',
}

export type EventMapping = {
  [GameEvents.LOG_LINE]: EventLogLine;
  [GameEvents.PLAYER_CONNECTED]: EventPlayerConnected;
  [GameEvents.PLAYER_DISCONNECTED]: EventPlayerDisconnected;
};

export class BaseEvent extends TakaroDTO<BaseEvent> {
  @IsISO8601()
  timestamp: string;

  @IsEnum(GameEvents)
  type: string;

  @IsString()
  msg: string;

  constructor(data: Record<string, unknown>) {
    super({ ...data, timestamp: new Date().toISOString() });
  }
}

export class EventLogLine extends BaseEvent {
  type = GameEvents.LOG_LINE;
}

export class EventPlayerConnected extends BaseEvent {
  type = GameEvents.PLAYER_CONNECTED;
  @ValidateNested()
  @Type(() => IGamePlayer)
  player: IGamePlayer;
}

export class EventPlayerDisconnected extends BaseEvent {
  type = GameEvents.PLAYER_DISCONNECTED;
  @ValidateNested()
  @Type(() => IGamePlayer)
  player: IGamePlayer;
}
