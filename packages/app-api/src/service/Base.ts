import { ITakaroQuery, TakaroModel, NOT_DOMAIN_SCOPED_TakaroModel } from '@takaro/db';
import { ITakaroRepo, NOT_DOMAIN_SCOPED_ITakaroRepo, PaginatedOutput } from '../db/base.js';
import { logger, TakaroDTO } from '@takaro/util';

export abstract class NOT_DOMAIN_SCOPED_TakaroService<
  Model extends NOT_DOMAIN_SCOPED_TakaroModel,
  OutputDTO extends TakaroDTO<OutputDTO>,
  CreateInputDTO extends TakaroDTO<CreateInputDTO>,
  UpdateDTO extends TakaroDTO<UpdateDTO>,
> {
  log = logger(this.constructor.name);

  abstract get repo(): NOT_DOMAIN_SCOPED_ITakaroRepo<Model, OutputDTO, CreateInputDTO, UpdateDTO>;

  abstract find(filters: ITakaroQuery<OutputDTO>): Promise<PaginatedOutput<OutputDTO>>;
  abstract findOne(id: string | number, ...args: any[]): Promise<OutputDTO | undefined>;
  abstract create(item: CreateInputDTO): Promise<OutputDTO>;
  abstract update(id: string, item: UpdateDTO): Promise<OutputDTO | undefined>;
  abstract delete(id: string): Promise<string>;

  async *getIterator(filters: ITakaroQuery<OutputDTO> = {}): AsyncGenerator<OutputDTO, void, unknown> {
    let currentPage = 0;

    while (true) {
      // Get the current page of results
      const paginatedResults = await this.find({
        ...filters,
        page: currentPage,
        limit: filters.limit,
      });

      // If no results found, or empty page, stop iteration
      if (!paginatedResults || !paginatedResults.results.length) {
        break;
      }

      // Yield each result in the current page
      for (const result of paginatedResults.results) {
        yield result;
      }

      // If we've reached the last page, stop iteration
      if (currentPage >= paginatedResults.total) {
        break;
      }

      // Move to next page
      currentPage++;
    }
  }
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
