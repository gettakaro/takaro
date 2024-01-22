import { TakaroService } from './Base.js';
import { GameServerModel, GameServerRepo } from '../db/gameserver.js';
import { IsBoolean, IsEnum, IsJSON, IsObject, IsOptional, IsString, IsUUID, Length } from 'class-validator';
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
} from '@takaro/gameserver';
import { errors, TakaroModelDTO, traceableClass } from '@takaro/util';
import { SettingsService } from './SettingsService.js';
import { TakaroDTO } from '@takaro/util';
import { queueService } from '@takaro/queues';
import { HookEvents, IPosition, TakaroEventServerStatusChanged } from '@takaro/modules';
import { ITakaroQuery } from '@takaro/db';
import { PaginatedOutput } from '../db/base.js';
import { ModuleService } from './ModuleService.js';
import { JSONSchema } from 'class-validator-jsonschema';

// Curse you ESM... :(
import _Ajv from 'ajv';
import { CronJobService } from './CronJobService.js';
import { getEmptyConfigSchema } from '../lib/systemConfig.js';
import { PlayerService } from './PlayerService.js';
import { PlayerOnGameServerService, PlayerOnGameServerUpdateDTO } from './PlayerOnGameserverService.js';
import { ItemCreateDTO, ItemsService } from './ItemsService.js';
import { randomUUID } from 'crypto';
import { EventCreateDTO, EventService } from './EventService.js';

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
}

export class ModuleInstallDTO extends TakaroDTO<ModuleInstallDTO> {
  @IsJSON()
  @IsOptional()
  userConfig?: string;

  @IsJSON()
  @IsOptional()
  systemConfig?: string;
}

export class ModuleInstallationOutputDTO extends TakaroModelDTO<ModuleInstallationOutputDTO> {
  @IsUUID()
  gameserverId: string;

  @IsUUID()
  moduleId: string;

  @IsObject()
  userConfig: Record<string, any>;

  @JSONSchema(getEmptyConfigSchema())
  @IsObject()
  systemConfig: Record<string, any>;
}

@traceableClass('service:gameserver')
export class GameServerService extends TakaroService<
  GameServerModel,
  GameServerOutputDTO,
  GameServerCreateDTO,
  GameServerUpdateDTO
> {
  get repo() {
    return new GameServerRepo(this.domainId);
  }

  find(filters: ITakaroQuery<GameServerOutputDTO>): Promise<PaginatedOutput<GameServerOutputDTO>> {
    return this.repo.find(filters);
  }

  findOne(id: string): Promise<GameServerOutputDTO> {
    return this.repo.findOne(id);
  }

  async create(item: GameServerCreateDTO): Promise<GameServerOutputDTO> {
    const isReachable = await this.testReachability(undefined, JSON.parse(item.connectionInfo), item.type);

    if (!isReachable.connectable) {
      throw new errors.BadRequestError(`Game server is not reachable: ${isReachable.reason}`);
    }

    const createdServer = await this.repo.create(item);

    await queueService.queues.connector.queue.add({
      domainId: this.domainId,
      gameServerId: createdServer.id,
      operation: 'create',
      time: new Date().toISOString(),
    });

    await queueService.queues.itemsSync.queue.add(
      { domainId: this.domainId, gameServerId: createdServer.id },
      { jobId: `itemsSync-${this.domainId}-${createdServer.id}-${Date.now()}` }
    );

    await queueService.queues.playerSync.queue.add(
      { domainId: this.domainId, gameServerId: createdServer.id },
      { jobId: `playerSync-${this.domainId}-${createdServer.id}-${Date.now()}` }
    );
    return createdServer;
  }

  async delete(id: string) {
    const installedModules = await this.getInstalledModules({
      gameserverId: id,
    });
    await Promise.all(installedModules.map((mod) => this.uninstallModule(id, mod.moduleId)));

    gameClassCache.delete(id);
    await queueService.queues.connector.queue.add({
      domainId: this.domainId,
      gameServerId: id,
      operation: 'delete',
      time: new Date().toISOString(),
    });
    await this.repo.delete(id);
    return id;
  }

  async update(id: string, item: GameServerUpdateDTO): Promise<GameServerOutputDTO> {
    const updatedServer = await this.repo.update(id, item);
    gameClassCache.delete(id);
    await queueService.queues.connector.queue.add({
      domainId: this.domainId,
      gameServerId: id,
      operation: 'update',
      time: new Date().toISOString(),
    });
    return updatedServer;
  }

  async testReachability(id?: string, connectionInfo?: Record<string, unknown>, type?: GAME_SERVER_TYPE) {
    if (id) {
      const instance = await this.getGame(id);
      const reachability = await instance.testReachability();

      const currentServer = await this.findOne(id);

      if (currentServer.reachable !== reachability.connectable) {
        this.log.info(`Updating reachability for ${id} to ${reachability.connectable}`);
        await this.update(id, await new GameServerUpdateDTO().construct({ reachable: reachability.connectable }));
        const eventService = new EventService(this.domainId);
        await eventService.create(
          await new EventCreateDTO().construct({
            eventName: HookEvents.SERVER_STATUS_CHANGED,
            gameserverId: id,
            meta: await new TakaroEventServerStatusChanged().construct({
              status: reachability.connectable ? 'online' : 'offline',
              details: reachability.reason,
            }),
          })
        );
      }

      return reachability;
    } else if (connectionInfo && type) {
      const instance = await getGame(type, connectionInfo, {});
      return instance.testReachability();
    } else {
      throw new errors.BadRequestError('Missing required parameters');
    }
  }

  async getModuleInstallation(gameserverId: string, moduleId: string) {
    return this.repo.getModuleInstallation(gameserverId, moduleId);
  }

  async installModule(gameserverId: string, moduleId: string, installDto?: ModuleInstallDTO) {
    const moduleService = new ModuleService(this.domainId);
    const cronjobService = new CronJobService(this.domainId);
    const mod = await moduleService.findOne(moduleId);

    if (!mod) {
      throw new errors.NotFoundError('Module not found');
    }

    if (!installDto) {
      installDto = await new ModuleInstallDTO().construct({
        userConfig: JSON.stringify({}),
        systemConfig: JSON.stringify({}),
      });
    }

    const modUserConfig = JSON.parse(installDto.userConfig ?? '{}');
    const validateUserConfig = ajv.compile(JSON.parse(mod.configSchema));
    const isValidUserConfig = validateUserConfig(modUserConfig);

    const modSystemConfig = JSON.parse(installDto.systemConfig ?? '{}');
    const validateSystemConfig = ajv.compile(JSON.parse(mod.systemConfigSchema));
    const isValidSystemConfig = validateSystemConfig(modSystemConfig);

    if (!isValidUserConfig || !isValidSystemConfig) {
      const allErrors = [...(validateSystemConfig.errors ?? []), ...(validateUserConfig.errors ?? [])];
      const prettyErrors = allErrors
        ?.map((e) => {
          if (e.keyword === 'additionalProperties') {
            return `${e.message}, invalid: ${e.params.additionalProperty}`;
          }

          return `${e.instancePath} ${e.message}`;
        })
        .join(', ');
      throw new errors.BadRequestError(`Invalid config: ${prettyErrors}`);
    }

    // ajv mutates the object, so we need to stringify it again
    installDto.userConfig = JSON.stringify(modUserConfig);
    installDto.systemConfig = JSON.stringify(modSystemConfig);

    const installation = await this.repo.installModule(gameserverId, moduleId, installDto);
    await cronjobService.syncModuleCronjobs(installation);

    return new ModuleInstallationOutputDTO().construct({
      gameserverId,
      moduleId,
      userConfig: installation.userConfig,
      systemConfig: installation.systemConfig,
    });
  }

  async uninstallModule(gameserverId: string, moduleId: string) {
    const installation = await this.repo.getModuleInstallation(gameserverId, moduleId);

    const cronjobService = new CronJobService(this.domainId);
    await cronjobService.uninstallCronJobs(installation);

    await this.repo.uninstallModule(gameserverId, moduleId);

    return new ModuleInstallationOutputDTO().construct({
      gameserverId,
      moduleId,
    });
  }

  async getInstalledModules({ gameserverId, moduleId }: { gameserverId?: string; moduleId?: string }) {
    const installations = await this.repo.getInstalledModules({
      gameserverId,
      moduleId,
    });
    return installations;
  }

  async getGame(id: string): Promise<IGameServer> {
    const gameserver = await this.repo.findOne(id);
    let gameInstance = gameClassCache.get(id);

    if (gameInstance) {
      return gameInstance;
    }

    const settingsService = new SettingsService(this.domainId, id);
    const settingsArr = await settingsService.getAll();
    const settings = settingsArr.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    gameInstance = await getGame(gameserver.type, gameserver.connectionInfo, settings);

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

        return new GameServerTypesOutputDTO().construct({
          type: t,
          connectionInfoSchema: JSON.stringify(schema),
        });
      })
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
    const gameInstance = await this.getGame(gameServerId);
    return gameInstance.sendMessage(message, opts);
  }

  async teleportPlayer(gameServerId: string, playerId: string, position: IPosition) {
    const playerService = new PlayerService(this.domainId);
    const gameInstance = await this.getGame(gameServerId);
    return gameInstance.teleportPlayer(
      await playerService.getRef(playerId, gameServerId),
      position.x,
      position.y,
      position.z
    );
  }

  async banPlayer(gameServerId: string, playerId: string, reason: string, expiresAt: string) {
    const playerService = new PlayerService(this.domainId);
    const player = await playerService.getRef(playerId, gameServerId);
    const gameInstance = await this.getGame(gameServerId);
    return gameInstance.banPlayer(
      await new BanDTO().construct({
        player,
        reason,
        expiresAt,
      })
    );
  }

  async kickPlayer(gameServerId: string, playerId: string, reason: string) {
    const playerService = new PlayerService(this.domainId);
    const player = await playerService.getRef(playerId, gameServerId);
    const gameInstance = await this.getGame(gameServerId);
    return gameInstance.kickPlayer(player, reason);
  }

  async unbanPlayer(gameServerId: string, playerId: string) {
    const playerService = new PlayerService(this.domainId);
    const player = await playerService.getRef(playerId, gameServerId);
    const gameInstance = await this.getGame(gameServerId);
    return gameInstance.unbanPlayer(player);
  }

  async listBans(gameServerId: string) {
    const gameInstance = await this.getGame(gameServerId);
    return gameInstance.listBans();
  }
  async giveItem(gameServerId: string, playerId: string, item: string, amount: number) {
    const playerService = new PlayerService(this.domainId);
    const gameInstance = await this.getGame(gameServerId);
    const playerRef = await playerService.getRef(playerId, gameServerId);
    return gameInstance.giveItem(playerRef, item, amount);
  }

  async getPlayers(gameServerId: string) {
    const gameInstance = await this.getGame(gameServerId);
    const players = await gameInstance.getPlayers();

    const playerOnGameServerService = new PlayerOnGameServerService(this.domainId);

    try {
      await Promise.all(
        players.map(async (player) =>
          playerOnGameServerService.addInfo(
            player,
            gameServerId,
            await new PlayerOnGameServerUpdateDTO().construct({
              ping: player.ping,
              ip: player.ip,
            })
          )
        )
      );
    } catch (error) {
      this.log.warn('Failed to update player info', { error });
    }

    return players;
  }

  async getPlayerLocation(gameServerId: string, playerId: string) {
    const playerService = new PlayerService(this.domainId);
    const gameInstance = await this.getGame(gameServerId);
    const playerRef = await playerService.getRef(playerId, gameServerId);
    const location = await gameInstance.getPlayerLocation(playerRef);

    if (!location) return location;

    const playerOnGameServerService = new PlayerOnGameServerService(this.domainId);
    await playerOnGameServerService.addInfo(
      playerRef,
      gameServerId,
      await new PlayerOnGameServerUpdateDTO().construct({
        positionX: location.x,
        positionY: location.y,
        positionZ: location.z,
      })
    );

    return location;
  }

  async syncItems(gameServerId: string) {
    const itemsService = new ItemsService(this.domainId);
    const gameInstance = await this.getGame(gameServerId);
    const items = await gameInstance.listItems();

    const toInsert = await Promise.all(
      items.map((item) =>
        new ItemCreateDTO().construct({
          ...item,
          gameserverId: gameServerId,
        })
      )
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
        const pog = await pogService.resolveRef(p, gameServerId);
        if (!pog) throw new errors.NotFoundError('Player not found');
        await pogRepo.syncInventory(pog.id, gameServerId, inventory);
      })
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

  async import(data: Express.Multer.File) {
    let parsed;

    const raw = data.buffer.toString();

    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      throw new errors.BadRequestError('Invalid JSON');
    }

    const job = await queueService.queues.csmmImport.queue.add(
      { csmmExport: parsed, domainId: this.domainId },
      {
        jobId: randomUUID(),
      }
    );

    return {
      id: job.id,
    };
  }
}
