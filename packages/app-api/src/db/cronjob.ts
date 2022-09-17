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
      function: {
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

  async find(filters: ITakaroQuery<CronJobModel>): Promise<CronJobModel[]> {
    const params = new QueryBuilder(filters).build(CRONJOB_TABLE_NAME);
    const model = await this.getModel();
    return await model.query().where(params.where);
  }

  async findOne(id: string): Promise<CronJobModel> {
    const model = await this.getModel();
    const data = await model.query().findById(id);

    if (!data) {
      throw new errors.NotFoundError(`Record with id ${id} not found`);
    }

    return data;
  }

  async create(item: PartialModelObject<CronJobModel>): Promise<CronJobModel> {
    const model = await this.getModel();
    return model.query().insert(item).returning('*');
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
    return model.query().updateAndFetchById(id, data).returning('*');
  }
}
