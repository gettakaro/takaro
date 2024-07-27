import { ITakaroQuery, QueryBuilder, TakaroModel } from '@takaro/db';
import { Model } from 'objection';
import { errors, traceableClass } from '@takaro/util';
import { GameServerModel } from './gameserver.js';
import { ItemsModel } from './items.js';
import { RoleModel } from './role.js';
import { ITakaroRepo } from './base.js';
import { ShopListingOutputDTO, ShopListingUpdateDTO, ShopListingCreateDTO } from '../service/Shop/dto.js';

export const SHOP_LISTING_TABLE_NAME = 'shopListing';
export const SHOP_LISTING_ITEMS_TABLE_NAME = 'itemOnShopListing';
export const SHOP_LISTING_ROLE_TABLE_NAME = 'shopListingRole';

class ItemOnShopListingModel extends TakaroModel {
  static tableName = SHOP_LISTING_ITEMS_TABLE_NAME;

  id: string;
  listingId: string;
  itemId: string;
  amount: number;
  quality?: string;

  static get relationMappings() {
    return {
      listing: {
        relation: Model.BelongsToOneRelation,
        modelClass: ShopListingModel,
        join: {
          from: `${SHOP_LISTING_ITEMS_TABLE_NAME}.listingId`,
          to: `${SHOP_LISTING_TABLE_NAME}.id`,
        },
      },
      item: {
        relation: Model.BelongsToOneRelation,
        modelClass: ItemsModel,
        join: {
          from: `${SHOP_LISTING_ITEMS_TABLE_NAME}.itemId`,
          to: 'items.id',
        },
      },
    };
  }
}

export class ShopListingModel extends TakaroModel {
  static tableName = SHOP_LISTING_TABLE_NAME;

  id!: string;
  gameServerId!: string;
  price!: number;
  name?: string;

  deletedAt?: Date;
  draft: boolean;

  items: ItemsModel[];

  static get relationMappings() {
    return {
      gameServer: {
        relation: Model.BelongsToOneRelation,
        modelClass: GameServerModel,
        join: {
          from: `${SHOP_LISTING_TABLE_NAME}.gameServerId`,
          to: 'gameservers.id',
        },
      },
      items: {
        relation: Model.HasManyRelation,
        modelClass: ItemOnShopListingModel,
        join: {
          from: `${SHOP_LISTING_TABLE_NAME}.id`,
          to: `${SHOP_LISTING_ITEMS_TABLE_NAME}.listingId`,
        },
      },
      roles: {
        relation: Model.ManyToManyRelation,
        modelClass: RoleModel,
        join: {
          from: `${SHOP_LISTING_TABLE_NAME}.id`,
          through: {
            from: `${SHOP_LISTING_ROLE_TABLE_NAME}.listingId`,
            to: `${SHOP_LISTING_ROLE_TABLE_NAME}.roleId`,
          },
          to: 'roles.id',
        },
      },
    };
  }
}

export class ShopListingRoleModel extends TakaroModel {
  static tableName = SHOP_LISTING_ROLE_TABLE_NAME;

  id!: string;
  listingId!: string;
  roleId!: string;

  static get relationMappings() {
    return {
      listing: {
        relation: Model.BelongsToOneRelation,
        modelClass: ShopListingModel,
        join: {
          from: `${SHOP_LISTING_ROLE_TABLE_NAME}.listingId`,
          to: `${SHOP_LISTING_TABLE_NAME}.id`,
        },
      },
      role: {
        relation: Model.BelongsToOneRelation,
        modelClass: RoleModel,
        join: {
          from: `${SHOP_LISTING_ROLE_TABLE_NAME}.roleId`,
          to: 'roles.id',
        },
      },
    };
  }
}

@traceableClass('repo:shopListing')
export class ShopListingRepo extends ITakaroRepo<
  ShopListingModel,
  ShopListingOutputDTO,
  ShopListingCreateDTO,
  ShopListingUpdateDTO
> {
  async getModel() {
    const knex = await this.getKnex();
    const model = ShopListingModel.bindKnex(knex);
    return {
      model,
      query: model.query().modify('domainScoped', this.domainId),
    };
  }

  async getListingRoleModel() {
    const knex = await this.getKnex();
    const model = ShopListingRoleModel.bindKnex(knex);
    return {
      model,
      query: model.query().modify('domainScoped', this.domainId),
    };
  }

  async create(item: ShopListingCreateDTO): Promise<ShopListingOutputDTO> {
    const knex = await this.getKnex();
    const { query } = await this.getModel();
    const listing = await query
      .insert({
        gameServerId: item.gameServerId,
        name: item.name,
        price: item.price,
        domain: this.domainId,
      })
      .returning('*');

    if (!item.items || !item.items.length) throw new errors.BadRequestError('At least one item is required');

    const itemMetas = item.items.map((i) => ({
      listingId: listing.id,
      itemId: i.itemId,
      amount: i.amount,
      quality: i.quality,
    }));

    await Promise.all(
      itemMetas.map(async (i) => {
        await ItemOnShopListingModel.bindKnex(knex).query().insert(i);
      }),
    );

    return this.findOne(listing.id);
  }

  async find(filters: ITakaroQuery<ShopListingOutputDTO>) {
    const { query } = await this.getModel();
    query.where('deletedAt', null);
    const result = await new QueryBuilder<ShopListingModel, ShopListingOutputDTO>({
      ...filters,
      extend: [...(filters.extend || []), 'items.item'],
    }).build(query);

    return {
      total: result.total,
      results: await Promise.all(result.results.map((item) => new ShopListingOutputDTO(item))),
    };
  }

  async findOne(id: string): Promise<ShopListingOutputDTO> {
    const { query } = await this.getModel();
    const res = await query.findById(id).withGraphFetched('items.item');
    if (!res) throw new errors.NotFoundError();
    if (res.deletedAt) throw new errors.NotFoundError();
    return new ShopListingOutputDTO(res);
  }

  async update(id: string, data: ShopListingUpdateDTO): Promise<ShopListingOutputDTO> {
    const existing = await this.findOne(id);
    if (!existing) throw new errors.NotFoundError();
    const knex = await this.getKnex();

    const { query } = await this.getModel();
    const res = await query.updateAndFetchById(id, data.toJSON()).returning('*');

    if (data.items) {
      const itemMetas = data.items.map((i) => ({
        listingId: id,
        itemId: i.itemId,
        amount: i.amount,
        quality: i.quality,
      }));

      await ItemOnShopListingModel.bindKnex(knex).query().delete().where('listingId', id);

      await Promise.all(
        itemMetas.map(async (i) => {
          await ItemOnShopListingModel.bindKnex(knex).query().insert(i);
        }),
      );
    }

    return this.findOne(res.id);
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.findOne(id);
    if (!existing) throw new errors.NotFoundError();

    const { query } = await this.getModel();
    await query.updateAndFetchById(id, { deletedAt: new Date() });
    return true;
  }

  async addRole(listingId: string, roleId: string): Promise<ShopListingOutputDTO> {
    const { query } = await this.getListingRoleModel();
    await query.insert({
      listingId,
      roleId,
      domain: this.domainId,
    });
    const listing = await this.findOne(listingId);
    return listing;
  }

  async removeRole(listingId: string, roleId: string): Promise<boolean> {
    const { query } = await this.getListingRoleModel();
    const existing = await query.findOne({ listingId, roleId });
    if (!existing) throw new errors.NotFoundError();

    const data = await query.deleteById(existing.id);
    return !!data;
  }
}
