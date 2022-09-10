import {
  getKnex,
  ITakaroQuery,
  NOT_DOMAIN_SCOPED_getKnex,
  TakaroModel,
} from '@takaro/db';
import { PartialModelObject, ModelClass } from 'objection';

export abstract class NOT_DOMAIN_SCOPED_ITakaroRepo<T extends TakaroModel> {
  async getKnex() {
    return NOT_DOMAIN_SCOPED_getKnex();
  }

  /**
   * We have to bind a knex instance to the model class in this function
   */
  abstract getModel(): Promise<ModelClass<T>>;

  abstract find(filters: ITakaroQuery<T>): Promise<T[]>;
  abstract findOne(id: string | number): Promise<T | undefined>;
  abstract create(item: PartialModelObject<T>): Promise<T>;
  abstract update(
    id: string,
    item: PartialModelObject<T>
  ): Promise<T | undefined>;
  abstract delete(id: string): Promise<boolean>;
}

export abstract class ITakaroRepo<
  T extends TakaroModel
> extends NOT_DOMAIN_SCOPED_ITakaroRepo<T> {
  constructor(public readonly domainId: string) {
    super();
  }

  async getKnex() {
    return getKnex(this.domainId);
  }
}
