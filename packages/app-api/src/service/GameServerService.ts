import { TakaroService } from './Base.js';

import {
  GameServerModel,
  GameServerRepo,
  GAME_SERVER_TYPE,
} from '../db/gameserver.js';
import {
  IsEnum,
  IsJSON,
  IsObject,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';
import {
  Mock,
  SevenDaysToDie,
  Rust,
  IMessageOptsDTO,
  SdtdConnectionInfo,
  RustConnectionInfo,
  MockConnectionInfo,
  IGameServer,
  IPosition,
  IGamePlayer,
} from '@takaro/gameserver';
import { errors, TakaroModelDTO } from '@takaro/util';
import { IGameServerInMemoryManager } from '../lib/GameServerManager.js';
import { SettingsService } from './SettingsService.js';
import { TakaroDTO } from '@takaro/util';
import { ITakaroQuery } from '@takaro/db';
import { PaginatedOutput } from '../db/base.js';
import { ModuleService } from './ModuleService.js';
import { PlayerService } from './PlayerService.js';
import { JSONSchema } from 'class-validator-jsonschema';

// Curse you ESM... :(
import _Ajv from 'ajv';
import { CronJobService } from './CronJobService.js';
import { getEmptySystemConfigSchema } from '../lib/systemConfig.js';
const Ajv = _Ajv as unknown as typeof _Ajv.default;

const ajv = new Ajv({ useDefaults: true });

export class GameServerOutputDTO extends TakaroModelDTO<GameServerOutputDTO> {
  @IsString()
  name: string;
  @IsObject()
  connectionInfo: Record<string, unknown>;
  @IsString()
  @IsEnum(GAME_SERVER_TYPE)
  type: GAME_SERVER_TYPE;
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
}

export class ModuleInstallDTO extends TakaroDTO<ModuleInstallDTO> {
  @IsJSON()
  userConfig: string;

  @IsJSON()
  systemConfig: string;
}

export class ModuleInstallationOutputDTO extends TakaroModelDTO<ModuleInstallationOutputDTO> {
  @IsUUID()
  gameserverId: string;

  @IsUUID()
  moduleId: string;

  @IsObject()
  userConfig: Record<string, never>;

  @JSONSchema(getEmptySystemConfigSchema())
  @IsObject()
  systemConfig: Record<string, never>;
}

const manager = new IGameServerInMemoryManager();

export class GameServerService extends TakaroService<
  GameServerModel,
  GameServerOutputDTO,
  GameServerCreateDTO,
  GameServerUpdateDTO
> {
  private readonly gameServerManager = manager;

  get repo() {
    return new GameServerRepo(this.domainId);
  }

  find(
    filters: ITakaroQuery<GameServerOutputDTO>
  ): Promise<PaginatedOutput<GameServerOutputDTO>> {
    return this.repo.find(filters);
  }

  findOne(id: string): Promise<GameServerOutputDTO> {
    return this.repo.findOne(id);
  }

  async create(item: GameServerCreateDTO): Promise<GameServerOutputDTO> {
    const createdServer = await this.repo.create(item);

    const settingsService = new SettingsService(
      this.domainId,
      createdServer.id
    );

    await settingsService.init();

    await this.gameServerManager.add(this.domainId, createdServer);
    return createdServer;
  }

  async delete(id: string) {
    const installedModules = await this.getInstalledModules({
      gameserverId: id,
    });
    await Promise.all(
      installedModules.map((mod) => this.uninstallModule(id, mod.moduleId))
    );

    await this.gameServerManager.remove(id);
    await this.repo.delete(id);
    return id;
  }

  async update(
    id: string,
    item: GameServerUpdateDTO
  ): Promise<GameServerOutputDTO> {
    const updatedServer = await this.repo.update(id, item);
    await this.gameServerManager.remove(id);
    await this.gameServerManager.add(this.domainId, updatedServer);
    return updatedServer;
  }

  async testReachability(
    id?: string,
    connectionInfo?: Record<string, unknown>,
    type?: GAME_SERVER_TYPE
  ) {
    if (id) {
      const gameserver = await this.repo.findOne(id);
      const instance = await GameServerService.getGame(
        gameserver.type,
        gameserver.connectionInfo
      );

      return instance.testReachability();
    } else if (connectionInfo && type) {
      const instance = await GameServerService.getGame(type, connectionInfo);
      return instance.testReachability();
    } else {
      throw new errors.BadRequestError('Missing required parameters');
    }
  }

  async getModuleInstallation(gameserverId: string, moduleId: string) {
    return this.repo.getModuleInstallation(gameserverId, moduleId);
  }

  async installModule(
    gameserverId: string,
    moduleId: string,
    installDto: ModuleInstallDTO
  ) {
    const moduleService = new ModuleService(this.domainId);
    const cronjobService = new CronJobService(this.domainId);
    const mod = await moduleService.findOne(moduleId);

    if (!mod) {
      throw new errors.NotFoundError('Module not found');
    }

    const modUserConfig = JSON.parse(installDto.userConfig);
    const validateUserConfig = ajv.compile(JSON.parse(mod.configSchema));
    const isValidUserConfig = validateUserConfig(modUserConfig);

    const modSystemConfig = JSON.parse(installDto.systemConfig);
    const validateSystemConfig = ajv.compile(
      JSON.parse(mod.systemConfigSchema)
    );
    const isValidSystemConfig = validateSystemConfig(modSystemConfig);

    if (!isValidUserConfig || !isValidSystemConfig) {
      const allErrors = [
        ...(validateSystemConfig.errors ?? []),
        ...(validateUserConfig.errors ?? []),
      ];
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

    const installation = await this.repo.installModule(
      gameserverId,
      moduleId,
      installDto
    );
    await cronjobService.installCronJobs(installation);

    return new ModuleInstallationOutputDTO().construct({
      gameserverId,
      moduleId,
      userConfig: installation.userConfig,
      systemConfig: installation.systemConfig,
    });
  }

  async uninstallModule(gameserverId: string, moduleId: string) {
    const installation = await this.repo.getModuleInstallation(
      gameserverId,
      moduleId
    );

    const cronjobService = new CronJobService(this.domainId);
    await cronjobService.uninstallCronJobs(installation);

    await this.repo.uninstallModule(gameserverId, moduleId);

    return new ModuleInstallationOutputDTO().construct({
      gameserverId,
      moduleId,
    });
  }

  async getInstalledModules({
    gameserverId,
    moduleId,
  }: {
    gameserverId?: string;
    moduleId?: string;
  }) {
    const installations = await this.repo.getInstalledModules({
      gameserverId,
      moduleId,
    });
    return installations;
  }

  static async getGame(
    type: GAME_SERVER_TYPE,
    connectionInfo: Record<string, unknown>
  ): Promise<IGameServer> {
    switch (type) {
      case GAME_SERVER_TYPE.SEVENDAYSTODIE:
        return new SevenDaysToDie(
          await new SdtdConnectionInfo().construct(connectionInfo)
        );
      case GAME_SERVER_TYPE.RUST:
        return new Rust(
          await new RustConnectionInfo().construct(connectionInfo)
        );
      case GAME_SERVER_TYPE.MOCK:
        return new Mock(
          await new MockConnectionInfo().construct(connectionInfo)
        );
      default:
        throw new errors.NotImplementedError();
    }
  }

  async getGame(id: string): Promise<IGameServer> {
    const gameserver = await this.repo.findOne(id);
    return GameServerService.getGame(
      gameserver.type,
      gameserver.connectionInfo
    );
  }

  get manager() {
    return this.gameServerManager;
  }

  async executeCommand(gameServerId: string, rawCommand: string) {
    const gameserver = await this.repo.findOne(gameServerId);
    const instance = await GameServerService.getGame(
      gameserver.type,
      gameserver.connectionInfo
    );
    return instance.executeConsoleCommand(rawCommand);
  }

  async sendMessage(
    gameServerId: string,
    message: string,
    opts: IMessageOptsDTO
  ) {
    const gameserver = await this.repo.findOne(gameServerId);
    const instance = await GameServerService.getGame(
      gameserver.type,
      gameserver.connectionInfo
    );
    return instance.sendMessage(message, opts);
  }

  async teleportPlayer(
    gameServerId: string,
    playerGameId: string,
    position: IPosition
  ) {
    const game = await this.getGame(gameServerId);
    const playerService = new PlayerService(this.domainId);
    const foundPlayers = await playerService.findAssociations(playerGameId);

    if (foundPlayers.length === 0) {
      throw new errors.NotFoundError('Player not found');
    }

    const player = await new IGamePlayer().construct(foundPlayers[0]);

    return game.teleportPlayer(player, position.x, position.y, position.z);
  }
}
