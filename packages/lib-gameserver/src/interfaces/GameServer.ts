import { TakaroEmitter } from '../TakaroEmitter';
import { IGamePlayer } from './GamePlayer';

export interface IGameServer {
  connectionInfo: unknown;

  getPlayer(id: string): Promise<IGamePlayer | null>;
  getPlayers(): Promise<IGamePlayer[]>;
  getEventEmitter(): TakaroEmitter;
}
