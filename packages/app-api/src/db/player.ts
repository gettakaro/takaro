import { ITakaroQuery, QueryBuilder, TakaroModel } from '@takaro/db';
import { Model } from 'objection';
import { errors } from '@takaro/util';
import { GameServerModel, GAMESERVER_TABLE_NAME } from './gameserver.js';
import { ITakaroRepo } from './base.js';
import { PlayerCreateDTO, PlayerOutputDTO, PlayerUpdateDTO } from '../service/PlayerService.js';
import { IPlayerReferenceDTO } from '@takaro/gameserver';

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

export class PlayerRepo extends ITakaroRepo<PlayerModel, PlayerOutputDTO, PlayerCreateDTO, PlayerUpdateDTO> {
  async getModel() {
    const knex = await this.getKnex();
    const model = PlayerModel.bindKnex(knex);
    return {
      model,
      query: model.query().modify('domainScoped', this.domainId),
    };
  }
  async find(filters: ITakaroQuery<PlayerOutputDTO>) {
    const { query } = await this.getModel();
    const result = await new QueryBuilder<PlayerModel, PlayerOutputDTO>(filters).build(query);
    return {
      total: result.total,
      results: await Promise.all(result.results.map((item) => new PlayerOutputDTO().construct(item))),
    };
  }

  async findOne(id: string): Promise<PlayerOutputDTO> {
    const { query } = await this.getModel();
    const data = await query.findById(id);

    if (!data) {
      throw new errors.NotFoundError();
    }

    return new PlayerOutputDTO().construct(data);
  }

  async create(item: PlayerCreateDTO): Promise<PlayerOutputDTO> {
    const { query } = await this.getModel();
    const player = await query
      .insert({
        ...item.toJSON(),
        domain: this.domainId,
      })
      .returning('*');
    return new PlayerOutputDTO().construct(player);
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.findOne(id);
    if (!existing) throw new errors.NotFoundError();

    const { query } = await this.getModel();
    const data = await query.deleteById(id);
    return !!data;
  }

  async update(id: string, data: PlayerUpdateDTO): Promise<PlayerOutputDTO> {
    const existing = await this.findOne(id);
    if (!existing) throw new errors.NotFoundError();

    const { query } = await this.getModel();
    const res = await query.updateAndFetchById(id, data.toJSON()).returning('*');
    return new PlayerOutputDTO().construct(res);
  }

  async findGameAssociations(gameId: string) {
    const knex = await this.getKnex();
    const model = PlayerOnGameServerModel.bindKnex(knex);
    const foundProfiles = await model.query().modify('domainScoped', this.domainId).where({ gameId });
    return foundProfiles;
  }

  async insertAssociation(gameId: string, playerId: string, gameServerId: string) {
    const knex = await this.getKnex();
    const model = PlayerOnGameServerModel.bindKnex(knex);
    const foundProfiles = await model.query().insert({
      gameId,
      playerId,
      gameServerId,
      domain: this.domainId,
    });
    return foundProfiles;
  }

  async resolveRef(ref: IPlayerReferenceDTO, gameServerId: string): Promise<PlayerOutputDTO> {
    const knex = await this.getKnex();
    const model = PlayerOnGameServerModel.bindKnex(knex);

    const foundProfiles = await model
      .query()
      .modify('domainScoped', this.domainId)
      .where({ gameId: ref.gameId, gameServerId });

    if (foundProfiles.length === 0) {
      throw new errors.NotFoundError();
    }

    const player = await this.findOne(foundProfiles[0].playerId);
    return player;
  }

  async getRef(playerId: string, gameServerId: string) {
    const knex = await this.getKnex();
    const model = PlayerOnGameServerModel.bindKnex(knex);

    const foundProfiles = await model.query().modify('domainScoped', this.domainId).where({ playerId, gameServerId });

    if (foundProfiles.length === 0) {
      throw new errors.NotFoundError();
    }

    return new IPlayerReferenceDTO().construct(foundProfiles[0]);
  }
}
