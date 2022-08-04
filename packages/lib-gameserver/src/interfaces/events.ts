import { IGamePlayer } from './GamePlayer';

export enum GameEvents {
  LOG_LINE = 'log',
  PLAYER_CONNECTED = 'player-connected',
  PLAYER_DISCONNECTED = 'player-disconnected',
}

interface BaseEvent {
  timestamp: Date;
  type: string;
}

export interface IEventLogLine extends BaseEvent {
  type: GameEvents.LOG_LINE;
  msg: string;
}

export interface IEventPlayerConnected extends BaseEvent {
  type: GameEvents.PLAYER_CONNECTED;
  player: IGamePlayer;
}

export interface IEventPlayerDisconnected extends BaseEvent {
  type: GameEvents.PLAYER_DISCONNECTED;
  player: IGamePlayer;
}
