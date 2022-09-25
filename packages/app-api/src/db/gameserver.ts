import { TakaroModel, ITakaroQuery, QueryBuilder } from '@takaro/db';
import { Model, PartialModelObject } from 'objection';
import { errors } from '@takaro/logger';
import { ITakaroRepo } from './base';
import {
  PlayerOnGameServerModel,
  PLAYER_ON_GAMESERVER_TABLE_NAME,
} from './player';

export const GAMESERVER_TABLE_NAME = 'gameservers';

export enum GAME_SERVER_TYPE {
  'MOCK' = 'MOCK',
  'SEVENDAYSTODIE' = 'SEVENDAYSTODIE',
  'RUST' = 'RUST',
}

export class GameServerModel extends TakaroModel {
  static tableName = GAMESERVER_TABLE_NAME;
  name!: string;

  connectionInfo!: Record<string, unknown>;

  type!: GAME_SERVER_TYPE;

  static relationMappings = {
    players: {
      relation: Model.HasManyRelation,
      modelClass: PlayerOnGameServerModel,
      join: {
        from: `${GAMESERVER_TABLE_NAME}.id`,
        to: `${PLAYER_ON_GAMESERVER_TABLE_NAME}.gameServerId`,
      },
    },
  };
}

export class GameServerRepo extends ITakaroRepo<GameServerModel> {
  constructor(public readonly domainId: string) {
    super(domainId);
  }

  async getModel() {
    const knex = await this.getKnex();
    return GameServerModel.bindKnex(knex);
  }

  async find(
    filters: ITakaroQuery<GameServerModel>
  ): Promise<GameServerModel[]> {
    const params = new QueryBuilder(filters).build(GAMESERVER_TABLE_NAME);
    const model = await this.getModel();
    return await model.query().where(params.where);
  }

  async findOne(id: string): Promise<GameServerModel> {
    const model = await this.getModel();
    const data = await model.query().findById(id);

    if (!data) {
      throw new errors.NotFoundError(`Record with id ${id} not found`);
    }

    return data;
  }

  async create(
    item: PartialModelObject<GameServerModel>
  ): Promise<GameServerModel> {
    const model = await this.getModel();
    return model.query().insert(item).returning('*');
  }

  async delete(id: string): Promise<boolean> {
    const model = await this.getModel();
    const data = await model.query().deleteById(id);
    return !!data;
  }

  async update(
    id: string,
    data: PartialModelObject<GameServerModel>
  ): Promise<GameServerModel> {
    const model = await this.getModel();
    return model.query().updateAndFetchById(id, data).returning('*');
  }
}
