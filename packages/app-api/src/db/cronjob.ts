import { TakaroModel, ITakaroQuery, QueryBuilder } from '@takaro/db';
import { Model, PartialModelObject } from 'objection';
import { errors } from '@takaro/logger';
import { ITakaroRepo } from './base';
import {
  FUNCTIONS_ASSIGNMENT_TABLE_NAME,
  FUNCTION_TABLE_NAME,
} from './function';

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

export class CronJobRepo extends ITakaroRepo<CronJobModel> {
  constructor(public readonly domainId: string) {
    super(domainId);
  }

  async getModel() {
    const knex = await this.getKnex();
    return CronJobModel.bindKnex(knex);
  }

  async find(filters: ITakaroQuery<CronJobModel>) {
    const model = await this.getModel();
    return await new QueryBuilder<CronJobModel>({
      ...filters,
      extend: ['functions'],
    }).build(model.query());
  }

  async findOne(id: string): Promise<CronJobModel> {
    const model = await this.getModel();
    const data = await model.query().findById(id).withGraphJoined('functions');

    if (!data) {
      throw new errors.NotFoundError(`Record with id ${id} not found`);
    }

    return data;
  }

  async create(item: PartialModelObject<CronJobModel>): Promise<CronJobModel> {
    const model = await this.getModel();
    return model
      .query()
      .insert(item)
      .returning('*')
      .withGraphJoined('functions');
  }

  async delete(id: string): Promise<boolean> {
    const model = await this.getModel();
    const data = await model.query().deleteById(id);
    return !!data;
  }

  async update(
    id: string,
    data: PartialModelObject<CronJobModel>
  ): Promise<CronJobModel> {
    const model = await this.getModel();
    return model
      .query()
      .updateAndFetchById(id, data)
      .withGraphFetched('functions');
  }
}
