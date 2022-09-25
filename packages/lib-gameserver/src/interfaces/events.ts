import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
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

class BaseEvent {
  [key: string]: unknown;
  timestamp: Date = new Date();
  type!: string;

  @IsString()
  msg!: string;

  constructor(data: Record<string, unknown>) {
    const defaults = {
      timestamp: new Date(),
    };
    Object.assign(this, { ...defaults, ...data });
  }
}

export class EventLogLine extends BaseEvent {
  type = GameEvents.LOG_LINE;

  constructor(data: Partial<EventLogLine>) {
    super(data);
  }
}

export class EventPlayerConnected extends BaseEvent {
  type = GameEvents.PLAYER_CONNECTED;
  @ValidateNested()
  @Type(() => IGamePlayer)
  player!: IGamePlayer;

  constructor(data: Partial<EventPlayerConnected>) {
    super(data);
  }
}

export class EventPlayerDisconnected extends BaseEvent {
  type = GameEvents.PLAYER_DISCONNECTED;
  @ValidateNested()
  @Type(() => IGamePlayer)
  player!: IGamePlayer;

  constructor(data: Partial<EventPlayerDisconnected>) {
    super(data);
  }
}
