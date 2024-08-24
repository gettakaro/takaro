import { errors, logger } from '@takaro/util';
import { Redis } from '@takaro/db';

import { getSocketServer } from '../socket/index.js';
import { IPlayerReferenceDTO, IGameServer, IMessageOptsDTO, CommandOutput, BanDTO, IItemDTO } from '@takaro/gameserver';
import {
  EventLogLine,
  GameEvents,
  IGamePlayer,
  EventChatMessage,
  EventPlayerConnected,
  EventPlayerDisconnected,
  IPosition,
  HookEvents,
  ChatChannel,
} from '@takaro/modules';
import { faker } from '@faker-js/faker';
import { config } from '../../config.js';
import { playScenario } from './scenario.js';

export type IMockGameServer = Omit<IGameServer, 'getEventEmitter' | 'connectionInfo' | 'testReachability' | 'destroy'>;

const REDIS_PREFIX = `mock-game:${config.get('mockserver.name')}:`;

export class MockGameserver implements IMockGameServer {
  private log = logger('Mock');
  private socketServer = getSocketServer();
  private redis = Redis.getClient('mockgameserver');

  constructor(public name: string) {}

  private getRedisKey(key: string) {
    return `${REDIS_PREFIX}${this.name}:${key}`;
  }

  // eslint-disable-next-line
  emitEvent(
    type:
      | 'log'
      | 'chat-message'
      | 'player-connected'
      | 'player-disconnected'
      | 'player-death'
      | 'entity-killed'
      | 'gameEvent'
      | 'pong',
    data: any,
  ) {
    this.socketServer.io.emit(type, { name: this.name, ...data });
  }

  async setPlayerOnlineStatus(playerRef: IPlayerReferenceDTO, online: boolean) {
    const player = await (await this.redis).hGetAll(this.getRedisKey(`player:${playerRef.gameId}`));

    if (!player) {
      throw new errors.NotFoundError('Player not found');
    }

    player.online = online.toString();

    await (await this.redis).hSet(this.getRedisKey(`player:${playerRef.gameId}`), player);

    if (online) {
      const event = new EventPlayerConnected({
        player: new IGamePlayer(player),
        msg: `${player.name} connected`,
      });
      this.emitEvent(HookEvents.PLAYER_CONNECTED, event);
    } else {
      const event = new EventPlayerDisconnected({
        player: new IGamePlayer(player),
        msg: `${player.name} disconnected`,
      });
      this.emitEvent(HookEvents.PLAYER_DISCONNECTED, event);
    }
  }

  async ensurePlayersPersisted() {
    const existingPlayers = await (await this.redis).keys(this.getRedisKey('player:*'));

    if (existingPlayers.length > 0) {
      return;
    }

    const players = Array.from(Array(5).keys()).map((p) => ({
      gameId: p.toString(),
      name: faker.internet.userName(),
      epicOnlineServicesId: faker.string.alphanumeric(16),
      steamId: faker.string.alphanumeric(16),
      xboxLiveId: faker.string.alphanumeric(16),
      positionX: 500 - faker.number.int({ max: 999 }),
      positionY: 500 - faker.number.int({ max: 999 }),
      positionZ: 500 - faker.number.int({ max: 999 }),
      online: 'true',
    }));

    await Promise.all(
      players.map(async (p) => {
        return (await this.redis).hSet(this.getRedisKey(`player:${p.gameId}`), p);
      }),
    );
  }

  async giveItem(player: IPlayerReferenceDTO, item: string, amount: number): Promise<void> {
    this.sendLog(`Giving ${player.gameId} ${amount}x${item}`);
  }

  async getPlayer(playerRef: IPlayerReferenceDTO, onlyOnline = true): Promise<IGamePlayer | null> {
    const player = await (await this.redis).hGetAll(this.getRedisKey(`player:${playerRef.gameId}`));

    if (!player) return null;
    if (player.online === 'false' && onlyOnline) return null;

    return new IGamePlayer({
      gameId: player.gameId.toString(),
      name: player.name,
      ip: player.ip,
      steamId: player.steamId,
      ping: faker.number.int({ max: 99 }),
    });
  }

  async getPlayers(onlyOnline = true): Promise<IGamePlayer[]> {
    const players = await (await this.redis).keys(this.getRedisKey('player:*'));
    let playerData = await Promise.all(
      players.map(async (p) => {
        return (await this.redis).hGetAll(p);
      }),
    );

    if (onlyOnline) playerData = playerData.filter((p) => p.online === 'true');

    return await Promise.all(
      playerData.map(
        (player) =>
          new IGamePlayer({
            gameId: player.gameId.toString(),
            name: player.name,
            ip: player.ip,
            steamId: player.steamId,
            ping: faker.number.int({ max: 99 }),
          }),
      ),
    );
  }

  async getPlayerLocation(playerRef: IPlayerReferenceDTO): Promise<IPosition | null> {
    const player = await (await this.redis).hGetAll(this.getRedisKey(`player:${playerRef.gameId}`));
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
    const output = new CommandOutput({
      rawResult: 'Unknown command (Command not implemented yet in mock game server 👼)',
      success: false,
    });

    if (rawCommand === 'version') {
      output.rawResult = 'Mock game server v0.0.1';
      output.success = true;
    }

    if (rawCommand === 'connectAll') {
      const players = await this.getPlayers(false);
      await Promise.all(
        players.map(async (p) => {
          await this.setPlayerOnlineStatus(p, true);
        }),
      );
      output.rawResult = 'Connected all players';
      output.success = true;
    }

    if (rawCommand === 'disconnectAll') {
      const players = await this.getPlayers(true);
      await Promise.all(
        players.map(async (p) => {
          await this.setPlayerOnlineStatus(p, false);
        }),
      );
      output.rawResult = 'Disconnected all players';
      output.success = true;
    }

    if (rawCommand === 'scenario') {
      playScenario(this.socketServer.io, this).catch((err) => {
        this.log.error(err);
      });

      output.rawResult = 'Started scenario';
      output.success = true;
    }

    if (rawCommand.startsWith('say')) {
      const message = rawCommand.replace('say ', '');
      await this.sendMessage(message, new IMessageOptsDTO({}));
      output.rawResult = `Sent message: ${message}`;
      output.success = true;
    }

    await this.sendLog(`${output.success ? '🟢' : '🔴'} Command executed: ${rawCommand}`);

    return output;
  }

  async sendMessage(message: string, opts: IMessageOptsDTO) {
    const options = { ...opts };
    const fullMessage = `[🗨️ Chat] Server: ${options.recipient ? '[DM]' : ''} ${message}`;

    this.emitEvent(
      GameEvents.CHAT_MESSAGE,
      new EventChatMessage({
        msg: message,
        channel: ChatChannel.GLOBAL,
      }),
    );
    await this.sendLog(fullMessage);
  }

  async teleportPlayer(playerRef: IPlayerReferenceDTO, x: number, y: number, z: number) {
    const player = await (await this.redis).hGetAll(this.getRedisKey(`player:${playerRef.gameId}`));

    if (!player) {
      throw new errors.NotFoundError('Player not found');
    }

    player.positionX = x.toString();
    player.positionY = y.toString();
    player.positionZ = z.toString();

    await (await this.redis).hSet(this.getRedisKey(`player:${playerRef.gameId}`), player);

    await this.sendLog(`Teleported ${player.name} to ${x}, ${y}, ${z}`);
  }

  async kickPlayer(playerRef: IPlayerReferenceDTO, reason: string): Promise<void> {
    const player = await this.getPlayer(playerRef);

    if (!player) {
      throw new errors.NotFoundError('Player not found');
    }

    this.emitEvent(
      GameEvents.PLAYER_DISCONNECTED,
      new EventPlayerDisconnected({
        player,
        msg: `${player.name} disconnected: Kicked ${reason}`,
      }),
    );
  }

  async banPlayer(options: BanDTO): Promise<void> {
    const player = await this.getPlayer(options.player);

    if (!player) {
      throw new errors.NotFoundError('Player not found');
    }

    const banDto = new BanDTO({
      player: options.player,
      reason: options.reason,
      expiresAt: options.expiresAt,
    });

    this.emitEvent(
      GameEvents.PLAYER_DISCONNECTED,
      new EventPlayerDisconnected({
        player,
        msg: `${player.name} disconnected: Banned ${options.reason} until ${options.expiresAt}`,
      }),
    );

    if (options.expiresAt) {
      const expireTimestamp = new Date(options.expiresAt).valueOf();

      (await this.redis).set(this.getRedisKey(`ban:${options.player.gameId}`), JSON.stringify(banDto), {
        EXAT: expireTimestamp,
      });
    } else {
      (await this.redis).set(this.getRedisKey(`ban:${options.player.gameId}`), JSON.stringify(banDto));
    }
  }

  async unbanPlayer(playerRef: IPlayerReferenceDTO): Promise<void> {
    const player = await this.getPlayer(playerRef);

    if (!player) {
      throw new errors.NotFoundError('Player not found');
    }

    await this.sendLog(`Unbanned ${player.name}`);

    (await this.redis).del(this.getRedisKey(`ban:${playerRef.gameId}`));
  }

  async listBans(): Promise<BanDTO[]> {
    const keys = await (await this.redis).keys(this.getRedisKey('ban:*'));
    const banData = await (await this.redis).mGet(keys);

    const banDataWithPlayer = await Promise.all(
      banData.map(async (ban) => {
        if (!ban) return null;
        const banDto = JSON.parse(ban) as BanDTO;
        const player = await this.getPlayer(banDto.player);
        if (!player) return null;
        return new BanDTO({
          ...banDto,
          player,
        });
      }),
    );

    return banDataWithPlayer.filter(Boolean) as BanDTO[];
  }

  async listItems(): Promise<IItemDTO[]> {
    return [
      new IItemDTO({
        code: 'wood',
        name: 'Wood',
        description: 'Wood is good',
      }),
      new IItemDTO({
        code: 'stone',
        name: 'Stone',
        description: 'Stone can get you stoned',
      }),
    ];
  }

  private async sendLog(msg: string) {
    const logLine = new EventLogLine({
      msg,
    });
    this.emitEvent(HookEvents.LOG_LINE, logLine);
  }

  async getPlayerInventory(/* playerRef: IPlayerReferenceDTO */): Promise<IItemDTO[]> {
    return [
      new IItemDTO({
        code: 'wood',
        amount: faker.number.int({ max: 99 }),
      }),
      new IItemDTO({
        code: 'stone',
        amount: faker.number.int({ max: 99 }),
      }),
    ];
  }
}

const cachedMockServer: Map<string, MockGameserver> = new Map();

export async function getMockServer(name: string = 'mock') {
  if (!cachedMockServer.has(name)) {
    cachedMockServer.set(name, new MockGameserver(name));
  }

  return cachedMockServer.get(name) as MockGameserver;
}
