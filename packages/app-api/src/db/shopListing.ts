import { ITakaroQuery, QueryBuilder, TakaroModel } from '@takaro/db';
import { Model } from 'objection';
import { errors, traceableClass, ctx } from '@takaro/util';
import { GameServerModel } from './gameserver.js';
import { ItemRepo, ItemsModel } from './items.js';
import { RoleModel } from './role.js';
import { ITakaroRepo } from './base.js';
import { ShopListingOutputDTO, ShopListingUpdateDTO, ShopListingCreateDTO } from '../service/Shop/dto.js';
import {
  ShopCategoryModel,
  ShopCategoryRepo,
  SHOP_CATEGORY_TABLE_NAME,
  SHOP_LISTING_CATEGORY_TABLE_NAME,
} from './shopCategory.js';

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
  icon?: string;
  description?: string;

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
      categories: {
        relation: Model.ManyToManyRelation,
        modelClass: ShopCategoryModel,
        join: {
          from: `${SHOP_LISTING_TABLE_NAME}.id`,
          through: {
            from: `${SHOP_LISTING_CATEGORY_TABLE_NAME}.shopListingId`,
            to: `${SHOP_LISTING_CATEGORY_TABLE_NAME}.shopCategoryId`,
          },
          to: `${SHOP_CATEGORY_TABLE_NAME}.id`,
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

    const query = ctx.transaction ? model.query(ctx.transaction) : model.query();

    return {
      model,
      query: query.modify('domainScoped', this.domainId),
      knex,
    };
  }

  async getListingRoleModel() {
    const knex = await this.getKnex();
    const model = ShopListingRoleModel.bindKnex(knex);

    const query = ctx.transaction ? model.query(ctx.transaction) : model.query();

    return {
      model,
      query: query.modify('domainScoped', this.domainId),
    };
  }

  async create(item: ShopListingCreateDTO): Promise<ShopListingOutputDTO> {
    const knex = await this.getKnex();
    const { query } = await this.getModel();
    const insertData: any = {
      gameServerId: item.gameServerId,
      draft: item.draft,
      name: item.name,
      price: item.price,
      domain: this.domainId,
    };

    // Add optional fields if provided
    if (item.icon !== undefined) {
      insertData.icon = item.icon;
    }
    if (item.description !== undefined) {
      insertData.description = item.description;
    }

    const listing = await query.insert(insertData).returning('*');

    if (!item.items || !item.items.length) throw new errors.BadRequestError('At least one item is required');

    const itemRepo = new ItemRepo(this.domainId);
    const items = await itemRepo.translateItemCodesToIds(
      item.gameServerId,
      item.items.map((i) => i.code).filter((code): code is string => code !== undefined),
    );
    const itemMetas = item.items
      .map((i) => ({
        listingId: listing.id,
        itemId: items.find((item) => item.code === i.code)?.id || i.itemId,
        amount: i.amount,
        quality: i.quality,
      }))
      .filter((i) => i.itemId);

    if (!itemMetas.length) throw new errors.BadRequestError('No valid items found');

    await Promise.all(
      itemMetas.map(async (i) => {
        const query = ctx.transaction
          ? ItemOnShopListingModel.bindKnex(knex).query(ctx.transaction)
          : ItemOnShopListingModel.bindKnex(knex).query();
        await query.insert(i);
      }),
    );

    // Handle category assignments
    if (item.categoryIds && item.categoryIds.length > 0) {
      const categoryAssignments = item.categoryIds.map((categoryId) => ({
        shopListingId: listing.id,
        shopCategoryId: categoryId,
        domain: this.domainId,
      }));

      const query = ctx.transaction
        ? knex(SHOP_LISTING_CATEGORY_TABLE_NAME).transacting(ctx.transaction)
        : knex(SHOP_LISTING_CATEGORY_TABLE_NAME);
      await query.insert(categoryAssignments);
    }

    return this.findOne(listing.id);
  }

  async find(filters: ITakaroQuery<ShopListingOutputDTO>) {
    const { query } = await this.getModel();
    query.where('deletedAt', null);

    // Handle category filters
    if (
      filters.filters?.categoryIds &&
      Array.isArray(filters.filters.categoryIds) &&
      filters.filters.categoryIds.length > 0
    ) {
      const domainId = this.domainId;

      // Get all descendant category IDs (includes the provided IDs and all their children)
      const shopCategoryRepo = new ShopCategoryRepo(this.domainId);
      const allCategoryIds = await shopCategoryRepo.getDescendantCategoryIds(filters.filters.categoryIds as string[]);

      query.whereIn('id', function () {
        this.select('shopListingId')
          .from(SHOP_LISTING_CATEGORY_TABLE_NAME)
          .whereIn('shopCategoryId', allCategoryIds)
          .andWhere('domain', '=', domainId);
      });
    }

    // Handle uncategorized filter
    if (filters.filters?.uncategorized === true) {
      const domainId = this.domainId;
      query.whereNotIn('id', function () {
        this.select('shopListingId').from(SHOP_LISTING_CATEGORY_TABLE_NAME).where('domain', '=', domainId);
      });
    }

    // Remove categoryIds and uncategorized from filters before passing to QueryBuilder
    const { categoryIds: _categoryIds, uncategorized: _uncategorized, ...otherFilters } = filters.filters || {};
    const cleanedFilters = {
      ...filters,
      filters: otherFilters,
      extend: [...(filters.extend || []), 'items.item', 'categories'],
    };

    const result = await new QueryBuilder<ShopListingModel, ShopListingOutputDTO>(cleanedFilters).build(query);

    return {
      total: result.total,
      results: await Promise.all(result.results.map((item) => new ShopListingOutputDTO(item))),
    };
  }

  async findOne(id: string): Promise<ShopListingOutputDTO> {
    const { query } = await this.getModel();
    const res = await query.findById(id).withGraphFetched('[items.item, categories]');
    if (!res) throw new errors.NotFoundError();
    if (res.deletedAt) throw new errors.NotFoundError();
    return new ShopListingOutputDTO(res);
  }

  async update(id: string, data: ShopListingUpdateDTO): Promise<ShopListingOutputDTO> {
    const existing = await this.findOne(id);
    if (!existing) throw new errors.NotFoundError();
    const knex = await this.getKnex();

    const { query } = await this.getModel();
    // Extract categoryIds from data to handle separately
    const { categoryIds, ...updateData } = data.toJSON();
    const res = await query.updateAndFetchById(id, updateData).returning('*');

    if (data.items) {
      const itemRepo = new ItemRepo(this.domainId);
      const items = await itemRepo.translateItemCodesToIds(
        data.gameServerId,
        data.items.map((i) => i.code).filter((code): code is string => code !== undefined),
      );
      const itemMetas = data.items
        .map((i) => {
          return {
            listingId: id,
            itemId: items.find((item) => item.code === i.code)?.id || i.itemId,
            amount: i.amount,
            quality: i.quality,
          };
        })
        .filter((i) => i.itemId);

      await ItemOnShopListingModel.bindKnex(knex).query().delete().where('listingId', id);

      await Promise.all(
        itemMetas.map(async (i) => {
          await ItemOnShopListingModel.bindKnex(knex).query().insert(i);
        }),
      );
    }

    // Handle category assignments
    if (categoryIds !== undefined) {
      // Delete existing category assignments
      await knex(SHOP_LISTING_CATEGORY_TABLE_NAME).where('shopListingId', id).delete();

      // Add new category assignments
      if (categoryIds.length > 0) {
        const categoryAssignments = categoryIds.map((categoryId: string) => ({
          shopListingId: id,
          shopCategoryId: categoryId,
          domain: this.domainId,
        }));

        await knex(SHOP_LISTING_CATEGORY_TABLE_NAME).insert(categoryAssignments);
      }
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

  async deleteMany(gameServerId: string) {
    const { query } = await this.getModel();
    await query.where('gameServerId', gameServerId).update({ deletedAt: new Date() });
  }
}
