import { TakaroService } from './Base.js';
import { GameServerModel, GameServerRepo } from '../db/gameserver.js';
import { IsBoolean, IsEnum, IsJSON, IsObject, IsOptional, IsString, Length } from 'class-validator';
import {
  IMessageOptsDTO,
  IGameServer,
  IPlayerReferenceDTO,
  sdtdJsonSchema,
  rustJsonSchema,
  mockJsonSchema,
  GAME_SERVER_TYPE,
  getGame,
  BanDTO,
  TestReachabilityOutputDTO,
} from '@takaro/gameserver';
import { errors, TakaroModelDTO, traceableClass, TakaroDTO } from '@takaro/util';
import { SettingsService } from './SettingsService.js';
import { queueService } from '@takaro/queues';
import {
  HookEvents,
  IPosition,
  TakaroEventServerStatusChanged,
  GameEvents,
  EventChatMessage,
  ChatChannel,
  TakaroEventGameserverCreated,
  TakaroEventGameserverDeleted,
  TakaroEventGameserverUpdated,
} from '@takaro/modules';
import { ITakaroQuery } from '@takaro/db';
import { PaginatedOutput } from '../db/base.js';
import { ModuleService } from './Module/index.js';

// Curse you ESM... :(
import _Ajv from 'ajv';
import { PlayerService } from './Player/index.js';
import { PlayerOnGameServerService, PlayerOnGameServerUpdateDTO } from './PlayerOnGameserverService.js';
import { ItemCreateDTO, ItemsService } from './ItemsService.js';
import { randomUUID } from 'crypto';
import { EVENT_TYPES, EventCreateDTO, EventService } from './EventService.js';
import { gameServerLatency } from '../lib/metrics.js';
import { Pushgateway } from 'prom-client';
import { config } from '../config.js';
import { handlePlayerSync } from '../workers/playerSyncWorker.js';
import { ImportInputDTO } from '../controllers/GameServerController.js';
import { DomainService } from './DomainService.js';

const Ajv = _Ajv as unknown as typeof _Ajv.default;
const ajv = new Ajv({ useDefaults: true, strict: true });

// Since input types have undistinguishable schemas. We need an annotation to parse into the correct input type.
// E.g. a select and country input both have an enum schema, to distinguish them we use the x-component: 'country'.
ajv.addKeyword('x-component');

const gameClassCache = new Map<string, IGameServer>();

class GameServerTypesOutputDTO extends TakaroDTO<GameServerTypesOutputDTO> {
  @IsEnum(GAME_SERVER_TYPE)
  type!: GAME_SERVER_TYPE;

  @IsString()
  @IsJSON()
  connectionInfoSchema!: string;
}
export class GameServerOutputDTO extends TakaroModelDTO<GameServerOutputDTO> {
  @IsString()
  name: string;
  @IsObject()
  connectionInfo: Record<string, unknown>;
  @IsString()
  @IsEnum(GAME_SERVER_TYPE)
  type: GAME_SERVER_TYPE;
  @IsBoolean()
  reachable: boolean;
  @IsBoolean()
  enabled: boolean;
  @IsString()
  @IsOptional()
  identityToken?: string;
}

export class GameServerCreateDTO extends TakaroDTO<GameServerCreateDTO> {
  @IsString()
  @Length(3, 50)
  name: string;
  @IsJSON()
  connectionInfo: string;
  @IsString()
  @IsEnum(GAME_SERVER_TYPE)
  type: GAME_SERVER_TYPE;
  @IsString()
  @IsOptional()
  identityToken?: string;
}

export class GameServerUpdateDTO extends TakaroDTO<GameServerUpdateDTO> {
  @Length(3, 50)
  @IsString()
  name: string;
  @IsJSON()
  connectionInfo: string;
  @IsString()
  @IsEnum(GAME_SERVER_TYPE)
  type: GAME_SERVER_TYPE;
  @IsBoolean()
  @IsOptional()
  reachable: boolean;
  @IsBoolean()
  @IsOptional()
  enabled: boolean;
}

@traceableClass('service:gameserver')
export class GameServerService extends TakaroService<
  GameServerModel,
  GameServerOutputDTO,
  GameServerCreateDTO,
  GameServerUpdateDTO
> {
  private playerService = new PlayerService(this.domainId);
  private pogService = new PlayerOnGameServerService(this.domainId);
  private moduleService = new ModuleService(this.domainId);

  get repo() {
    return new GameServerRepo(this.domainId);
  }

  public refreshGameInstance(id: string) {
    gameClassCache.delete(id);
  }

  find(filters: ITakaroQuery<GameServerOutputDTO>): Promise<PaginatedOutput<GameServerOutputDTO>> {
    return this.repo.find(filters);
  }

  findOne(id: string, decryptConnectionInfo: boolean): Promise<GameServerOutputDTO> {
    return this.repo.findOne(id, decryptConnectionInfo);
  }

  async create(item: GameServerCreateDTO): Promise<GameServerOutputDTO> {
    const domain = await new DomainService().findOne(this.domainId);
    if (!domain) throw new errors.NotFoundError('Domain not found');
    const currentServers = await this.find({ limit: 1 });
    if (currentServers.total >= domain.maxGameservers) {
      throw new errors.BadRequestError('Max game servers reached');
    }
    let isReachable = new TestReachabilityOutputDTO({ connectable: false, reason: 'Unknown' });
    // Generic gameservers start the connection, so they are always reachable
    if (item.type === GAME_SERVER_TYPE.GENERIC) {
      isReachable = new TestReachabilityOutputDTO({
        connectable: true,
        reason: 'Generic gameservers are always reachable',
      });
      if (!item.identityToken) throw new errors.BadRequestError('Identity token is required for generic gameservers');
    } else {
      isReachable = await this.testReachability(undefined, JSON.parse(item.connectionInfo), item.type);
    }
    const createdServer = await this.repo.create(item);

    const eventsService = new EventService(this.domainId);
    await eventsService.create(
      new EventCreateDTO({
        eventName: EVENT_TYPES.GAMESERVER_CREATED,
        gameserverId: createdServer.id,
        meta: new TakaroEventGameserverCreated(),
      }),
    );
    if (createdServer.type !== GAME_SERVER_TYPE.GENERIC) {
      await queueService.queues.connector.queue.add({
        domainId: this.domainId,
        gameServerId: createdServer.id,
        operation: 'create',
        time: new Date().toISOString(),
      });
    }

    await queueService.queues.itemsSync.queue.add(
      { domainId: this.domainId, gameServerId: createdServer.id },
      { jobId: `itemsSync-${this.domainId}-${createdServer.id}-init` },
    );

    if (isReachable.connectable && createdServer.type !== GAME_SERVER_TYPE.GENERIC) {
      await handlePlayerSync(createdServer.id, this.domainId);
    }

    return createdServer;
  }

  async delete(id: string) {
    const existing = await this.findOne(id, false);
    if (!existing) throw new errors.NotFoundError('Game server not found');
    const installedModules = await this.moduleService.findInstallations({
      filters: { gameserverId: [id] },
    });
    await Promise.all(
      installedModules.results.map((installation) =>
        this.moduleService.uninstallModule(installation.gameserverId, installation.moduleId),
      ),
    );

    this.refreshGameInstance(id);

    const gateway = new Pushgateway(config.get('metrics.pushgatewayUrl'), {});
    gateway.delete({ jobName: 'worker', groupings: { gameserver: id } });

    if (existing.type !== GAME_SERVER_TYPE.GENERIC) {
      await queueService.queues.connector.queue.add({
        domainId: this.domainId,
        gameServerId: id,
        operation: 'delete',
        time: new Date().toISOString(),
      });
    }

    await this.repo.delete(id);
    const eventsService = new EventService(this.domainId);
    await eventsService.create(
      new EventCreateDTO({
        eventName: EVENT_TYPES.GAMESERVER_DELETED,
        gameserverId: id,
        meta: new TakaroEventGameserverDeleted(),
      }),
    );
    await queueService.queues.system.queue.add(
      {
        domainId: this.domainId,
      },
      {},
      'gameServerDelete',
    );
    return id;
  }

  async update(id: string, item: GameServerUpdateDTO): Promise<GameServerOutputDTO> {
    const updatedServer = await this.repo.update(id, item);
    this.refreshGameInstance(id);
    const eventsService = new EventService(this.domainId);
    await eventsService.create(
      new EventCreateDTO({
        eventName: EVENT_TYPES.GAMESERVER_UPDATED,
        gameserverId: id,
        meta: new TakaroEventGameserverUpdated(),
      }),
    );
    if (updatedServer.type !== GAME_SERVER_TYPE.GENERIC) {
      await queueService.queues.connector.queue.add({
        domainId: this.domainId,
        gameServerId: id,
        operation: 'update',
        time: new Date().toISOString(),
      });
    }

    return updatedServer;
  }

  async testReachability(id?: string, connectionInfo?: Record<string, unknown>, type?: GAME_SERVER_TYPE) {
    if (id) {
      const instance = await this.getGame(id);
      const reachability = await instance.testReachability();
      gameServerLatency.set({ gameserver: id, domain: this.domainId }, reachability.latency ?? 0);

      const currentServer = await this.findOne(id, true);

      if (currentServer.reachable !== reachability.connectable) {
        this.log.info(`Updating reachability for ${id} to ${reachability.connectable}`);
        await this.update(id, new GameServerUpdateDTO({ reachable: reachability.connectable }));
        const eventService = new EventService(this.domainId);
        await eventService.create(
          new EventCreateDTO({
            eventName: HookEvents.SERVER_STATUS_CHANGED,
            gameserverId: id,
            meta: new TakaroEventServerStatusChanged({
              status: reachability.connectable ? 'online' : 'offline',
              details: reachability.reason,
            }),
          }),
        );
      }

      // When a user is trying to fix their connection info, it's important we don't cache stale/wrong connection info
      if (!reachability.connectable) {
        this.refreshGameInstance(id);
      }

      return reachability;
    } else if (connectionInfo && type) {
      const instance = await getGame(type, connectionInfo, {}, 'unknown-id');
      return instance.testReachability();
    }
    throw new errors.BadRequestError('Missing required parameters');
  }

  async getGame(id: string): Promise<IGameServer> {
    const gameserver = await this.repo.findOne(id, true);

    if (!gameserver.enabled) throw new errors.BadRequestError('Game server is disabled');

    let gameInstance = gameClassCache.get(id);

    if (gameInstance) {
      return gameInstance;
    }

    const settingsService = new SettingsService(this.domainId, id);
    const settingsArr = await settingsService.getAll();
    const settings = settingsArr.reduce<Record<string, string>>((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    gameInstance = await getGame(gameserver.type, gameserver.connectionInfo, settings, id);

    gameClassCache.set(id, gameInstance);

    return gameInstance;
  }

  async getTypes(): Promise<GameServerTypesOutputDTO[]> {
    return Promise.all(
      Object.values(GAME_SERVER_TYPE).map((t) => {
        let schema;

        switch (t) {
          case GAME_SERVER_TYPE.SEVENDAYSTODIE:
            schema = sdtdJsonSchema;
            break;
          case GAME_SERVER_TYPE.RUST:
            schema = rustJsonSchema;
            break;
          case GAME_SERVER_TYPE.MOCK:
            schema = mockJsonSchema;
            break;
          default:
            throw new errors.NotImplementedError();
        }

        return new GameServerTypesOutputDTO({
          type: t,
          connectionInfoSchema: JSON.stringify(schema),
        });
      }),
    );
  }

  async getPlayer(gameServerId: string, playerRef: IPlayerReferenceDTO) {
    const gameInstance = await this.getGame(gameServerId);
    return gameInstance.getPlayer(playerRef);
  }

  async executeCommand(gameServerId: string, rawCommand: string) {
    const gameInstance = await this.getGame(gameServerId);
    return gameInstance.executeConsoleCommand(rawCommand);
  }

  async sendMessage(gameServerId: string, message: string, opts: IMessageOptsDTO) {
    // Limit message length to 300 characters
    // Longer than this and gameservers start acting _weird_
    message = message.substring(0, 300);

    const gameInstance = await this.getGame(gameServerId);
    await gameInstance.sendMessage(message, opts);

    const eventService = new EventService(this.domainId);
    const meta = new EventChatMessage({
      msg: message,
      channel: ChatChannel.GLOBAL,
      timestamp: new Date().toISOString(),
    });

    await eventService.create(
      new EventCreateDTO({
        eventName: GameEvents.CHAT_MESSAGE,
        gameserverId: gameServerId,
        meta,
      }),
    );
  }

  async teleportPlayer(gameServerId: string, playerId: string, position: IPosition) {
    const gameInstance = await this.getGame(gameServerId);

    return gameInstance.teleportPlayer(
      await this.pogService.getPog(playerId, gameServerId),
      position.x,
      position.y,
      position.z,
    );
  }

  async banPlayer(gameServerId: string, playerId: string, reason: string, expiresAt: string) {
    const player = await this.pogService.getPog(playerId, gameServerId);
    const gameInstance = await this.getGame(gameServerId);
    this.log.info('Banning player', { playerId, gameServerId, reason, expiresAt });
    return gameInstance.banPlayer(
      new BanDTO({
        player,
        reason,
        expiresAt,
      }),
    );
  }

  async kickPlayer(gameServerId: string, playerId: string, reason: string) {
    const player = await this.pogService.getPog(playerId, gameServerId);
    const gameInstance = await this.getGame(gameServerId);
    this.log.info('Kicking player', { playerId, gameServerId, reason });
    return gameInstance.kickPlayer(player, reason);
  }

  async unbanPlayer(gameServerId: string, playerId: string) {
    const player = await this.pogService.getPog(playerId, gameServerId);
    const gameInstance = await this.getGame(gameServerId);
    this.log.info('Unbanning player', { playerId, gameServerId });
    return gameInstance.unbanPlayer(player);
  }

  async listBans(gameServerId: string) {
    const gameInstance = await this.getGame(gameServerId);
    return gameInstance.listBans();
  }
  async giveItem(gameServerId: string, playerId: string, item: string, amount: number, quality?: string) {
    const gameInstance = await this.getGame(gameServerId);
    const pog = await this.pogService.getPog(playerId, gameServerId);
    return gameInstance.giveItem(pog, item, amount, quality);
  }

  async shutdown(gameServerId: string) {
    const gameInstance = await this.getGame(gameServerId);
    return gameInstance.shutdown();
  }

  async getPlayers(gameServerId: string) {
    const gameInstance = await this.getGame(gameServerId);
    const gamePlayers = await gameInstance.getPlayers();
    return gamePlayers;
  }

  async getPlayerLocation(gameServerId: string, playerId: string) {
    const gameInstance = await this.getGame(gameServerId);
    const pog = await this.pogService.getPog(playerId, gameServerId);
    const location = await gameInstance.getPlayerLocation(pog);

    if (!location) return location;

    const playerOnGameServerService = new PlayerOnGameServerService(this.domainId);

    await playerOnGameServerService.update(
      pog.id,
      new PlayerOnGameServerUpdateDTO({
        positionX: location.x,
        positionY: location.y,
        positionZ: location.z,
      }),
    );

    return location;
  }

  async syncItems(gameServerId: string) {
    const itemsService = new ItemsService(this.domainId);
    const gameInstance = await this.getGame(gameServerId);
    const items = await gameInstance.listItems();

    const toInsert = await Promise.all(
      items.map((item) => {
        delete item.amount;
        return new ItemCreateDTO({
          ...item,
          gameserverId: gameServerId,
        });
      }),
    );

    await itemsService.upsertMany(toInsert);
  }

  async syncInventories(gameServerId: string) {
    const onlinePlayers = await this.getPlayers(gameServerId);
    const gameInstance = await this.getGame(gameServerId);
    const pogService = new PlayerOnGameServerService(this.domainId);
    const pogRepo = pogService.repo;

    await Promise.all(
      onlinePlayers.map(async (p) => {
        const inventory = await gameInstance.getPlayerInventory(p);
        const { pog } = await this.playerService.resolveRef(p, gameServerId);
        if (!pog) throw new errors.NotFoundError('Player not found');
        await pogRepo.syncInventory(pog.id, gameServerId, inventory);
      }),
    );
  }

  async getImport(id: string) {
    const job = await queueService.queues.csmmImport.queue.bullQueue.getJob(id);

    if (!job) {
      throw new errors.NotFoundError('Job not found');
    }

    return {
      jobId: job.id,
      status: await job.getState(),
      failedReason: job.failedReason,
    };
  }

  async import(importData: Record<string, unknown>, options: ImportInputDTO) {
    const job = await queueService.queues.csmmImport.queue.add(
      { csmmExport: importData, domainId: this.domainId, options },
      {
        jobId: randomUUID(),
      },
    );

    return {
      id: job.id,
    };
  }

  async getMapInfo(gameServerId: string) {
    const gameInstance = await this.getGame(gameServerId);
    return gameInstance.getMapInfo();
  }

  async getMapTile(gameServerId: string, x: number, y: number, z: number) {
    const gameInstance = await this.getGame(gameServerId);
    return gameInstance.getMapTile(x, y, z);
  }
}
