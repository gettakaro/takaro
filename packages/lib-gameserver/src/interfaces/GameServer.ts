import { IGameEventEmitter } from './eventEmitter';
import { IGamePlayer } from './GamePlayer';

export interface IGameServer {
  getPlayer(id: string): Promise<IGamePlayer | null>;
  getPlayers(): Promise<IGamePlayer[]>;
  getEventEmitter(): Promise<IGameEventEmitter>;
}
