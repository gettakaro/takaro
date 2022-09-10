import { Knex } from 'knex';
import { ITakaroQuery, QueryBuilder } from './queryBuilder';
import { TakaroModel } from './TakaroModel';

type BaseRepository<T extends TakaroModel> = {
  find(filters: ITakaroQuery<T>): Promise<T[]>;
  findOne(id: string | number): Promise<TakaroModel | undefined>;
  create(item: Omit<T, 'id'>): Promise<T>;
  update(id: string, item: Partial<T>): Promise<T | undefined>;
  delete(id: string): Promise<boolean>;
};

export class TakaroCRUDRepository<T extends TakaroModel>
  implements BaseRepository<T>
{
  constructor(public knex: Knex, public readonly model: typeof TakaroModel) {}

  // Shortcut for Query Builder call
  public get qb(): Knex.QueryBuilder {
    return this.knex(this.model.tableName);
  }

  async find(filters: ITakaroQuery<T>): Promise<T[]> {
    const params = new QueryBuilder(filters).build();
    return this.qb.where(params.where).select();
  }

  async findOne(id: string | number): Promise<T | undefined> {
    return this.qb.where({ id });
  }

  async create(item: Omit<Partial<T>, 'id'>): Promise<T> {
    const [output] = await this.qb.insert<T>(item).returning('*');

    return output as Promise<T>;
  }

  async update(id: string, item: Partial<T>): Promise<T | undefined> {
    await this.qb.where('id', id).update(item);

    return this.findOne(id);
  }

  async delete(id: string): Promise<boolean> {
    return this.qb.where('id', id).del();
  }
}
