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
  config: string;
}

export class ModuleInstallationOutputDTO extends TakaroModelDTO<ModuleInstallationOutputDTO> {
  @IsUUID()
  gameserverId: string;

  @IsUUID()
  moduleId: string;

  @IsJSON()
  config: string;
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
    await this.repo.installModule(gameserverId, moduleId, installDto);

    return new ModuleInstallationOutputDTO().construct({
      gameserverId,
      moduleId,
    });
  }

  async uninstallModule(gameserverId: string, moduleId: string) {
    await this.repo.uninstallModule(gameserverId, moduleId);

    return new ModuleInstallationOutputDTO().construct({
      gameserverId,
      moduleId,
    });
  }

  async getInstalledModules(gameserverId: string) {
    const installations = await this.repo.getInstalledModules(gameserverId);
    const moduleService = new ModuleService(this.domainId);
    return await Promise.all(
      installations.map((i) => {
        return moduleService.findOne(i.moduleId);
      })
    );
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
