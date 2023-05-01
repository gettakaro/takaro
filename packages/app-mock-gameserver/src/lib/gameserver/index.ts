import { errors, logger } from '@takaro/util';
import { getSocketServer } from '../socket/index.js';
import {
  CommandOutput,
  EventLogLine,
  GameEvents,
  IGamePlayer,
  IGameServer,
  IMessageOptsDTO,
  IPosition,
  IPlayerReferenceDTO,
  EventChatMessage,
} from '@takaro/gameserver';
import { faker } from '@faker-js/faker';

// Welcome to omit-hell 😇
export type IMockGameServer = Omit<
  Omit<Omit<IGameServer, 'getEventEmitter'>, 'connectionInfo'>,
  'testReachability'
>;

class MockGameserver implements IMockGameServer {
  private logger = logger('Mock');
  private socketServer = getSocketServer();
  public readonly mockPlayers: Partial<IGamePlayer>[] = Array.from(
    Array(5).keys()
  ).map((p) => ({
    gameId: p.toString(),
    name: faker.internet.userName(),
    epicOnlineServicesId: faker.random.alphaNumeric(16),
    steamId: faker.random.alphaNumeric(16),
    xboxLiveId: faker.random.alphaNumeric(16),
  }));

  async getPlayer(playerRef: IPlayerReferenceDTO): Promise<IGamePlayer | null> {
    const rawData =
      this.mockPlayers.find((p) => p.gameId === playerRef.gameId) ?? null;
    if (rawData === null) {
      return null;
    }

    return new IGamePlayer().construct(rawData);
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

  async executeConsoleCommand(rawCommand: string) {
    const output = await new CommandOutput().construct({
      rawResult:
        'Unknown command (Command not implemented yet in mock game server 👼)',
      success: false,
    });

    if (rawCommand === 'version') {
      output.rawResult = 'Mock game server v0.0.1';
      output.success = true;
    }

    await this.sendLog(
      `${output.success ? '🟢' : '🔴'} Command executed: ${rawCommand}`
    );

    return output;
  }

  async sendMessage(message: string, opts: IMessageOptsDTO) {
    const options = { ...opts };
    const fullMessage = `[🗨️ Chat] Server: ${
      options.recipient ? '[DM]' : ''
    } ${message}`;

    this.socketServer.io.emit(
      GameEvents.CHAT_MESSAGE,
      await new EventChatMessage().construct({
        msg: message,
      })
    );
    await this.sendLog(fullMessage);
  }

  async teleportPlayer(
    playerRef: IPlayerReferenceDTO,
    x: number,
    y: number,
    z: number
  ) {
    const player = await this.getPlayer(playerRef);
    if (!player) {
      throw new errors.NotFoundError('Player not found');
    }
    await this.sendLog(`Teleporting ${player.name} to ${x}, ${y}, ${z}`);
  }

  private mockPlayer() {
    const randomEntry =
      this.mockPlayers[Math.floor(Math.random() * this.mockPlayers.length)];

    return new IGamePlayer().construct(randomEntry);
  }

  private async sendLog(msg: string) {
    const logLine = await new EventLogLine().construct({
      msg,
      timestamp: new Date(),
    });
    this.socketServer.io.emit(GameEvents.LOG_LINE, logLine);
  }
}

let cachedMockServer: MockGameserver | null = null;

export async function getMockServer() {
  if (cachedMockServer === null) {
    cachedMockServer = new MockGameserver();
  }

  return cachedMockServer;
}
