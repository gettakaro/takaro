import faker from '@faker-js/faker';
import { logger, TakaroDTO } from '@takaro/util';
import { IsNumber } from 'class-validator';
import { IGamePlayer } from '../../interfaces/GamePlayer';
import {
  CommandOutput,
  IGameServer,
  IMessageOptsDTO,
  TestReachabilityOutput,
} from '../../interfaces/GameServer';
import { MockEmitter } from './emitter';
import { EventLogLine, GameEvents } from '../../interfaces/events';

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
  emitter: MockEmitter;

  constructor(config: Record<string, unknown>) {
    this.connectionInfo = new MockConnectionInfo(config);
    this.emitter = new MockEmitter(this.connectionInfo);
  }

  async getPlayer(id: string): Promise<IGamePlayer | null> {
    this.logger.debug('getPlayer', id);
    return null;
  }

  async getPlayers(): Promise<IGamePlayer[]> {
    return [];
  }

  getEventEmitter() {
    return this.emitter;
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

  private sendLog(line: EventLogLine) {
    this.emitter.emit(GameEvents.LOG_LINE, line);
  }

  async executeConsoleCommand(rawCommand: string) {
    const output = new CommandOutput({
      rawResult: `Command "${rawCommand}" executed successfully`,
      success: true,
    });

    this.sendLog(
      new EventLogLine({
        msg: rawCommand,
        timestamp: new Date().toISOString(),
      })
    );

    return output;
  }

  async sendMessage(message: string, opts: IMessageOptsDTO) {
    const fullMessage = `Server: ${opts.recipient ? '[DM]' : ''} ${message}`;

    this.sendLog(
      new EventLogLine({
        msg: fullMessage,
        timestamp: new Date().toISOString(),
      })
    );
  }
}
