import { ITakaroQuery, QueryBuilder, TakaroModel } from '@takaro/db';
import { Model } from 'objection';
import { errors } from '@takaro/util';
import { GAMESERVER_TABLE_NAME } from './gameserver';
import { ITakaroRepo } from './base';
import {
  PlayerCreateDTO,
  PlayerOutputDTO,
  PlayerUpdateDTO,
} from '../service/PlayerService';

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

  static get relationMappings() {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const GameServerModel = require('./gameserver.ts').GameServerModel;

    return {
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
    };
  }
}

export class PlayerRepo extends ITakaroRepo<
  PlayerModel,
  PlayerOutputDTO,
  PlayerCreateDTO,
  PlayerUpdateDTO
> {
  async getModel() {
    const knex = await this.getKnex();
    return PlayerModel.bindKnex(knex);
  }
  async find(filters: ITakaroQuery<PlayerOutputDTO>) {
    const model = await this.getModel();
    const result = await new QueryBuilder<PlayerModel, PlayerOutputDTO>(
      filters
    ).build(model.query());
    return {
      total: result.total,
      results: result.results.map((item) => new PlayerOutputDTO(item)),
    };
  }

  async findOne(id: string): Promise<PlayerOutputDTO> {
    const model = await this.getModel();
    const data = await model.query().findById(id);

    if (!data) {
      throw new errors.NotFoundError();
    }

    return new PlayerOutputDTO(data);
  }

  async create(item: PlayerCreateDTO): Promise<PlayerOutputDTO> {
    const model = await this.getModel();
    const player = await model.query().insert(item.toJSON()).returning('*');
    return new PlayerOutputDTO(player);
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.findOne(id);
    if (!existing) throw new errors.NotFoundError();

    const model = await this.getModel();
    const data = await model.query().deleteById(id);
    return !!data;
  }

  async update(id: string, data: PlayerUpdateDTO): Promise<PlayerOutputDTO> {
    const existing = await this.findOne(id);
    if (!existing) throw new errors.NotFoundError();

    const model = await this.getModel();
    const res = await model
      .query()
      .updateAndFetchById(id, data.toJSON())
      .returning('*');
    return new PlayerOutputDTO(res);
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
