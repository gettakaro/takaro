import {
  NOT_DOMAIN_SCOPED_TakaroModel,
  ITakaroQuery,
  QueryBuilder,
} from '@takaro/db';
import { NOT_DOMAIN_SCOPED_ITakaroRepo } from './base';
import { errors } from '@takaro/util';
import {
  DomainOutputDTO,
  DomainCreateInputDTO,
  DomainUpdateInputDTO,
} from '../service/DomainService.js';
import { UserRepo } from './user';

const TABLE_NAME = 'domains';

export class DomainModel extends NOT_DOMAIN_SCOPED_TakaroModel {
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
    const model = DomainModel.bindKnex(knex);
    return { model, query: model.query() };
  }
  async find(filters: ITakaroQuery<DomainOutputDTO>) {
    const { query } = await this.getModel();
    const result = await new QueryBuilder<DomainModel, DomainOutputDTO>(
      filters
    ).build(query);
    return {
      total: result.total,
      results: await Promise.all(
        result.results.map((item) => new DomainOutputDTO().construct(item))
      ),
    };
  }

  async findOne(id: string): Promise<DomainOutputDTO> {
    const { query } = await this.getModel();
    const data = await query.findById(id);

    if (!data) {
      throw new errors.NotFoundError();
    }

    return new DomainOutputDTO().construct(data);
  }

  async create(item: DomainCreateInputDTO): Promise<DomainOutputDTO> {
    const { query } = await this.getModel();
    const domain = await query.insert(item.toJSON()).returning('*');
    return new DomainOutputDTO().construct(domain);
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.findOne(id);
    if (!existing) throw new errors.NotFoundError();
    const { query } = await this.getModel();
    const data = await query.deleteById(id);
    return !!data;
  }

  async update(
    id: string,
    data: DomainUpdateInputDTO
  ): Promise<DomainOutputDTO> {
    const existing = await this.findOne(id);
    if (!existing) throw new errors.NotFoundError();

    const { query } = await this.getModel();
    const res = await query
      .updateAndFetchById(id, data.toJSON())
      .returning('*');
    return new DomainOutputDTO().construct(res);
  }

  async resolveDomain(email: string): Promise<string | null> {
    const userRepo = new UserRepo('fake_domain_id');
    const domainId = await userRepo.NOT_DOMAIN_SCOPED_resolveDomainByEmail(
      email
    );
    return domainId;
  }
}
