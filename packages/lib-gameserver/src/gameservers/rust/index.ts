import { logger } from '@takaro/logger';
import { IGameEventEmitter } from '../../interfaces/eventEmitter';
import { IGamePlayer } from '../../interfaces/GamePlayer';
import {
  IGameServer,
  IServerConnection,
  IServerInfo,
} from '../../interfaces/GameServer';
import { RustEmitter } from './emitter';

export class Rust implements IGameServer {
  private logger = logger('Rust');

  async getPlayer(id: string): Promise<IGamePlayer | null> {
    this.logger.debug('getPlayer', id);
    return null;
  }

  async getPlayers(): Promise<IGamePlayer[]> {
    this.logger.debug('getPlayers');
    return [];
  }

  async testConnection(): Promise<IServerConnection> {
    return { canConnect: true, error: null };
  }

  async executeCommand(command: string): Promise<string> {
    this.getEventEmitter().executeRawCommand(command);
    return command;
  }

  getEventEmitter(): IGameEventEmitter {
    const emitter = new RustEmitter();
    return emitter;
  }

  async getServerInfo(): Promise<IServerInfo> {
    return {
      players: 0,
      maxPlayers: 0,
      uptime: '',
    };
  }
}
