import { TakaroModel, ITakaroQuery, QueryBuilder } from '@takaro/db';
import { Model } from 'objection';
import { errors } from '@takaro/logger';
import { ITakaroRepo } from './base';
import {
  FUNCTIONS_ASSIGNMENT_TABLE_NAME,
  FUNCTION_TABLE_NAME,
} from './function';
import {
  CronJobCreateDTO,
  CronJobOutputDTO,
  CronJobUpdateDTO,
} from '../service/CronJobService';

export const CRONJOB_TABLE_NAME = 'cronJobs';

export class CronJobModel extends TakaroModel {
  static tableName = CRONJOB_TABLE_NAME;
  name!: string;
  enabled!: boolean;
  temporalValue!: string;

  static get relationMappings() {
    return {
      functions: {
        relation: Model.ManyToManyRelation,
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        modelClass: require('./function').FunctionModel,
        join: {
          from: `${CRONJOB_TABLE_NAME}.id`,
          through: {
            from: `${FUNCTIONS_ASSIGNMENT_TABLE_NAME}.cronJob`,
            to: `${FUNCTIONS_ASSIGNMENT_TABLE_NAME}.function`,
          },
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
    return CronJobModel.bindKnex(knex);
  }

  async find(filters: ITakaroQuery<CronJobOutputDTO>) {
    const model = await this.getModel();
    const result = await new QueryBuilder<CronJobModel, CronJobOutputDTO>({
      ...filters,
      extend: ['functions'],
    }).build(model.query());

    return {
      total: result.total,
      results: result.results.map((item) => new CronJobOutputDTO(item)),
    };
  }

  async findOne(id: string): Promise<CronJobOutputDTO> {
    const model = await this.getModel();
    const data = await model.query().findById(id).withGraphJoined('functions');

    if (!data) {
      throw new errors.NotFoundError(`Record with id ${id} not found`);
    }

    return new CronJobOutputDTO(data);
  }

  async create(item: CronJobCreateDTO): Promise<CronJobOutputDTO> {
    const model = await this.getModel();
    const res = await model.query().insert(item.toJSON()).returning('*');

    return this.findOne(res.id);
  }

  async delete(id: string): Promise<boolean> {
    const model = await this.getModel();
    const data = await model.query().deleteById(id);
    return !!data;
  }

  async update(id: string, data: CronJobUpdateDTO): Promise<CronJobOutputDTO> {
    const model = await this.getModel();
    const item = await model
      .query()
      .updateAndFetchById(id, data.toJSON())
      .withGraphFetched('functions');

    return new CronJobOutputDTO(item);
  }
}
