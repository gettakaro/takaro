import {
  getKnex,
  ITakaroQuery,
  NOT_DOMAIN_SCOPED_getKnex,
  TakaroModel,
} from '@takaro/db';
import { TakaroDTO } from '@takaro/util';
import { ModelClass } from 'objection';

export interface PaginatedOutput<T> {
  total: number;
  results: T[];
}
export abstract class NOT_DOMAIN_SCOPED_ITakaroRepo<
  Model extends TakaroModel,
  OutputDTO extends TakaroDTO<OutputDTO>,
  CreateInputDTO extends TakaroDTO<CreateInputDTO>,
  UpdateDTO extends TakaroDTO<UpdateDTO>
> {
  async getKnex() {
    return NOT_DOMAIN_SCOPED_getKnex();
  }

  /**
   * We have to bind a knex instance to the model class in this function
   */
  abstract getModel(): Promise<ModelClass<Model>>;

  abstract find(
    filters: ITakaroQuery<OutputDTO>
  ): Promise<PaginatedOutput<OutputDTO>>;
  abstract findOne(id: string | number): Promise<OutputDTO | undefined>;
  abstract create(item: CreateInputDTO): Promise<OutputDTO>;
  abstract update(id: string, item: UpdateDTO): Promise<OutputDTO | undefined>;
  abstract delete(id: string): Promise<boolean>;
}

export abstract class ITakaroRepo<
  Model extends TakaroModel,
  OutputDTO extends TakaroDTO<OutputDTO>,
  CreateInputDTO extends TakaroDTO<CreateInputDTO>,
  UpdateDTO extends TakaroDTO<UpdateDTO>
> extends NOT_DOMAIN_SCOPED_ITakaroRepo<
  Model,
  OutputDTO,
  CreateInputDTO,
  UpdateDTO
> {
  constructor(public readonly domainId: string) {
    super();
  }

  async getKnex() {
    return getKnex(this.domainId);
  }
}
