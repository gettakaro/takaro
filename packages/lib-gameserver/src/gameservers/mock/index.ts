import { logger } from '@takaro/logger';
import { IGameEventEmitter } from '../../interfaces/eventEmitter';
import { IGamePlayer } from '../../interfaces/GamePlayer';
import { IGameServer } from '../../interfaces/GameServer';
import { MockEmitter } from './emitter';

export class Mock implements IGameServer {
  private logger = logger('Mock');

  async getPlayer(id: string): Promise<IGamePlayer | null> {
    this.logger.debug('getPlayer', id);
    return null;
  }

  async getPlayers(): Promise<IGamePlayer[]> {
    return [];
  }

  async getEventEmitter(): Promise<IGameEventEmitter> {
    const emitter = new MockEmitter();
    return emitter;
  }
}
