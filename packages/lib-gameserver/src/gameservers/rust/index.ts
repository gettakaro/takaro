import { logger } from '@takaro/logger';
import { IGameEventEmitter } from '../../interfaces/eventEmitter';
import { IGamePlayer } from '../../interfaces/GamePlayer';
import {
  IGameServer,
  IServerConnection,
  IServerInfo,
} from '../../interfaces/GameServer';
// import { RequestManager } from '../../requestManager';
import { RustEmitter } from './emitter';

export class Rust implements IGameServer {
  private logger = logger('Rust');
  // private requestManager = new RequestManager();
  //private requestManager: RequestManager | null = null;

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
    // this.requestManager.executeRawCommand(command);
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
