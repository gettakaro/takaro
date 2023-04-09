import { faker } from '@faker-js/faker';
import { logger, TakaroDTO } from '@takaro/util';
import { IsNumber } from 'class-validator';
import { IGamePlayer } from '../../interfaces/GamePlayer';
import {
  CommandOutput,
  IGameServer,
  IMessageOptsDTO,
  IPosition,
  TestReachabilityOutput,
} from '../../interfaces/GameServer.js';
import { MockEmitter } from './emitter';
import { EventLogLine, GameEvents } from '../../interfaces/events';

export class MockConnectionInfo extends TakaroDTO<MockConnectionInfo> {
  @IsNumber()
  public readonly eventInterval = 10000;
  public readonly playerPoolSize = 100;

  public readonly mockPlayers: Partial<IGamePlayer>[] = Array.from(
    Array(this.playerPoolSize).keys()
  ).map((p) => ({
    gameId: p.toString(),
    name: faker.internet.userName(),
    epicOnlineServicesId: faker.random.alphaNumeric(16),
    steamId: faker.random.alphaNumeric(16),
    xboxLiveId: faker.random.alphaNumeric(16),
  }));
}
export class Mock implements IGameServer {
  private logger = logger('Mock');
  connectionInfo: MockConnectionInfo;
  emitter: MockEmitter;

  constructor(config: MockConnectionInfo) {
    this.connectionInfo = config;
    this.emitter = new MockEmitter(this.connectionInfo);
  }

  getEventEmitter() {
    return this.emitter;
  }

  async getPlayer(id: string): Promise<IGamePlayer | null> {
    this.logger.debug('getPlayer', id);
    return null;
  }

  async getPlayers(): Promise<IGamePlayer[]> {
    return [];
  }

  async getPlayerLocation(_player: IGamePlayer): Promise<IPosition | null> {
    return {
      x: parseInt(faker.random.numeric(), 10),
      y: parseInt(faker.random.numeric(), 10),
      z: parseInt(faker.random.numeric(), 10),
    };
  }

  async testReachability(): Promise<TestReachabilityOutput> {
    const fiftyFiftyChance = Math.random() >= 0.5;

    if (fiftyFiftyChance) {
      return new TestReachabilityOutput().construct({
        connectable: true,
      });
    } else {
      return new TestReachabilityOutput().construct({
        connectable: false,
        reason:
          'Mock server has a 50% chance of being unreachable. Try again please :)',
      });
    }
  }

  private sendLog(line: EventLogLine) {
    this.emitter.emit(GameEvents.LOG_LINE, line);
  }

  async executeConsoleCommand(rawCommand: string) {
    const output = new CommandOutput().construct({
      rawResult: `Command "${rawCommand}" executed successfully`,
      success: true,
    });

    this.sendLog(
      await new EventLogLine().construct({
        msg: rawCommand,
        timestamp: new Date(),
      })
    );

    return output;
  }

  async sendMessage(message: string, opts: IMessageOptsDTO) {
    const fullMessage = `Server: ${opts.recipient ? '[DM]' : ''} ${message}`;

    this.sendLog(
      await new EventLogLine().construct({
        msg: fullMessage,
        timestamp: new Date(),
      })
    );
  }

  async teleportPlayer(player: IGamePlayer, x: number, y: number, z: number) {
    this.sendLog(
      await new EventLogLine().construct({
        msg: `Teleporting ${player.name} to ${x}, ${y}, ${z}`,
        timestamp: new Date(),
      })
    );
  }
}
