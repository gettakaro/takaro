import { errors, logger } from '@takaro/util';
import { Redis } from '@takaro/db';

import { getSocketServer } from '../socket/index.js';
import {
  IPlayerReferenceDTO,
  IGameServer,
  IMessageOptsDTO,
  CommandOutput,
  BanDTO,
  IItemDTO,
  MapInfoDTO,
  IEntityDTO,
  ILocationDTO,
  EntityType,
} from '@takaro/gameserver';
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
  EventEntityKilled,
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

    const dimensions = ['overworld', 'nether', 'end'];

    const players = Array.from(Array(5).keys()).map((p) => ({
      gameId: p.toString(),
      name: faker.internet.userName(),
      epicOnlineServicesId: faker.string.alphanumeric(16),
      steamId: faker.string.alphanumeric(16),
      xboxLiveId: faker.string.alphanumeric(16),
      positionX: 500 - faker.number.int({ max: 999 }),
      positionY: 500 - faker.number.int({ max: 999 }),
      positionZ: 500 - faker.number.int({ max: 999 }),
      dimension: dimensions[faker.number.int({ min: 0, max: dimensions.length - 1 })],
      online: 'true',
    }));

    await Promise.all(
      players.map(async (p) => {
        return (await this.redis).hSet(this.getRedisKey(`player:${p.gameId}`), p);
      }),
    );
  }

  async giveItem(player: IPlayerReferenceDTO, item: string, amount: number, quality?: string): Promise<void> {
    this.sendLog(`Giving ${player.gameId} ${amount}x${item}${quality ? ` (quality: ${quality})` : ''}`);
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
      ping: player.ping ? parseInt(player.ping, 10) : faker.number.int({ max: 99 }),
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
            ping: player.ping ? parseInt(player.ping, 10) : faker.number.int({ max: 99 }),
          }),
      ),
    );
  }

  async getPlayerLocation(playerRef: IPlayerReferenceDTO): Promise<IPosition | null> {
    const player = await (await this.redis).hGetAll(this.getRedisKey(`player:${playerRef.gameId}`));
    if (!player) {
      return null;
    }

    return new IPosition({
      x: parseInt(player.positionX, 10),
      y: parseInt(player.positionY, 10),
      z: parseInt(player.positionZ, 10),
      dimension: player.dimension || undefined,
    });
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

    if (rawCommand.startsWith('ban')) {
      const [_, playerId, reason] = rawCommand.split(' ');
      await this.banPlayer(
        new BanDTO({
          player: new IPlayerReferenceDTO({ gameId: playerId }),
          reason,
        }),
      );
      output.rawResult = `Banned player ${playerId} with reason: ${reason}`;
      output.success = true;
    }

    if (rawCommand.startsWith('unban')) {
      const [_, playerId] = rawCommand.split(' ');
      await this.unbanPlayer(new IPlayerReferenceDTO({ gameId: playerId }));
      output.rawResult = `Unbanned player ${playerId}`;
      output.success = true;
    }

    if (rawCommand.startsWith('triggerKill')) {
      const [_, playerId] = rawCommand.split(' ');
      const player = await this.getPlayer(new IPlayerReferenceDTO({ gameId: playerId }));
      this.emitEvent(
        GameEvents.ENTITY_KILLED,
        new EventEntityKilled({
          entity: 'zombie',
          player,
          weapon: 'knife',
        }),
      );
      output.rawResult = `Triggered kill for player ${playerId}`;
      output.success = true;
    }

    if (rawCommand.startsWith('setPlayerPing')) {
      const [_, steamId, pingValue] = rawCommand.split(' ');
      const allPlayerKeys = await (await this.redis).keys(this.getRedisKey('player:*'));
      let playerFound = false;

      for (const playerKey of allPlayerKeys) {
        const player = await (await this.redis).hGetAll(playerKey);
        if (player.steamId === steamId) {
          await (await this.redis).hSet(playerKey, 'ping', pingValue);
          output.rawResult = `Set ping for player ${steamId} to ${pingValue}`;
          output.success = true;
          playerFound = true;
          break;
        }
      }

      if (!playerFound) {
        output.rawResult = `Player with steamId ${steamId} not found`;
        output.success = false;
      }
    }

    if (rawCommand.startsWith('connectPlayer')) {
      const [_, steamId] = rawCommand.split(' ');
      const allPlayerKeys = await (await this.redis).keys(this.getRedisKey('player:*'));
      let playerFound = false;

      for (const playerKey of allPlayerKeys) {
        const player = await (await this.redis).hGetAll(playerKey);
        if (player.steamId === steamId) {
          const playerRef = new IPlayerReferenceDTO({ gameId: player.gameId });
          await this.setPlayerOnlineStatus(playerRef, true);
          output.rawResult = `Connected player ${steamId}`;
          output.success = true;
          playerFound = true;
          break;
        }
      }

      if (!playerFound) {
        output.rawResult = `Player with steamId ${steamId} not found`;
        output.success = false;
      }
    }

    await this.sendLog(`${output.success ? '🟢' : '🔴'} Command executed: ${rawCommand}`);

    return output;
  }

  async sendMessage(message: string, opts: IMessageOptsDTO) {
    const options = { ...opts };
    const senderName = options.senderNameOverride || 'Server';
    const fullMessage = `[🗨️ Chat] ${senderName}: ${options.recipient ? '[DM]' : ''} ${message}`;

    this.emitEvent(
      GameEvents.CHAT_MESSAGE,
      new EventChatMessage({
        msg: message,
        channel: options.recipient ? ChatChannel.WHISPER : ChatChannel.GLOBAL,
      }),
    );
    await this.sendLog(fullMessage);
  }

  async teleportPlayer(playerRef: IPlayerReferenceDTO, x: number, y: number, z: number, dimension?: string) {
    const player = await (await this.redis).hGetAll(this.getRedisKey(`player:${playerRef.gameId}`));

    if (!player) {
      throw new errors.NotFoundError('Player not found');
    }

    player.positionX = x.toString();
    player.positionY = y.toString();
    player.positionZ = z.toString();

    if (dimension !== undefined) {
      player.dimension = dimension;
    }

    await (await this.redis).hSet(this.getRedisKey(`player:${playerRef.gameId}`), player);

    const dimensionMsg = dimension ? ` in dimension ${dimension}` : '';
    await this.sendLog(`Teleported ${player.name} to ${x}, ${y}, ${z}${dimensionMsg}`);
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
    if (!keys.length) return [];
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
      new IItemDTO({
        code: 'iron',
        name: 'Iron',
        description: 'Iron is strong',
      }),
      new IItemDTO({
        code: 'gold',
        name: 'Gold',
        description: 'Gold is shiny',
      }),
      new IItemDTO({
        code: 'adminGun',
        name: 'Admin Gun',
        description: 'A powerful gun for admins',
      }),
      new IItemDTO({
        code: 'healingPotion',
        name: 'Healing Potion',
        description: 'Restores health over time',
      }),
      new IItemDTO({
        code: 'magicWand',
        name: 'Magic Wand',
        description: 'A wand that casts spells',
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

  async shutdown() {
    await this.sendLog('Shutting down');
  }

  async getMapInfo() {
    return new MapInfoDTO({
      enabled: false,
      mapBlockSize: 100,
      maxZoom: 5,
      mapSizeX: 1000,
      mapSizeY: 1000,
      mapSizeZ: 1000,
    });
  }

  async getMapTile(_x: number, _y: number, _z: number) {
    return '';
  }

  async listEntities(): Promise<IEntityDTO[]> {
    return [
      new IEntityDTO({
        code: 'zombie',
        name: 'Zombie',
        description: 'A shambling undead creature',
        type: EntityType.HOSTILE,
      }),
      new IEntityDTO({
        code: 'skeleton',
        name: 'Skeleton',
        description: 'An undead archer',
        type: EntityType.HOSTILE,
      }),
      new IEntityDTO({
        code: 'spider',
        name: 'Spider',
        description: 'A large arachnid',
        type: EntityType.HOSTILE,
      }),
      new IEntityDTO({
        code: 'cow',
        name: 'Cow',
        description: 'A peaceful farm animal',
        type: EntityType.FRIENDLY,
      }),
      new IEntityDTO({
        code: 'pig',
        name: 'Pig',
        description: 'A pink farm animal',
        type: EntityType.FRIENDLY,
      }),
      new IEntityDTO({
        code: 'sheep',
        name: 'Sheep',
        description: 'A woolly farm animal',
        type: EntityType.FRIENDLY,
      }),
      new IEntityDTO({
        code: 'chicken',
        name: 'Chicken',
        description: 'A small farm bird',
        type: EntityType.FRIENDLY,
      }),
      new IEntityDTO({
        code: 'wolf',
        name: 'Wolf',
        description: 'A wild canine that can be tamed',
        type: EntityType.NEUTRAL,
      }),
      new IEntityDTO({
        code: 'enderman',
        name: 'Enderman',
        description: 'A tall dark creature from another dimension',
        type: EntityType.NEUTRAL,
      }),
      new IEntityDTO({
        code: 'villager',
        name: 'Villager',
        description: 'A peaceful NPC that trades items',
        type: EntityType.FRIENDLY,
        metadata: { profession: 'merchant', canTrade: true },
      }),
      new IEntityDTO({
        code: 'creeper',
        name: 'Creeper',
        description: 'An explosive green creature',
        type: EntityType.HOSTILE,
        metadata: { explosive: true, range: 3 },
      }),
      new IEntityDTO({
        code: 'horse',
        name: 'Horse',
        description: 'A rideable animal',
        type: EntityType.FRIENDLY,
        metadata: { rideable: true, speed: 'fast' },
      }),
    ];
  }

  async listLocations(): Promise<ILocationDTO[]> {
    return [];
  }
}

const cachedMockServer: Map<string, MockGameserver> = new Map();

export async function getMockServer(name: string = 'mock') {
  if (!cachedMockServer.has(name)) {
    cachedMockServer.set(name, new MockGameserver(name));
  }

  return cachedMockServer.get(name) as MockGameserver;
}
