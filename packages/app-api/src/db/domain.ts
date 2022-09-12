import {
  TakaroModel,
  getDomainSchemaName,
  ITakaroQuery,
  QueryBuilder,
  disconnectKnex,
  migrateDomain,
} from '@takaro/db';
import { NOT_DOMAIN_SCOPED_ITakaroRepo } from './base';
import { errors } from '@takaro/logger';
import { PartialModelObject } from 'objection';
import { LoginRepo } from './login';

const TABLE_NAME = 'domains';
const LOGINS_TABLE_NAME = 'logins';

export class LoginModel extends TakaroModel {
  static tableName = LOGINS_TABLE_NAME;
  domain!: string;
  userId!: string;
  email!: string;
}

export class DomainModel extends TakaroModel {
  static tableName = TABLE_NAME;
  name!: string;
}

export class DomainRepo extends NOT_DOMAIN_SCOPED_ITakaroRepo<DomainModel> {
  async getModel() {
    const knex = await this.getKnex();
    return DomainModel.bindKnex(knex);
  }
  async find(filters: ITakaroQuery<DomainModel>): Promise<DomainModel[]> {
    const params = new QueryBuilder(filters).build();
    const model = await this.getModel();
    return await model.query().where(params.where);
  }

  async findOne(id: string): Promise<DomainModel> {
    const model = await this.getModel();
    const data = await model.query().findById(id);

    if (!data) {
      throw new errors.NotFoundError();
    }

    return data;
  }

  async create(item: PartialModelObject<DomainModel>): Promise<DomainModel> {
    const model = await this.getModel();
    const domain = await model.query().insert(item).returning('*');

    await migrateDomain(domain.id);
    return domain;
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.findOne(id);
    if (!existing) throw new errors.NotFoundError();

    const knex = await this.getKnex();
    await knex.schema.dropSchemaIfExists(getDomainSchemaName(id), true);

    const model = await this.getModel();
    const data = await model.query().deleteById(id);
    await disconnectKnex(id);
    return !!data;
  }

  async update(
    id: string,
    data: PartialModelObject<DomainModel>
  ): Promise<DomainModel> {
    const existing = await this.findOne(id);
    if (!existing) throw new errors.NotFoundError();

    const model = await this.getModel();
    return model.query().updateAndFetchById(id, data).returning('*');
  }

  async addLogin(userId: string, email: string, domainId: string) {
    const loginRepo = new LoginRepo();
    await loginRepo.create({
      userId,
      email,
      domain: domainId,
    });
  }

  async resolveDomain(email: string): Promise<string | null> {
    const loginRepo = new LoginRepo();
    const login = await loginRepo.find({ filters: { email } });
    if (!login.length) {
      return null;
    }

    return login[0].domain;
  }
}
