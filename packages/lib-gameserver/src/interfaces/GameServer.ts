import { IGameEventEmitter } from './eventEmitter';
import { IGamePlayer } from './GamePlayer';

enum ServerConnectionError {
  WrongPort,
  WrongPassword,
  WrongGameVersion,
}

export interface IServerConnection {
  canConnect: boolean;
  error: ServerConnectionError | null;
}

export interface IServerInfo {
  uptime: string;
  players: number;
  maxPlayers: number;
}

export interface IGameServer {
  getPlayer(id: string): Promise<IGamePlayer | null>;
  getPlayers(): Promise<IGamePlayer[]>;
  testConnection(): Promise<IServerConnection>;
  executeCommand(command: string): Promise<string>;
  getEventEmitter(): IGameEventEmitter;
  getServerInfo(): Promise<IServerInfo>;
}
