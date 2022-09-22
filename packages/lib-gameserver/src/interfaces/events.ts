import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { IGamePlayer } from './GamePlayer';

export enum GameEvents {
  LOG_LINE = 'log',
  PLAYER_CONNECTED = 'player-connected',
  PLAYER_DISCONNECTED = 'player-disconnected',
  PLAYER_SPAWNED = 'player-spawned',
  PLAYER_KICKED = 'player-kicked',
  PLAYER_MESSAGED = 'player-messaged',
  GAME_SAVING = 'game-saving',
  GAME_SAVED = 'game-saved',
  ITEM_GIVEN_TO = 'item-given-to',
}

class BaseEvent {
  timestamp: Date = new Date();
  type!: string;
}

export class EventLogLine extends BaseEvent {
  type = GameEvents.LOG_LINE;
  @IsString()
  msg!: string;
}

export class EventPlayerConnected extends BaseEvent {
  type = GameEvents.PLAYER_CONNECTED;
  @ValidateNested()
  @Type(() => IGamePlayer)
  player!: IGamePlayer;
}

export class EventPlayerSpawned extends BaseEvent {
  type = GameEvents.PLAYER_SPAWNED;
  @ValidateNested()
  @Type(() => IGamePlayer)
  player!: IGamePlayer;
}

export class EventPlayerKicked extends BaseEvent {
  type = GameEvents.PLAYER_KICKED;
  @ValidateNested()
  @Type(() => IGamePlayer)
  player!: IGamePlayer;
}

export class EventPlayerMessaged extends BaseEvent {
  type = GameEvents.PLAYER_MESSAGED;
  @ValidateNested()
  @Type(() => IGamePlayer)
  player!: IGamePlayer;
}

export class EventPlayerDisconnected extends BaseEvent {
  type = GameEvents.PLAYER_DISCONNECTED;
  @ValidateNested()
  @Type(() => IGamePlayer)
  player!: IGamePlayer;
}
