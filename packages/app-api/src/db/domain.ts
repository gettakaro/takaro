import { NOT_DOMAIN_SCOPED_TakaroModel, ITakaroQuery, QueryBuilder } from '@takaro/db';
import { NOT_DOMAIN_SCOPED_ITakaroRepo } from './base.js';
import { errors, traceableClass, ctx } from '@takaro/util';
import { DomainOutputDTO, DomainCreateInputDTO, DomainUpdateInputDTO } from '../service/DomainService.js';
import { UserRepo } from './user.js';

export enum DOMAIN_STATES {
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED',
  MAINTENANCE = 'MAINTENANCE',
  DELETED = 'DELETED',
}

const TABLE_NAME = 'domains';

export class DomainModel extends NOT_DOMAIN_SCOPED_TakaroModel {
  static tableName = TABLE_NAME;
  name!: string;
  state!: DOMAIN_STATES;

  maxGameservers: number;
  maxUsers: number;
  eventRetentionDays: number;
  maxVariables: number;
  maxModules: number;
  maxFunctionsInModule: number;

  serverRegistrationToken?: string;

  rateLimitPoints: number;
  rateLimitDuration: number;

  externalReference?: string;
}

@traceableClass('repo:domain')
export class DomainRepo extends NOT_DOMAIN_SCOPED_ITakaroRepo<
  DomainModel,
  DomainOutputDTO,
  DomainCreateInputDTO,
  DomainUpdateInputDTO
> {
  async getModel() {
    const knex = await this.getKnex();
    const model = DomainModel.bindKnex(knex);

    const query = ctx.transaction ? model.query(ctx.transaction) : model.query();

    return {
      model,
      query,
      knex,
    };
  }
  async find(filters: ITakaroQuery<DomainOutputDTO>) {
    const { query } = await this.getModel();
    const result = await new QueryBuilder<DomainModel, DomainOutputDTO>(filters).build(query);
    return {
      total: result.total,
      results: await Promise.all(result.results.map((item) => new DomainOutputDTO(item))),
    };
  }

  async findOne(id: string): Promise<DomainOutputDTO> {
    const { query } = await this.getModel();
    const data = await query.findById(id);

    if (!data) {
      throw new errors.NotFoundError();
    }

    // Force console.log to bypass test mode logging suppression
    console.log('[CONCURRENT_TESTS_DEBUG] RAW DATABASE RESULT IN DOMAIN REPO:', {
      domainId: id,
      rawState: data.state,
      stateType: typeof data.state,
      stateIsNull: data.state === null,
      stateIsUndefined: data.state === undefined,
      stateString: String(data.state),
      allFields: Object.keys(data),
      name: data.name,
    });

    return new DomainOutputDTO(data);
  }

  async create(item: DomainCreateInputDTO): Promise<DomainOutputDTO> {
    const { query } = await this.getModel();
    const domain = await query.insert(item.toJSON()).returning('*');
    return new DomainOutputDTO(domain);
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.findOne(id);
    if (!existing) throw new errors.NotFoundError();
    const { query } = await this.getModel();
    const data = await query.deleteById(id);
    return !!data;
  }

  async update(id: string, data: DomainUpdateInputDTO): Promise<DomainOutputDTO> {
    const existing = await this.findOne(id);
    if (!existing) throw new errors.NotFoundError();

    console.log('[CONCURRENT_TESTS_DEBUG] DOMAIN REPO UPDATE STARTING:', {
      domainId: id,
      existingState: existing.state,
      updateData: data.toJSON(),
      targetState: data.toJSON().state,
    });

    const { query } = await this.getModel();
    const res = await query.updateAndFetchById(id, data.toJSON()).returning('*');

    console.log('[CONCURRENT_TESTS_DEBUG] DOMAIN REPO UPDATE DATABASE RESULT:', {
      domainId: id,
      resultState: res.state,
      resultStateType: typeof res.state,
      targetState: data.toJSON().state,
      statesMatch: res.state === data.toJSON().state,
    });

    return new DomainOutputDTO(res);
  }

  async resolveDomain(email: string): Promise<DomainOutputDTO[]> {
    const userRepo = new UserRepo('fake_domain_id');
    const domainIds = await userRepo.NOT_DOMAIN_SCOPED_resolveDomainByIdpId(email);
    return Promise.all(domainIds.map((id) => this.findOne(id)));
  }
}
