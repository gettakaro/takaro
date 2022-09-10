import { TakaroModel, ITakaroQuery, QueryBuilder } from '@takaro/db';
import { NOT_DOMAIN_SCOPED_ITakaroRepo } from './base';
import { errors } from '@takaro/logger';
import { PartialModelObject } from 'objection';

const LOGINS_TABLE_NAME = 'logins';

export class LoginModel extends TakaroModel {
  static tableName = LOGINS_TABLE_NAME;
  domain!: string;
  userId!: string;
  email!: string;
}

export class LoginRepo extends NOT_DOMAIN_SCOPED_ITakaroRepo<LoginModel> {
  async getModel() {
    const knex = await this.getKnex();
    return LoginModel.bindKnex(knex);
  }

  async find(filters: ITakaroQuery<LoginModel>): Promise<LoginModel[]> {
    const params = new QueryBuilder(filters).build();
    const model = await this.getModel();
    return await model.query().where(params.where);
  }

  async findOne(id: string): Promise<LoginModel> {
    const model = await this.getModel();
    const data = await model.query().findById(id);

    if (!data) {
      throw new errors.NotFoundError(`Record with id ${id} not found`);
    }

    return data;
  }

  async create(item: PartialModelObject<LoginModel>): Promise<LoginModel> {
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
    data: PartialModelObject<LoginModel>
  ): Promise<LoginModel> {
    const model = await this.getModel();
    return model.query().updateAndFetchById(id, data).returning('*');
  }
}
