import { ITakaroQuery, QueryBuilder, TakaroModel } from '@takaro/db';
import { Model } from 'objection';
import { errors, traceableClass, ctx } from '@takaro/util';
import { ITakaroRepo } from './base.js';
import { SHOP_LISTING_TABLE_NAME, ShopListingModel } from './shopListing.js';
import {
  ShopOrderStatus,
  ShopOrderOutputDTO,
  ShopOrderCreateInternalDTO,
  ShopOrderUpdateDTO,
} from '../service/Shop/dto.js';
import { PLAYER_TABLE_NAME } from './player.js';
import { USER_TABLE_NAME } from './user.js';

export const SHOP_LISTING_ORDER_TABLE_NAME = 'shopOrder';

export class ShopOrderModel extends TakaroModel {
  static tableName = SHOP_LISTING_ORDER_TABLE_NAME;

  id: string;
  listingId: string;
  playerId: string;
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

    const query = ctx.transaction ? model.query(ctx.transaction) : model.query();

    return {
      model,
      query: query.modify('domainScoped', this.domainId),
      knex,
    };
  }

  async find(filters: ITakaroQuery<ShopOrderOutputDTO>) {
    const { query } = await this.getModel();

    // Extract special filters that require joins before QueryBuilder clears them
    const gameServerIdFilter = filters.filters?.gameServerId;
    const userIdFilter = filters.filters?.userId;

    // Remove these from filters so QueryBuilder doesn't try to handle them
    const modifiedFilters = { ...filters };
    if (modifiedFilters.filters) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { gameServerId, userId, ...rest } = modifiedFilters.filters;
      modifiedFilters.filters = rest;
    }

    const qry = new QueryBuilder<ShopOrderModel, ShopOrderOutputDTO>(modifiedFilters).build(query);

    // Apply gameServerId filter with join to shopListing table
    if (gameServerIdFilter && Array.isArray(gameServerIdFilter) && gameServerIdFilter.length > 0) {
      qry
        .join(ShopListingModel.tableName, `${ShopListingModel.tableName}.id`, `${ShopOrderModel.tableName}.listingId`)
        .whereIn(`${ShopListingModel.tableName}.gameServerId`, gameServerIdFilter as string[]);
    }

    // Apply userId filter with joins to player and user tables
    if (userIdFilter && Array.isArray(userIdFilter) && userIdFilter.length > 0) {
      // We need to lookup the user from order.playerId -> player.id -> user.playerId
      qry
        .join(PLAYER_TABLE_NAME, `${PLAYER_TABLE_NAME}.id`, 'shopOrder.playerId')
        .join(USER_TABLE_NAME, `${USER_TABLE_NAME}.playerId`, `${PLAYER_TABLE_NAME}.id`)
        .whereIn(`${USER_TABLE_NAME}.id`, userIdFilter as string[]);
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
        playerId: data.playerId,
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

  // Override base class findOneForUpdate to return proper DTO
  async findOneForUpdate(id: string): Promise<ShopOrderOutputDTO> {
    const { query } = await this.getModel();
    const res = await query.where('id', id).forUpdate().first();

    if (!res) {
      throw new errors.NotFoundError(`Resource with id ${id} not found`);
    }

    return new ShopOrderOutputDTO(res);
  }
}
