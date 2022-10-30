import faker from '@faker-js/faker';
import { logger } from '@takaro/util';
import { IsNumber } from 'class-validator';
import { IGamePlayer } from '../../interfaces/GamePlayer';
import { IGameServer } from '../../interfaces/GameServer';
import { MockEmitter } from './emitter';

export class MockConnectionInfo {
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
}
