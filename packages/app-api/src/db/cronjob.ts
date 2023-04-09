import { TakaroModel, ITakaroQuery, QueryBuilder } from '@takaro/db';
import { Model } from 'objection';
import { errors } from '@takaro/util';
import { ITakaroRepo } from './base';
import { FUNCTION_TABLE_NAME, FunctionModel } from './function';
import {
  CronJobCreateDTO,
  CronJobOutputDTO,
  CronJobUpdateDTO,
} from '../service/CronJobService.js';

export const CRONJOB_TABLE_NAME = 'cronJobs';

export class CronJobModel extends TakaroModel {
  static tableName = CRONJOB_TABLE_NAME;
  name!: string;
  temporalValue!: string;

  functionId: string;

  static get relationMappings() {
    return {
      function: {
        relation: Model.BelongsToOneRelation,
        modelClass: FunctionModel,
        join: {
          from: `${CRONJOB_TABLE_NAME}.functionId`,
          to: `${FUNCTION_TABLE_NAME}.id`,
        },
      },
    };
  }
}

export class CronJobRepo extends ITakaroRepo<
  CronJobModel,
  CronJobOutputDTO,
  CronJobCreateDTO,
  CronJobUpdateDTO
> {
  constructor(public readonly domainId: string) {
    super(domainId);
  }

  async getModel() {
    const knex = await this.getKnex();
    const model = CronJobModel.bindKnex(knex);
    return {
      model,
      query: model.query().modify('domainScoped', this.domainId),
    };
  }

  async find(filters: ITakaroQuery<CronJobOutputDTO>) {
    const { query } = await this.getModel();
    const result = await new QueryBuilder<CronJobModel, CronJobOutputDTO>({
      ...filters,
      extend: ['function'],
    }).build(query);

    return {
      total: result.total,
      results: await Promise.all(
        result.results.map((item) => new CronJobOutputDTO().construct(item))
      ),
    };
  }

  async findOne(id: string): Promise<CronJobOutputDTO> {
    const { query } = await this.getModel();
    const data = await query.findById(id).withGraphJoined('function');

    if (!data) {
      throw new errors.NotFoundError(`Record with id ${id} not found`);
    }

    return new CronJobOutputDTO().construct(data);
  }

  async create(item: CronJobCreateDTO): Promise<CronJobOutputDTO> {
    const { query } = await this.getModel();
    const res = await query
      .insert({
        ...item.toJSON(),
        domain: this.domainId,
      })
      .returning('*');

    if (item.function) {
      await this.assign(res.id, item.function);
    }

    return this.findOne(res.id);
  }

  async delete(id: string): Promise<boolean> {
    const { query } = await this.getModel();
    const data = await query.deleteById(id);
    return !!data;
  }

  async update(id: string, data: CronJobUpdateDTO): Promise<CronJobOutputDTO> {
    const { query } = await this.getModel();
    const item = await query
      .updateAndFetchById(id, data.toJSON())
      .withGraphFetched('function');

    return new CronJobOutputDTO().construct(item);
  }

  async assign(id: string, functionId: string) {
    const { query } = await this.getModel();
    await query.updateAndFetchById(id, { functionId });
  }
}
