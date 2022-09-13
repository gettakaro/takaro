import { TakaroService } from './Base';

import {
  GameServerModel,
  GameServerRepo,
  GAME_SERVER_TYPE,
} from '../db/gameserver';
import { IsEnum, IsJSON, IsString, IsUUID, Length } from 'class-validator';
import { Mock, SevenDaysToDie } from '@takaro/gameserver';
import { errors } from '@takaro/logger';
import { IGameServerInMemoryManager } from '../lib/GameServerManager';
import { PartialModelObject } from 'objection';
import { config } from '../config';
import { JsonObject } from 'type-fest';

export class GameServerOutputDTO {
  @IsUUID()
  id!: string;
  @IsString()
  name!: string;
  @IsJSON()
  connectionInfo!: JsonObject;
  @IsString()
  @IsEnum(GAME_SERVER_TYPE)
  type!: GAME_SERVER_TYPE;
}

export class GameServerCreateDTO {
  @IsString()
  @Length(3, 50)
  name!: string;
  @IsJSON()
  connectionInfo!: string;
  @IsString()
  @IsEnum(GAME_SERVER_TYPE)
  type!: GAME_SERVER_TYPE;
}

export class UpdateGameServerDTO {
  @Length(3, 50)
  @IsString()
  name!: string;

  @IsJSON()
  connectionInfo!: string;
  @IsString()
  @IsEnum(GAME_SERVER_TYPE)
  type!: GAME_SERVER_TYPE;
}

export class GameServerService extends TakaroService<GameServerModel> {
  private readonly gameServerManager = new IGameServerInMemoryManager();

  get repo() {
    return new GameServerRepo(this.domainId);
  }

  async create(
    item: PartialModelObject<GameServerModel>
  ): Promise<GameServerModel> {
    const createdServer = await this.repo.create(item);
    await this.gameServerManager.add(createdServer);
    return createdServer;
  }

  async delete(id: string): Promise<boolean> {
    await this.gameServerManager.remove(id);
    return this.repo.delete(id);
  }

  async update(
    id: string,
    item: PartialModelObject<GameServerModel>
  ): Promise<GameServerModel | undefined> {
    const updatedServer = await this.repo.update(id, item);
    await this.gameServerManager.remove(id);
    await this.gameServerManager.add(updatedServer);
    return updatedServer;
  }

  static getGame(type: GAME_SERVER_TYPE) {
    switch (type) {
      case GAME_SERVER_TYPE.SEVENDAYSTODIE:
        return new SevenDaysToDie();
        break;
      case GAME_SERVER_TYPE.MOCK:
        if (config.get('mode') === 'production') {
          throw new errors.BadRequestError('Mock server is not allowed');
        }
        return new Mock();
      default:
        throw new errors.NotImplementedError();
        break;
    }
  }

  get manager() {
    return this.gameServerManager;
  }
}
