import { getKnex, ITakaroQuery, TakaroModel, NOT_DOMAIN_SCOPED_TakaroModel } from '@takaro/db';
import { TakaroDTO, logger, ctx } from '@takaro/util';
import { ModelClass, QueryBuilder } from 'objection';

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

  async getKnex(): Promise<any> {
    const transaction = ctx.getTransaction();
    if (transaction) return transaction;
    return getKnex();
  }

  /**
   * We have to bind a knex instance to the model class in this function
   */
  abstract getModel(): Promise<{
    model: ModelClass<Model>;
    query: QueryBuilder<Model>;
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

  async getKnex(): Promise<any> {
    const transaction = ctx.getTransaction();
    if (transaction) return transaction;
    return getKnex();
  }
}
