import { ITakaroQuery, QueryBuilder, TakaroModel } from '@takaro/db';
import { Model, PartialModelObject } from 'objection';
import { errors } from '@takaro/logger';
import { GameServerModel, GAMESERVER_TABLE_NAME } from './gameserver';
import { ITakaroRepo } from './base';

export const PLAYER_ON_GAMESERVER_TABLE_NAME = 'playerOnGameServer';

export const PLAYER_TABLE_NAME = 'players';

export class PlayerOnGameServerModel extends TakaroModel {
  static tableName = PLAYER_ON_GAMESERVER_TABLE_NAME;

  gameServerId!: string;
  playerId!: string;

  gameId!: string;
}

export class PlayerModel extends TakaroModel {
  static tableName = PLAYER_TABLE_NAME;
  name!: string;
  steamId?: string;
  xboxLiveId?: string;
  epicOnlineServicesId?: string;

  static relationMappings = () => ({
    gameServers: {
      relation: Model.ManyToManyRelation,
      modelClass: GameServerModel,
      join: {
        from: `${PLAYER_TABLE_NAME}.id`,
        through: {
          from: `${PLAYER_ON_GAMESERVER_TABLE_NAME}.gameServerId`,
          to: `${PLAYER_ON_GAMESERVER_TABLE_NAME}.playerId`,
        },
        to: `${GAMESERVER_TABLE_NAME}.id`,
      },
    },
  });
}

export class PlayerRepo extends ITakaroRepo<PlayerModel> {
  async getModel() {
    const knex = await this.getKnex();
    return PlayerModel.bindKnex(knex);
  }
  async find(filters: ITakaroQuery<PlayerModel>): Promise<PlayerModel[]> {
    const params = new QueryBuilder(filters).build();
    const model = await this.getModel();
    return await model.query().where(params.where);
  }

  async findOne(id: string): Promise<PlayerModel> {
    const model = await this.getModel();
    const data = await model.query().findById(id);

    if (!data) {
      throw new errors.NotFoundError();
    }

    return data;
  }

  async create(item: PartialModelObject<PlayerModel>): Promise<PlayerModel> {
    const model = await this.getModel();
    const player = await model.query().insert(item).returning('*');
    return player;
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.findOne(id);
    if (!existing) throw new errors.NotFoundError();

    const model = await this.getModel();
    const data = await model.query().deleteById(id);
    return !!data;
  }

  async update(
    id: string,
    data: PartialModelObject<PlayerModel>
  ): Promise<PlayerModel> {
    const existing = await this.findOne(id);
    if (!existing) throw new errors.NotFoundError();

    const model = await this.getModel();
    return model.query().updateAndFetchById(id, data).returning('*');
  }

  async findGameAssociations(gameId: string) {
    const knex = await this.getKnex();
    const model = PlayerOnGameServerModel.bindKnex(knex);
    const foundProfiles = await model.query().where({ gameId });
    return foundProfiles;
  }

  async insertAssociation(
    gameId: string,
    playerId: string,
    gameServerId: string
  ) {
    const knex = await this.getKnex();
    const model = PlayerOnGameServerModel.bindKnex(knex);
    const foundProfiles = await model.query().insert({
      gameId,
      playerId,
      gameServerId,
    });
    return foundProfiles;
  }
}
