import { TakaroModel, ITakaroQuery, QueryBuilder } from '@takaro/db';
import { Model, PartialModelObject } from 'objection';
import { errors } from '@takaro/logger';
import { ITakaroRepo } from './base';
import { PlayerModel, PLAYER_TABLE_NAME } from './player';
import { JsonObject } from 'type-fest';

const TABLE_NAME = 'gameservers';
export const PLAYER_ON_GAMESERVER_TABLE_NAME = 'playerOnGameServer';

export enum GAME_SERVER_TYPE {
  'MOCK' = 'MOCK',
  'SEVENDAYSTODIE' = 'SEVENDAYSTODIE',
  'RUST' = 'RUST',
}

export class PlayerOnGameServerModel extends TakaroModel {
  static tableName = PLAYER_ON_GAMESERVER_TABLE_NAME;

  gameServerId!: string;
  playerId!: string;

  gameId!: string;
}

export class GameServerModel extends TakaroModel {
  static tableName = TABLE_NAME;
  name!: string;

  connectionInfo!: JsonObject;

  type!: GAME_SERVER_TYPE;

  static relationMappings = {
    players: {
      relation: Model.ManyToManyRelation,
      modelClass: PlayerModel,
      join: {
        from: `${TABLE_NAME}.id`,
        through: {
          from: `${PLAYER_ON_GAMESERVER_TABLE_NAME}.gameServerId`,
          to: `${PLAYER_ON_GAMESERVER_TABLE_NAME}.playerId`,
        },
        to: `${PLAYER_TABLE_NAME}.id`,
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
    const params = new QueryBuilder(filters).build(TABLE_NAME);
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
