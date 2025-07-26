import { getKnex, ITakaroQuery, TakaroModel, NOT_DOMAIN_SCOPED_TakaroModel } from '@takaro/db';
import { TakaroDTO, logger, ctx, errors } from '@takaro/util';
import { ModelClass, QueryBuilder } from 'objection';
import { Knex } from 'knex';

export class voidDTO extends TakaroDTO<voidDTO> {
  // This is a placeholder DTO for operations that do not return any data
  // Or for repos where CRUD operations are not (all) applicable
}

export interface PaginatedOutput<T> {
  total: number;
  results: T[];
}
export abstract class NOT_DOMAIN_SCOPED_ITakaroRepo<
  Model extends NOT_DOMAIN_SCOPED_TakaroModel,
  OutputDTO extends TakaroDTO<OutputDTO>,
  CreateInputDTO extends TakaroDTO<CreateInputDTO>,
  UpdateDTO extends TakaroDTO<UpdateDTO>,
> {
  log = logger(this.constructor.name);

  async getKnex() {
    return getKnex();
  }

  /**
   * We have to bind a knex instance to the model class in this function
   */
  abstract getModel(): Promise<{
    model: ModelClass<Model>;
    query: QueryBuilder<Model>;
    knex: Knex;
  }>;

  abstract find(filters: ITakaroQuery<OutputDTO>): Promise<PaginatedOutput<OutputDTO>>;
  abstract findOne(id: string | number, ...args: any[]): Promise<OutputDTO>;
  abstract create(item: CreateInputDTO): Promise<OutputDTO>;
  abstract update(id: string, item: UpdateDTO): Promise<OutputDTO>;
  abstract delete(id: string): Promise<boolean>;
}

export abstract class ITakaroRepo<
  Model extends TakaroModel,
  OutputDTO extends TakaroDTO<OutputDTO>,
  CreateInputDTO extends TakaroDTO<CreateInputDTO>,
  UpdateDTO extends TakaroDTO<UpdateDTO>,
> extends NOT_DOMAIN_SCOPED_ITakaroRepo<Model, OutputDTO, CreateInputDTO, UpdateDTO> {
  constructor(public readonly domainId: string) {
    super();
  }

  async getKnex() {
    return getKnex();
  }

  /**
   * Find one record for update (with row locking)
   * Uses context transaction if available
   */
  async findOneForUpdate(id: string): Promise<OutputDTO> {
    const { query } = await this.getModel();
    const res = await query.where('id', id).forUpdate().first();

    if (!res) {
      throw new errors.NotFoundError(`Resource with id ${id} not found`);
    }

    // Since we don't have access to the specific OutputDTO class here,
    // we'll just return the JSON. Subclasses should override if needed.
    return res.toJSON() as unknown as OutputDTO;
  }

  /**
   * Execute raw SQL query using context transaction if available
   */
  async raw(sql: string, bindings?: any[]): Promise<Knex.Raw> {
    const knex = await this.getKnex();

    if (ctx.transaction) {
      return bindings ? ctx.transaction.raw(sql, bindings) : ctx.transaction.raw(sql);
    }

    return bindings ? knex.raw(sql, bindings) : knex.raw(sql);
  }
}
