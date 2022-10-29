import { TakaroModel, ITakaroQuery, QueryBuilder } from '@takaro/db';
import { errors } from '@takaro/logger';
import { ITakaroRepo } from './base';
import { Model } from 'objection';
import { CRONJOB_TABLE_NAME } from './cronjob';
import {
  FunctionCreateDTO,
  FunctionOutputDTO,
  FunctionUpdateDTO,
} from '../service/FunctionService';
import { HOOKS_TABLE_NAME } from './hook';

export const FUNCTION_TABLE_NAME = 'functions';

export class FunctionModel extends TakaroModel {
  static tableName = FUNCTION_TABLE_NAME;
  code!: string;

  static get relationMappings() {
    return {
      cronJob: {
        relation: Model.HasOneRelation,
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        modelClass: require('./cronjob').CronJobModel,
        join: {
          from: `${FUNCTION_TABLE_NAME}.id`,
          to: `${CRONJOB_TABLE_NAME}.id`,
        },
      },
      hook: {
        relation: Model.HasOneRelation,
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        modelClass: require('./hook').HookModel,
        join: {
          from: `${FUNCTION_TABLE_NAME}.id`,
          to: `${HOOKS_TABLE_NAME}.id`,
        },
      },
    };
  }
}

export class FunctionRepo extends ITakaroRepo<
  FunctionModel,
  FunctionOutputDTO,
  FunctionCreateDTO,
  FunctionUpdateDTO
> {
  constructor(public readonly domainId: string) {
    super(domainId);
  }

  async getModel() {
    const knex = await this.getKnex();
    return FunctionModel.bindKnex(knex);
  }

  async find(filters: ITakaroQuery<FunctionOutputDTO>) {
    const model = await this.getModel();
    const result = await new QueryBuilder<FunctionModel, FunctionOutputDTO>(
      filters
    ).build(model.query());
    return {
      total: result.total,
      results: result.results.map((item) => new FunctionOutputDTO(item)),
    };
  }

  async findOne(id: string): Promise<FunctionOutputDTO> {
    const model = await this.getModel();
    const data = await model.query().findById(id);

    if (!data) {
      throw new errors.NotFoundError(`Record with id ${id} not found`);
    }

    return new FunctionOutputDTO(data);
  }

  async create(item: FunctionCreateDTO): Promise<FunctionOutputDTO> {
    const model = await this.getModel();
    const data = await model.query().insert(item.toJSON()).returning('*');
    return new FunctionOutputDTO(data);
  }

  async delete(id: string): Promise<boolean> {
    const model = await this.getModel();
    const data = await model.query().deleteById(id);
    return !!data;
  }

  async update(
    id: string,
    data: FunctionUpdateDTO
  ): Promise<FunctionOutputDTO> {
    const model = await this.getModel();
    const result = await model
      .query()
      .updateAndFetchById(id, data.toJSON())
      .returning('*');
    return new FunctionOutputDTO(result);
  }
}
