import { ITakaroQuery, TakaroModel } from '@takaro/db';
import { ITakaroRepo, NOT_DOMAIN_SCOPED_ITakaroRepo } from '../db/base';
import { logger } from '@takaro/logger';
import { PartialModelObject, Page } from 'objection';

export abstract class NOT_DOMAIN_SCOPED_TakaroService<T extends TakaroModel> {
  log = logger(this.constructor.name);

  abstract get repo(): NOT_DOMAIN_SCOPED_ITakaroRepo<T>;

  find(filters: ITakaroQuery<T>): Promise<Page<T>> {
    return this.repo.find(filters);
  }
  findOne(id: string | number): Promise<T | undefined> {
    return this.repo.findOne(id);
  }
  create(item: PartialModelObject<T>): Promise<T> {
    return this.repo.create(item);
  }
  update(id: string, item: PartialModelObject<T>): Promise<T | undefined> {
    return this.repo.update(id, item);
  }
  delete(id: string): Promise<boolean> {
    return this.repo.delete(id);
  }
}

export abstract class TakaroService<
  T extends TakaroModel
> extends NOT_DOMAIN_SCOPED_TakaroService<T> {
  constructor(public readonly domainId: string) {
    super();
  }

  abstract get repo(): ITakaroRepo<T>;
}
