import { ITakaroQuery, QueryBuilder, TakaroModel } from '@takaro/db';
import { errors, traceableClass } from '@takaro/util';
import { ITakaroRepo } from './base.js';
import { ItemCreateDTO, ItemsOutputDTO, ItemUpdateDTO } from '../service/ItemsService.js';
import { GAMESERVER_TABLE_NAME, GameServerModel } from './gameserver.js';

export const ITEMS_TABLE_NAME = 'items';

export class ItemsModel extends TakaroModel {
  static tableName = ITEMS_TABLE_NAME;

  name!: string;
  code!: string;
  description?: string;
  icon?: string;

  gameserverId!: string;

  static get relationMappings() {
    return {
      gameserver: {
        relation: TakaroModel.BelongsToOneRelation,
        modelClass: GameServerModel,
        join: {
          from: `${ITEMS_TABLE_NAME}.gameserverId`,
          to: `${GAMESERVER_TABLE_NAME}.id`,
        },
      },
    };
  }
}

@traceableClass('repo:item')
export class ItemRepo extends ITakaroRepo<ItemsModel, ItemsOutputDTO, ItemCreateDTO, ItemUpdateDTO> {
  async getModel() {
    const knex = await this.getKnex();
    const model = ItemsModel.bindKnex(knex);
    return {
      model,
      query: model.query().modify('domainScoped', this.domainId),
    };
  }
  async find(filters: ITakaroQuery<ItemsOutputDTO>) {
    const { query } = await this.getModel();
    const result = await new QueryBuilder<ItemsModel, ItemsOutputDTO>(filters).build(query);
    return {
      total: result.total,
      results: await Promise.all(result.results.map((item) => new ItemsOutputDTO().construct(item))),
    };
  }

  async findOne(id: string): Promise<ItemsOutputDTO> {
    const { query } = await this.getModel();
    const data = await query.findById(id);

    if (!data) {
      throw new errors.NotFoundError();
    }

    return new ItemsOutputDTO().construct(data);
  }

  async create(item: ItemCreateDTO): Promise<ItemsOutputDTO> {
    const { query } = await this.getModel();

    const data = await query
      .insert({
        ...item.toJSON(),
        domain: this.domainId,
      })
      .returning('*');
    return new ItemsOutputDTO().construct(data);
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.findOne(id);
    if (!existing) throw new errors.NotFoundError();

    const { query } = await this.getModel();
    const data = await query.deleteById(id);
    return !!data;
  }

  async update(id: string, data: ItemUpdateDTO): Promise<ItemsOutputDTO> {
    const existing = await this.findOne(id);
    if (!existing) throw new errors.NotFoundError();

    const { query } = await this.getModel();
    const res = await query.updateAndFetchById(id, data.toJSON()).returning('*');
    return new ItemsOutputDTO().construct(res);
  }

  async upsert(item: ItemCreateDTO): Promise<ItemsOutputDTO> {
    // Use raw SQL for performance reasons
    const knex = await this.getKnex();
    const existing = await knex(ITEMS_TABLE_NAME)
      .select('*')
      .where('code', item.code)
      .andWhere('gameserverId', item.gameserverId)
      .andWhere('domain', this.domainId)
      .first();

    if (existing) {
      return this.update(existing.id, item);
    }

    return this.create(item);
  }

  async findItemByCode(code: string, gameServerId: string): Promise<ItemsOutputDTO> {
    const { query } = await this.getModel();
    const data = await query.where('code', code).andWhere('gameserverId', gameServerId).first();

    if (!data) {
      throw new errors.NotFoundError();
    }

    return new ItemsOutputDTO().construct(data);
  }
}
