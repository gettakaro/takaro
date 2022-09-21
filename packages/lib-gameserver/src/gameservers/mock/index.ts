import { logger } from '@takaro/logger';
import { IGameEventEmitter } from '../../interfaces/eventEmitter';
import { IGamePlayer } from '../../interfaces/GamePlayer';
import { IGameServer, IServerInfo } from '../../interfaces/GameServer';
import { MockEmitter } from './emitter';

export class Mock implements IGameServer {
  private logger = logger('Mock');

  async getPlayer(id: string): Promise<IGamePlayer | null> {
    this.logger.debug('getPlayer', id);
    return null;
  }
  async testReachability(): Promise<IServerInfo> {
    return { connectable: true };
  }
  async executeCommand(command: string): Promise<string> {
    return command;
  }

  async getPlayers(): Promise<IGamePlayer[]> {
    return [];
  }

  getEventEmitter(): IGameEventEmitter {
    const emitter = new MockEmitter();
    return emitter;
  }
}
