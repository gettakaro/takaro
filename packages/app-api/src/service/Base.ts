import { ITakaroQuery, TakaroModel, NOT_DOMAIN_SCOPED_TakaroModel } from '@takaro/db';
import { ITakaroRepo, NOT_DOMAIN_SCOPED_ITakaroRepo, PaginatedOutput } from '../db/base.js';
import { logger } from '@takaro/util';
import { TakaroDTO } from '@takaro/util';

export abstract class NOT_DOMAIN_SCOPED_TakaroService<
  Model extends NOT_DOMAIN_SCOPED_TakaroModel,
  OutputDTO extends TakaroDTO<OutputDTO>,
  CreateInputDTO extends TakaroDTO<CreateInputDTO>,
  UpdateDTO extends TakaroDTO<UpdateDTO>,
> {
  log = logger(this.constructor.name);

  abstract get repo(): NOT_DOMAIN_SCOPED_ITakaroRepo<Model, OutputDTO, CreateInputDTO, UpdateDTO>;

  abstract find(filters: ITakaroQuery<OutputDTO>): Promise<PaginatedOutput<OutputDTO>>;
  abstract findOne(id: string | number): Promise<OutputDTO | undefined>;
  abstract create(item: CreateInputDTO): Promise<OutputDTO>;
  abstract update(id: string, item: UpdateDTO): Promise<OutputDTO | undefined>;
  abstract delete(id: string): Promise<string>;
}

export abstract class TakaroService<
  Model extends TakaroModel,
  OutputDTO extends TakaroDTO<OutputDTO>,
  CreateInputDTO extends TakaroDTO<CreateInputDTO>,
  UpdateDTO extends TakaroDTO<UpdateDTO>,
> extends NOT_DOMAIN_SCOPED_TakaroService<Model, OutputDTO, CreateInputDTO, UpdateDTO> {
  constructor(public readonly domainId: string) {
    super();
  }

  abstract get repo(): ITakaroRepo<Model, OutputDTO, CreateInputDTO, UpdateDTO>;
}
