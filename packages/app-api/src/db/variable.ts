import { ITakaroQuery, QueryBuilder, TakaroModel } from '@takaro/db';
import { errors, traceableClass } from '@takaro/util';
import { ITakaroRepo } from './base.js';
import { VariableCreateDTO, VariableOutputDTO, VariableUpdateDTO } from '../service/VariablesService.js';
import { config } from '../config.js';
import { GameServerModel } from './gameserver.js';
import { ModuleModel } from './module.js';
import { PlayerModel } from './player.js';

export const VARIABLES_TABLE_NAME = 'variables';

export class VariablesModel extends TakaroModel {
  static tableName = VARIABLES_TABLE_NAME;
  key!: string;
  value!: string;

  gameServerId?: string;
  playerId?: string;
  moduleId?: string;

  expiresAt?: string;

  static relationMappings = {
    gameServer: {
      relation: TakaroModel.BelongsToOneRelation,
      modelClass: GameServerModel,
      join: {
        from: `${VARIABLES_TABLE_NAME}.gameServerId`,
        to: `${GameServerModel.tableName}.id`,
      },
    },
    player: {
      relation: TakaroModel.BelongsToOneRelation,
      modelClass: PlayerModel,
      join: {
        from: `${VARIABLES_TABLE_NAME}.playerId`,
        to: `${PlayerModel.tableName}.id`,
      },
    },
    module: {
      relation: TakaroModel.BelongsToOneRelation,
      modelClass: ModuleModel,
      join: {
        from: `${VARIABLES_TABLE_NAME}.moduleId`,
        to: `${ModuleModel.tableName}.id`,
      },
    },
  };
}

@traceableClass('repo:variable')
export class VariableRepo extends ITakaroRepo<VariablesModel, VariableOutputDTO, VariableCreateDTO, VariableUpdateDTO> {
  async getModel() {
    const knex = await this.getKnex();
    const model = VariablesModel.bindKnex(knex);
    return {
      model,
      query: model.query().modify('domainScoped', this.domainId),
    };
  }
  async find(filters: ITakaroQuery<VariableOutputDTO>) {
    const { query } = await this.getModel();
    // Create a subquery for expiring variables
    // We filter out any vars that are past the expiry date AND are not null
    const subquery = query.clone().whereNotNull('expiresAt').where('expiresAt', '<', new Date().toISOString());

    const qry = new QueryBuilder<VariablesModel, VariableOutputDTO>(filters).build(query);

    const result = await qry.whereNotIn('id', subquery.select('id'));

    return {
      total: result.total,
      results: await Promise.all(result.results.map((item) => new VariableOutputDTO(item))),
    };
  }

  async findOne(id: string): Promise<VariableOutputDTO> {
    const { query } = await this.getModel();
    // Create a subquery for expiring variables
    // We filter out any vars that are past the expiry date AND are not null
    const subquery = query.clone().whereNotNull('expiresAt').where('expiresAt', '<', new Date().toISOString());

    const data = await query.findById(id).whereNotIn('id', subquery.select('id'));

    if (!data) {
      throw new errors.NotFoundError();
    }

    return new VariableOutputDTO(data);
  }

  async create(item: VariableCreateDTO): Promise<VariableOutputDTO> {
    const { query } = await this.getModel();

    // @ts-expect-error badly typed knex query... :(
    const currentTotal = (await query.count({ count: '*' }))[0].count;

    if (config.get('takaro.maxVariables') <= currentTotal) {
      throw new errors.BadRequestError('Too many variables');
    }

    const data = await query
      .insert({
        ...item.toJSON(),
        domain: this.domainId,
      })
      .returning('*');
    return new VariableOutputDTO(data);
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.findOne(id);
    if (!existing) throw new errors.NotFoundError();

    const { query } = await this.getModel();
    const data = await query.deleteById(id);
    return !!data;
  }

  async update(id: string, data: VariableUpdateDTO): Promise<VariableOutputDTO> {
    const existing = await this.findOne(id);
    if (!existing) throw new errors.NotFoundError();

    const { query } = await this.getModel();
    const res = await query.updateAndFetchById(id, data.toJSON()).returning('*');
    return new VariableOutputDTO(res);
  }
}
