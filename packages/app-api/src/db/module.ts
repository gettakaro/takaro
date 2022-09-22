import { TakaroModel, ITakaroQuery, QueryBuilder } from '@takaro/db';
import { Model, PartialModelObject } from 'objection';
import { errors } from '@takaro/logger';
import { ITakaroRepo } from './base';
import { JsonObject } from 'type-fest';
import { CronJobModel, CRONJOB_TABLE_NAME } from './cronjob';

export const MODULE_TABLE_NAME = 'modules';

export class ModuleModel extends TakaroModel {
  static tableName = MODULE_TABLE_NAME;
  name!: string;
  enabled!: boolean;
  config!: JsonObject;

  static get relationMappings() {
    return {
      cronJobs: {
        relation: Model.HasManyRelation,
        modelClass: CronJobModel,
        join: {
          from: `${MODULE_TABLE_NAME}.id`,
          to: `${CRONJOB_TABLE_NAME}.moduleId`,
        },
      },
    };
  }
}

export class ModuleRepo extends ITakaroRepo<ModuleModel> {
  constructor(public readonly domainId: string) {
    super(domainId);
  }

  async getModel() {
    const knex = await this.getKnex();
    return ModuleModel.bindKnex(knex);
  }

  async find(filters: ITakaroQuery<ModuleModel>): Promise<ModuleModel[]> {
    const params = new QueryBuilder(filters).build(MODULE_TABLE_NAME);
    const model = await this.getModel();
    return await model.query().where(params.where).withGraphJoined('cronJobs');
  }

  async findOne(id: string): Promise<ModuleModel> {
    const model = await this.getModel();
    const data = await model.query().findById(id).withGraphJoined('cronJobs');

    if (!data) {
      throw new errors.NotFoundError(`Record with id ${id} not found`);
    }

    return data;
  }

  async create(item: PartialModelObject<ModuleModel>): Promise<ModuleModel> {
    const model = await this.getModel();
    return model
      .query()
      .insert(item)
      .returning('*')
      .withGraphJoined('cronJobs');
  }

  async delete(id: string): Promise<boolean> {
    const model = await this.getModel();
    const data = await model.query().deleteById(id);
    return !!data;
  }

  async update(
    id: string,
    data: PartialModelObject<ModuleModel>
  ): Promise<ModuleModel> {
    const model = await this.getModel();
    return model
      .query()
      .updateAndFetchById(id, data)
      .withGraphFetched('cronJobs');
  }
}
