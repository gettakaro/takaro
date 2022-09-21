import { logger } from '@takaro/logger';
import { IGameEventEmitter } from '../../interfaces/eventEmitter';
import { IGamePlayer } from '../../interfaces/GamePlayer';
import { IGameServer, IServerInfo } from '../../interfaces/GameServer';
import { RustEmitter } from './emitter';

export class Rust implements IGameServer {
  private logger = logger('Rust');

  async getPlayer(id: string): Promise<IGamePlayer | null> {
    this.logger.debug('getPlayer', id);
    return null;
  }

  async getPlayers(): Promise<IGamePlayer[]> {
    return [];
  }

  async testReachability(): Promise<IServerInfo> {
    return { connectable: true };
  }

  async executeCommand(command: string): Promise<string> {
    return command;
  }

  getEventEmitter(): IGameEventEmitter {
    const emitter = new RustEmitter();
    return emitter;
  }
}
