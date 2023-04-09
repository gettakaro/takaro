import { TakaroModel, ITakaroQuery, QueryBuilder } from '@takaro/db';
import { errors } from '@takaro/util';
import { ITakaroRepo } from './base';
import { Model } from 'objection';
import { CRONJOB_TABLE_NAME, CronJobModel } from './cronjob';
import {
  FunctionCreateDTO,
  FunctionOutputDTO,
  FunctionUpdateDTO,
} from '../service/FunctionService.js';
import { HOOKS_TABLE_NAME, HookModel } from './hook';
import { CommandModel, COMMANDS_TABLE_NAME } from './command';

export const FUNCTION_TABLE_NAME = 'functions';

export class FunctionModel extends TakaroModel {
  static tableName = FUNCTION_TABLE_NAME;
  code!: string;

  static get relationMappings() {
    return {
      cronJob: {
        relation: Model.HasOneRelation,
        modelClass: CronJobModel,
        join: {
          from: `${FUNCTION_TABLE_NAME}.id`,
          to: `${CRONJOB_TABLE_NAME}.id`,
        },
      },
      hook: {
        relation: Model.HasOneRelation,
        modelClass: HookModel,
        join: {
          from: `${FUNCTION_TABLE_NAME}.id`,
          to: `${HOOKS_TABLE_NAME}.id`,
        },
      },
      command: {
        relation: Model.HasOneRelation,
        modelClass: CommandModel,
        join: {
          from: `${FUNCTION_TABLE_NAME}.id`,
          to: `${COMMANDS_TABLE_NAME}.id`,
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
    const model = FunctionModel.bindKnex(knex);
    return {
      model,
      query: model.query().modify('domainScoped', this.domainId),
    };
  }

  async find(filters: ITakaroQuery<FunctionOutputDTO>) {
    const { query } = await this.getModel();
    const result = await new QueryBuilder<FunctionModel, FunctionOutputDTO>(
      filters
    ).build(query);
    return {
      total: result.total,
      results: await Promise.all(
        result.results.map((item) => new FunctionOutputDTO().construct(item))
      ),
    };
  }

  async findOne(id: string): Promise<FunctionOutputDTO> {
    const { query } = await this.getModel();
    const data = await query.findById(id);

    if (!data) {
      throw new errors.NotFoundError(`Record with id ${id} not found`);
    }

    return new FunctionOutputDTO().construct(data);
  }

  async create(item: FunctionCreateDTO): Promise<FunctionOutputDTO> {
    const { query } = await this.getModel();
    const data = await query
      .insert({
        ...item.toJSON(),
        domain: this.domainId,
      })
      .returning('*');
    return new FunctionOutputDTO().construct(data);
  }

  async delete(id: string): Promise<boolean> {
    const { query } = await this.getModel();
    const data = await query.deleteById(id);
    return !!data;
  }

  async update(
    id: string,
    data: FunctionUpdateDTO
  ): Promise<FunctionOutputDTO> {
    const { query } = await this.getModel();
    const result = await query
      .updateAndFetchById(id, data.toJSON())
      .returning('*');
    return new FunctionOutputDTO().construct(result);
  }
}
