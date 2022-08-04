import { logger } from '@takaro/logger';
import { IGameEventEmitter } from '../interfaces/eventEmitter';
import { IGamePlayer } from '../interfaces/GamePlayer';
import { IGameServer } from '../interfaces/GameServer';
import { SevenDaysToDieEmitter } from './emitter';

export class SevenDaysToDie implements IGameServer {
  private logger = logger('7D2D');

  async getPlayer(id: string): Promise<IGamePlayer> {
    this.logger.debug('getPlayer', id);
    return null;
  }

  async getPlayers(): Promise<IGamePlayer[]> {
    return [];
  }

  async getEventEmitter(): Promise<IGameEventEmitter> {
    const emitter = new SevenDaysToDieEmitter();
    return emitter;
  }
}
