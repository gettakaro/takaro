import faker from '@faker-js/faker';
import { logger, TakaroDTO } from '@takaro/util';
import { IsNumber } from 'class-validator';
import { IGamePlayer } from '../../interfaces/GamePlayer';
import {
  CommandOutput,
  IGameServer,
  TestReachabilityOutput,
} from '../../interfaces/GameServer';
import { MockEmitter } from './emitter';

export class MockConnectionInfo extends TakaroDTO<MockConnectionInfo> {
  @IsNumber()
  public readonly eventInterval = 10000;
  public readonly playerPoolSize = 100;

  public readonly mockPlayers: IGamePlayer[] = Array.from(
    Array(this.playerPoolSize).keys()
  ).map(
    (p) =>
      new IGamePlayer({
        gameId: p.toString(),
        name: faker.internet.userName(),
        epicOnlineServicesId: faker.random.alphaNumeric(16),
        steamId: faker.random.alphaNumeric(16),
        xboxLiveId: faker.random.alphaNumeric(16),
      })
  );
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

  getEventEmitter() {
    const emitter = new MockEmitter(this.connectionInfo);
    return emitter;
  }

  async testReachability(): Promise<TestReachabilityOutput> {
    const fiftyFiftyChance = Math.random() >= 0.5;

    if (fiftyFiftyChance) {
      return new TestReachabilityOutput({
        connectable: true,
      });
    } else {
      return new TestReachabilityOutput({
        connectable: false,
        reason:
          'Mock server has a 50% chance of being unreachable. Try again please :)',
      });
    }
  }

  async executeConsoleCommand(rawCommand: string) {
    return new CommandOutput({
      rawResult: `Command "${rawCommand}" executed successfully`,
      success: true,
    });
  }
}
