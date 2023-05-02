import { errors, logger } from '@takaro/util';
import { Redis } from '@takaro/db';
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
  EventPlayerConnected,
} from '@takaro/gameserver';
import { faker } from '@faker-js/faker';
import { config } from '../../config.js';

// Welcome to omit-hell 😇
export type IMockGameServer = Omit<
  Omit<Omit<IGameServer, 'getEventEmitter'>, 'connectionInfo'>,
  'testReachability'
>;

const REDIS_PREFIX = `mock-game:${config.get('mockserver.name')}:`;

function getRedisKey(key: string) {
  return `${REDIS_PREFIX}${key}`;
}
class MockGameserver implements IMockGameServer {
  private logger = logger('Mock');
  private socketServer = getSocketServer();
  private redis = Redis.getClient('mockgameserver');

  async ensurePlayersPersisted() {
    const existingPlayers = await (
      await this.redis
    ).keys(getRedisKey('player:*'));

    if (existingPlayers.length > 0) {
      return;
    }

    const players = Array.from(Array(5).keys()).map((p) => ({
      gameId: p.toString(),
      name: faker.internet.userName(),
      epicOnlineServicesId: faker.random.alphaNumeric(16),
      steamId: faker.random.alphaNumeric(16),
      xboxLiveId: faker.random.alphaNumeric(16),
      positionX: 500 - parseInt(faker.random.numeric(3), 10),
      positionY: 500 - parseInt(faker.random.numeric(3), 10),
      positionZ: 500 - parseInt(faker.random.numeric(3), 10),
    }));

    await Promise.all(
      players.map(async (p) => {
        return (await this.redis).hSet(getRedisKey(`player:${p.gameId}`), p);
      })
    );
  }

  async getPlayer(playerRef: IPlayerReferenceDTO): Promise<IGamePlayer | null> {
    const player = await (
      await this.redis
    ).hGetAll(getRedisKey(`player:${playerRef.gameId}`));

    if (!player) {
      return null;
    }

    return new IGamePlayer().construct(player);
  }

  async getPlayers(): Promise<IGamePlayer[]> {
    const players = await (await this.redis).keys(getRedisKey('player:*'));
    const playerData = await Promise.all(
      players.map(async (p) => {
        return (await this.redis).hGetAll(p);
      })
    );

    return await Promise.all(
      playerData.map((p) => new IGamePlayer().construct(p))
    );
  }

  async getPlayerLocation(
    playerRef: IPlayerReferenceDTO
  ): Promise<IPosition | null> {
    const player = await (
      await this.redis
    ).hGetAll(getRedisKey(`player:${playerRef.gameId}`));
    if (!player) {
      return null;
    }

    return {
      x: parseInt(player.positionX, 10),
      y: parseInt(player.positionY, 10),
      z: parseInt(player.positionZ, 10),
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

    if (rawCommand === 'connectAll') {
      const players = await this.getPlayers();
      await Promise.all(
        players.map(async (p) => {
          const event = await new EventPlayerConnected().construct({
            player: p,
            msg: `${p.name} connected`,
            timestamp: new Date(),
          });
          this.socketServer.io.emit(GameEvents.PLAYER_CONNECTED, event);
        })
      );
      output.rawResult = 'Connected all players';
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
    const player = await (
      await this.redis
    ).hGetAll(getRedisKey(`player:${playerRef.gameId}`));

    if (!player) {
      throw new errors.NotFoundError('Player not found');
    }

    player.positionX = x.toString();
    player.positionY = y.toString();
    player.positionZ = z.toString();

    await (
      await this.redis
    ).hSet(getRedisKey(`player:${playerRef.gameId}`), player);

    await this.sendLog(`Teleported ${player.name} to ${x}, ${y}, ${z}`);
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
