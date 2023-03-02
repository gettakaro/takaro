import { TakaroService } from './Base';

import {
  GameServerModel,
  GameServerRepo,
  GAME_SERVER_TYPE,
} from '../db/gameserver';
import {
  IsEnum,
  IsJSON,
  IsObject,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';
import { Mock, SevenDaysToDie, Rust } from '@takaro/gameserver';
import { errors } from '@takaro/util';
import { IGameServerInMemoryManager } from '../lib/GameServerManager';
import { config } from '../config';
import { SettingsService } from './SettingsService';
import { TakaroDTO } from '@takaro/util';
import { ITakaroQuery } from '@takaro/db';
import { PaginatedOutput } from '../db/base';
import { ModuleService } from './ModuleService';

export class GameServerOutputDTO extends TakaroDTO<GameServerOutputDTO> {
  @IsUUID()
  id: string;
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

export class ModuleInstallationOutputDTO extends TakaroDTO<ModuleInstallationOutputDTO> {
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

  async delete(id: string): Promise<boolean> {
    await this.gameServerManager.remove(id);
    return this.repo.delete(id);
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
      const game = GameServerService.getGame(gameserver.type);
      const instance = new game(gameserver.connectionInfo);

      return instance.testReachability();
    } else if (connectionInfo && type) {
      const game = GameServerService.getGame(type);
      const instance = new game(connectionInfo);

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
    return this.repo.installModule(gameserverId, moduleId, installDto);
  }

  async uninstallModule(gameserverId: string, moduleId: string) {
    return this.repo.uninstallModule(gameserverId, moduleId);
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

  static getGame(type: GAME_SERVER_TYPE) {
    switch (type) {
      case GAME_SERVER_TYPE.SEVENDAYSTODIE:
        return SevenDaysToDie;
      case GAME_SERVER_TYPE.RUST:
        return Rust;
      case GAME_SERVER_TYPE.MOCK:
        if (config.get('mode') === 'production') {
          throw new errors.BadRequestError('Mock server is not allowed');
        }
        return Mock;
      default:
        throw new errors.NotImplementedError();
    }
  }

  get manager() {
    return this.gameServerManager;
  }

  async executeCommand(id: string, rawCommand: string) {
    const gameserver = await this.repo.findOne(id);
    const game = GameServerService.getGame(gameserver.type);
    const instance = new game(gameserver.connectionInfo);

    return instance.executeConsoleCommand(rawCommand);
  }
}
