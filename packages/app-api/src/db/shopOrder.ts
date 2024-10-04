import { ITakaroQuery, QueryBuilder, TakaroModel } from '@takaro/db';
import { Model } from 'objection';
import { errors, traceableClass } from '@takaro/util';
import { ITakaroRepo } from './base.js';
import { SHOP_LISTING_TABLE_NAME, ShopListingModel } from './shopListing.js';
import {
  ShopOrderStatus,
  ShopOrderOutputDTO,
  ShopOrderCreateInternalDTO,
  ShopOrderUpdateDTO,
} from '../service/Shop/dto.js';

export const SHOP_LISTING_ORDER_TABLE_NAME = 'shopOrder';

export class ShopOrderModel extends TakaroModel {
  static tableName = SHOP_LISTING_ORDER_TABLE_NAME;

  id: string;
  listingId: string;
  userId: string;
  amount: number;
  status: ShopOrderStatus;

  static get relationMappings() {
    return {
      listing: {
        relation: Model.BelongsToOneRelation,
        modelClass: ShopListingModel,
        join: {
          from: `${SHOP_LISTING_ORDER_TABLE_NAME}.listingId`,
          to: `${SHOP_LISTING_TABLE_NAME}.id`,
        },
      },
    };
  }
}

@traceableClass('repo:shopOrder')
export class ShopOrderRepo extends ITakaroRepo<
  ShopOrderModel,
  ShopOrderOutputDTO,
  ShopOrderCreateInternalDTO,
  ShopOrderUpdateDTO
> {
  async getModel() {
    const knex = await this.getKnex();
    const model = ShopOrderModel.bindKnex(knex);
    return {
      model,
      query: model.query().modify('domainScoped', this.domainId),
    };
  }

  async find(filters: ITakaroQuery<ShopOrderOutputDTO>) {
    const { query } = await this.getModel();
    const qry = new QueryBuilder<ShopOrderModel, ShopOrderOutputDTO>({
      ...filters,
    }).build(query);

    if (filters.filters?.gameServerId && Array.isArray(filters.filters.gameServerId)) {
      qry
        .join(ShopListingModel.tableName, `${ShopListingModel.tableName}.id`, `${ShopOrderModel.tableName}.listingId`)
        .whereIn(`${ShopListingModel.tableName}.gameServerId`, filters.filters.gameServerId as string[]);
    }

    const result = await qry;

    return {
      total: result.total,
      results: await Promise.all(result.results.map((item) => new ShopOrderOutputDTO(item))),
    };
  }

  async findOne(id: string | number): Promise<ShopOrderOutputDTO> {
    const { query } = await this.getModel();
    const res = await query.findById(id);
    if (!res) {
      throw new errors.NotFoundError();
    }
    return new ShopOrderOutputDTO(res);
  }

  async create(data: ShopOrderCreateInternalDTO): Promise<ShopOrderOutputDTO> {
    const { query } = await this.getModel();
    const order = await query
      .insert({
        listingId: data.listingId,
        userId: data.userId,
        amount: data.amount,
        status: ShopOrderStatus.PAID,
        domain: this.domainId,
      })
      .returning('*');

    return this.findOne(order.id);
  }

  async update(id: string, data: ShopOrderUpdateDTO): Promise<ShopOrderOutputDTO> {
    const { query } = await this.getModel();
    const order = await query.updateAndFetchById(id, { status: data.status }).returning('*');
    return this.findOne(order.id);
  }

  async delete(_id: string): Promise<boolean> {
    throw new errors.NotImplementedError();
  }
}
