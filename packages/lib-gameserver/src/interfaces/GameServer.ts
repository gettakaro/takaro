import { IGameEventEmitter } from './eventEmitter';
import { IGamePlayer } from './GamePlayer';

export interface IGameServer {
  connectionInfo: unknown;

  getPlayer(id: string): Promise<IGamePlayer | null>;
  getPlayers(): Promise<IGamePlayer[]>;
  getEventEmitter(): Promise<IGameEventEmitter>;
}
