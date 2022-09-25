import { logger } from '@takaro/logger';
import { IsNumber } from 'class-validator';
import { IGameEventEmitter } from '../../interfaces/eventEmitter';
import { IGamePlayer } from '../../interfaces/GamePlayer';
import { IGameServer } from '../../interfaces/GameServer';
import { MockEmitter } from './emitter';

export class MockConnectionInfo {
  @IsNumber()
  public readonly eventInterval = 10000;

  constructor(data: Record<string, unknown>) {
    Object.assign(this, data);
  }
}
export class Mock implements IGameServer {
  private logger = logger('Mock');
  connectionInfo: MockConnectionInfo;

  constructor(config: Record<string, unknown>) {
    this.connectionInfo = new MockConnectionInfo(config);
  }

  async getPlayer(id: string): Promise<IGamePlayer | null> {
    this.logger.debug('getPlayer', id);
    return null;
  }

  async getPlayers(): Promise<IGamePlayer[]> {
    return [];
  }

  async getEventEmitter(): Promise<IGameEventEmitter> {
    const emitter = new MockEmitter(this.connectionInfo);
    return emitter;
  }
}
