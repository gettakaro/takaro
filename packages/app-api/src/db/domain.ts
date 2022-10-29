import {
  TakaroModel,
  getDomainSchemaName,
  ITakaroQuery,
  QueryBuilder,
  disconnectKnex,
  migrateDomain,
} from '@takaro/db';
import { NOT_DOMAIN_SCOPED_ITakaroRepo } from './base';
import { errors } from '@takaro/util';
import { LoginCreateDTO, LoginRepo } from './login';
import {
  DomainOutputDTO,
  DomainCreateInputDTO,
  DomainUpdateInputDTO,
} from '../service/DomainService';

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

export class DomainRepo extends NOT_DOMAIN_SCOPED_ITakaroRepo<
  DomainModel,
  DomainOutputDTO,
  DomainCreateInputDTO,
  DomainUpdateInputDTO
> {
  async getModel() {
    const knex = await this.getKnex();
    return DomainModel.bindKnex(knex);
  }
  async find(filters: ITakaroQuery<DomainOutputDTO>) {
    const model = await this.getModel();
    const result = await new QueryBuilder<DomainModel, DomainOutputDTO>(
      filters
    ).build(model.query());
    return {
      total: result.total,
      results: result.results.map((item) => new DomainOutputDTO(item)),
    };
  }

  async findOne(id: string): Promise<DomainOutputDTO> {
    const model = await this.getModel();
    const data = await model.query().findById(id);

    if (!data) {
      throw new errors.NotFoundError();
    }

    return new DomainOutputDTO(data);
  }

  async create(item: DomainCreateInputDTO): Promise<DomainOutputDTO> {
    const model = await this.getModel();
    const domain = await model.query().insert(item.toJSON()).returning('*');

    await migrateDomain(domain.id);
    return new DomainOutputDTO(domain);
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
    data: DomainUpdateInputDTO
  ): Promise<DomainOutputDTO> {
    const existing = await this.findOne(id);
    if (!existing) throw new errors.NotFoundError();

    const model = await this.getModel();
    const res = await model
      .query()
      .updateAndFetchById(id, data.toJSON())
      .returning('*');
    return new DomainOutputDTO(res);
  }

  async addLogin(userId: string, email: string, domainId: string) {
    const loginRepo = new LoginRepo();
    await loginRepo.create(
      new LoginCreateDTO({
        userId,
        email,
        domain: domainId,
      })
    );
  }

  async resolveDomain(email: string): Promise<string | null> {
    const loginRepo = new LoginRepo();
    const login = await loginRepo.find({ filters: { email } });
    if (!login.results.length) {
      return null;
    }

    return login.results[0].domain;
  }
}
