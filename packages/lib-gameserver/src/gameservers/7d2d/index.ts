import { logger } from '@takaro/util';
import { IsString, IsBoolean } from 'class-validator';
import { IGameEventEmitter } from '../../interfaces/eventEmitter';
import { IGamePlayer } from '../../interfaces/GamePlayer';
import { IGameServer } from '../../interfaces/GameServer';
import { SevenDaysToDieEmitter } from './emitter';

export class SdtdConnectionInfo {
  @IsString()
  public readonly host!: string;
  @IsString()
  public readonly adminUser!: string;
  @IsString()
  public readonly adminToken!: string;
  @IsBoolean()
  public readonly useTls!: boolean;

  constructor(data: Record<string, unknown>) {
    Object.assign(this, data);
  }
}
export class SevenDaysToDie implements IGameServer {
  private logger = logger('7D2D');
  connectionInfo: SdtdConnectionInfo;

  constructor(config: Record<string, unknown>) {
    this.connectionInfo = new SdtdConnectionInfo(config);
  }

  async getPlayer(id: string): Promise<IGamePlayer | null> {
    this.logger.debug('getPlayer', id);
    return null;
  }

  async getPlayers(): Promise<IGamePlayer[]> {
    return [];
  }

  async getEventEmitter(): Promise<IGameEventEmitter> {
    const emitter = new SevenDaysToDieEmitter(this.connectionInfo);
    return emitter;
  }
}
