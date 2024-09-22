import { TakaroModel, ITakaroQuery, QueryBuilder } from '@takaro/db';
import { Model } from 'objection';
import { errors, traceableClass } from '@takaro/util';
import { ITakaroRepo } from './base.js';

import { BanCreateDTO, BanOutputDTO, BanUpdateDTO } from '../service/Ban/dto.js';
import { GameServerModel } from './gameserver.js';
import { PlayerModel } from './player.js';

export const BANS_TABLE_NAME = 'bans';

export class BanModel extends TakaroModel {
  static tableName = BANS_TABLE_NAME;
  gameServerId: string;
  playerId: string;

  takaroManaged: boolean;
  until: Date;

  static get relationMappings() {
    return {
      gameServer: {
        relation: Model.BelongsToOneRelation,
        modelClass: GameServerModel,
        join: {
          from: `${BANS_TABLE_NAME}.gameServerId`,
          to: `${GameServerModel.tableName}.id`,
        },
      },
      player: {
        relation: Model.BelongsToOneRelation,
        modelClass: PlayerModel,
        join: {
          from: `${BANS_TABLE_NAME}.playerId`,
          to: `${PlayerModel.tableName}.id`,
        },
      },
    };
  }
}

@traceableClass('repo:ban')
export class BanRepo extends ITakaroRepo<BanModel, BanOutputDTO, BanCreateDTO, BanUpdateDTO> {
  constructor(public readonly domainId: string) {
    super(domainId);
  }

  async getModel() {
    const knex = await this.getKnex();
    const model = BanModel.bindKnex(knex);
    return {
      model,
      query: model.query().modify('domainScoped', this.domainId),
    };
  }

  async find(filters: ITakaroQuery<BanOutputDTO>) {
    const { query } = await this.getModel();
    const result = await new QueryBuilder<BanModel, BanOutputDTO>({
      ...filters,
    }).build(query);
    return {
      total: result.total,
      results: await Promise.all(result.results.map((item) => new BanOutputDTO(item))),
    };
  }

  async findOne(id: string): Promise<BanOutputDTO> {
    const { query } = await this.getModel();
    const data = await query.findById(id);

    if (!data) {
      throw new errors.NotFoundError(`Record with id ${id} not found`);
    }

    return new BanOutputDTO(data);
  }

  async create(_item: BanCreateDTO): Promise<BanOutputDTO> {
    throw new errors.NotImplementedError();
  }

  async delete(_id: string): Promise<boolean> {
    throw new errors.NotImplementedError();
  }

  async update(_id: string, _data: BanUpdateDTO): Promise<BanOutputDTO> {
    throw new errors.NotImplementedError();
  }
}
