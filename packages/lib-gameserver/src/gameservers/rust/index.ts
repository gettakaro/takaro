import { logger, TakaroDTO, errors } from '@takaro/util';
import { IsString, IsNumber } from 'class-validator';
import { IGamePlayer } from '../../interfaces/GamePlayer';
import {
  CommandOutput,
  IGameServer,
  TestReachabilityOutput,
} from '../../interfaces/GameServer';
import { RustEmitter } from './emitter';

export class RustConnectionInfo extends TakaroDTO<RustConnectionInfo> {
  @IsString()
  public readonly host!: string;
  @IsNumber()
  public readonly rconPort!: string;
  @IsString()
  public readonly rconPassword!: string;
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

  getEventEmitter() {
    const emitter = new RustEmitter(this.connectionInfo);
    return emitter;
  }

  async testReachability(): Promise<TestReachabilityOutput> {
    return new TestReachabilityOutput({
      connectable: true,
    });
  }

  async executeConsoleCommand(rawCommand: string) {
    throw new errors.NotImplementedError();
    return new CommandOutput({
      rawResult: `Command "${rawCommand}" executed successfully`,
      success: true,
    });
  }

  async sendMessage(message: string) {
    throw new errors.NotImplementedError();
    console.log(`say "${message}"`);
  }
}
