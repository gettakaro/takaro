import { logger } from '@takaro/logger';
import { IGameEventEmitter } from '../../interfaces/eventEmitter';
import { IGamePlayer } from '../../interfaces/GamePlayer';
import {
  IGameServer,
  IServerConnection,
  IServerInfo,
} from '../../interfaces/GameServer';
import { SevenDaysToDieEmitter } from './emitter';

export class SevenDaysToDie implements IGameServer {
  private logger = logger('7D2D');

  async getPlayer(id: string): Promise<IGamePlayer | null> {
    this.logger.debug('getPlayer', id);
    return null;
  }
  async executeCommand(command: string): Promise<string> {
    return this.getEventEmitter().executeRawCommand(command);
  }
  async getPlayers(): Promise<IGamePlayer[]> {
    return [];
  }
  async testConnection(): Promise<IServerConnection> {
    return {
      error: null,
      canConnect: false,
    };
  }

  getEventEmitter(): IGameEventEmitter {
    const emitter = new SevenDaysToDieEmitter();
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
