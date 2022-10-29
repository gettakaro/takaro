import { logger } from '@takaro/util';
import { IsString, IsNumber } from 'class-validator';
import { IGameEventEmitter } from '../../interfaces/eventEmitter';
import { IGamePlayer } from '../../interfaces/GamePlayer';
import { IGameServer } from '../../interfaces/GameServer';
import { RustEmitter } from './emitter';

export class RustConnectionInfo {
  @IsString()
  public readonly host!: string;
  @IsNumber()
  public readonly rconPort!: string;
  @IsString()
  public readonly rconPassword!: string;

  constructor(data: Record<string, unknown>) {
    Object.assign(this, data);
  }
}

export class Rust implements IGameServer {
  private logger = logger('rust');
  connectionInfo: RustConnectionInfo;

  constructor(config: Record<string, unknown>) {
    this.connectionInfo = new RustConnectionInfo(config);
  }

  async getPlayer(id: string): Promise<IGamePlayer | null> {
    this.logger.debug('getPlayer', id);
    return null;
  }

  async getPlayers(): Promise<IGamePlayer[]> {
    return [];
  }

  async getEventEmitter(): Promise<IGameEventEmitter> {
    const emitter = new RustEmitter(this.connectionInfo);
    return emitter;
  }
}
