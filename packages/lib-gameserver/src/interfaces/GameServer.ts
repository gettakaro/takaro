import { IGameEventEmitter } from './eventEmitter';
import { IGamePlayer } from './GamePlayer';

export interface IServerInfo {
  connectable: boolean;
  // todo: define more details (maybe wrong port, wrong password, wrong game version...)
}

export interface IGameServer {
  getPlayer(id: string): Promise<IGamePlayer | null>;
  getPlayers(): Promise<IGamePlayer[]>;
  testReachability(): Promise<IServerInfo>;
  executeCommand(command: string): Promise<string>;
  getEventEmitter(): IGameEventEmitter;
}
