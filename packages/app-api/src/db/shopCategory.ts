import { TakaroModel, ITakaroQuery, QueryBuilder } from '@takaro/db';
import { Model } from 'objection';
import { errors, traceableClass } from '@takaro/util';
import { ITakaroRepo } from './base.js';
import { ShopCategoryOutputDTO, ShopCategoryCreateDTO, ShopCategoryUpdateDTO } from '../service/Shop/dto.js';
import { ShopListingModel, SHOP_LISTING_TABLE_NAME } from './shopListing.js';

export const SHOP_CATEGORY_TABLE_NAME = 'shopCategory';
export const SHOP_LISTING_CATEGORY_TABLE_NAME = 'shopListingCategory';

export class ShopCategoryModel extends TakaroModel {
  static tableName = SHOP_CATEGORY_TABLE_NAME;

  id!: string;
  name!: string;
  emoji!: string;
  parentId?: string | null;
  domain!: string;

  // Virtual properties
  parent?: ShopCategoryModel;
  children?: ShopCategoryModel[];
  listings?: ShopListingModel[];

  static get relationMappings() {
    return {
      parent: {
        relation: Model.BelongsToOneRelation,
        modelClass: ShopCategoryModel,
        join: {
          from: `${SHOP_CATEGORY_TABLE_NAME}.parentId`,
          to: `${SHOP_CATEGORY_TABLE_NAME}.id`,
        },
      },
      children: {
        relation: Model.HasManyRelation,
        modelClass: ShopCategoryModel,
        join: {
          from: `${SHOP_CATEGORY_TABLE_NAME}.id`,
          to: `${SHOP_CATEGORY_TABLE_NAME}.parentId`,
        },
      },
      listings: {
        relation: Model.ManyToManyRelation,
        modelClass: ShopListingModel,
        join: {
          from: `${SHOP_CATEGORY_TABLE_NAME}.id`,
          through: {
            from: `${SHOP_LISTING_CATEGORY_TABLE_NAME}.shopCategoryId`,
            to: `${SHOP_LISTING_CATEGORY_TABLE_NAME}.shopListingId`,
          },
          to: `${SHOP_LISTING_TABLE_NAME}.id`,
        },
      },
    };
  }
}

export class ShopListingCategoryModel extends TakaroModel {
  static tableName = SHOP_LISTING_CATEGORY_TABLE_NAME;

  id!: string;
  shopListingId!: string;
  shopCategoryId!: string;
  domain!: string;

  static get relationMappings() {
    return {
      listing: {
        relation: Model.BelongsToOneRelation,
        modelClass: ShopListingModel,
        join: {
          from: `${SHOP_LISTING_CATEGORY_TABLE_NAME}.shopListingId`,
          to: `${SHOP_LISTING_TABLE_NAME}.id`,
        },
      },
      category: {
        relation: Model.BelongsToOneRelation,
        modelClass: ShopCategoryModel,
        join: {
          from: `${SHOP_LISTING_CATEGORY_TABLE_NAME}.shopCategoryId`,
          to: `${SHOP_CATEGORY_TABLE_NAME}.id`,
        },
      },
    };
  }
}

@traceableClass('repo:shopCategory')
export class ShopCategoryRepo extends ITakaroRepo<
  ShopCategoryModel,
  ShopCategoryOutputDTO,
  ShopCategoryCreateDTO,
  ShopCategoryUpdateDTO
> {
  async getModel() {
    const knex = await this.getKnex();
    const model = ShopCategoryModel.bindKnex(knex);
    return {
      model,
      query: model.query().modify('domainScoped', this.domainId),
    };
  }

  async find(filters: ITakaroQuery<ShopCategoryOutputDTO>) {
    const { query } = await this.getModel();
    const knex = await this.getKnex();

    // Add listing count as a virtual column
    const queryWithCount = query
      .select(`${SHOP_CATEGORY_TABLE_NAME}.*`)
      .leftJoin(
        SHOP_LISTING_CATEGORY_TABLE_NAME,
        `${SHOP_CATEGORY_TABLE_NAME}.id`,
        `${SHOP_LISTING_CATEGORY_TABLE_NAME}.shopCategoryId`,
      )
      .groupBy(`${SHOP_CATEGORY_TABLE_NAME}.id`)
      .select(knex.raw(`COUNT(DISTINCT ${SHOP_LISTING_CATEGORY_TABLE_NAME}.shopListingId) as listingCount`));

    const result = await new QueryBuilder<ShopCategoryModel, ShopCategoryOutputDTO>({
      ...filters,
      extend: [...(filters.extend || []), 'parent', 'children'],
    }).build(queryWithCount);

    return {
      total: result.total,
      results: await Promise.all(
        result.results.map(async (item) => {
          const itemWithCount = item as ShopCategoryModel & { listingCount: number };
          return new ShopCategoryOutputDTO({
            id: itemWithCount.id,
            name: itemWithCount.name,
            emoji: itemWithCount.emoji,
            parentId: itemWithCount.parentId,
            domain: itemWithCount.domain,
            createdAt: itemWithCount.createdAt,
            updatedAt: itemWithCount.updatedAt,
            listingCount: itemWithCount.listingCount || 0,
            parent: itemWithCount.parent ? await this.modelToDTO(itemWithCount.parent) : undefined,
            children: itemWithCount.children
              ? await Promise.all(itemWithCount.children.map((child) => this.modelToDTO(child)))
              : undefined,
          });
        }),
      ),
    };
  }

  async findOne(id: string): Promise<ShopCategoryOutputDTO> {
    const { query } = await this.getModel();
    const knex = await this.getKnex();
    const res = await query
      .findById(id)
      .withGraphFetched('[parent, children]')
      .leftJoin(
        SHOP_LISTING_CATEGORY_TABLE_NAME,
        `${SHOP_CATEGORY_TABLE_NAME}.id`,
        `${SHOP_LISTING_CATEGORY_TABLE_NAME}.shopCategoryId`,
      )
      .groupBy(`${SHOP_CATEGORY_TABLE_NAME}.id`)
      .select(
        `${SHOP_CATEGORY_TABLE_NAME}.*`,
        knex.raw(`COUNT(DISTINCT ${SHOP_LISTING_CATEGORY_TABLE_NAME}.shopListingId) as listingCount`),
      )
      .first();
    if (!res) throw new errors.NotFoundError();
    const resWithCount = res as ShopCategoryModel & { listingCount: number };
    return new ShopCategoryOutputDTO({
      id: resWithCount.id,
      name: resWithCount.name,
      emoji: resWithCount.emoji,
      parentId: resWithCount.parentId,
      domain: resWithCount.domain,
      createdAt: resWithCount.createdAt,
      updatedAt: resWithCount.updatedAt,
      listingCount: resWithCount.listingCount || 0,
      parent: resWithCount.parent ? await this.modelToDTO(resWithCount.parent) : undefined,
      children: resWithCount.children
        ? await Promise.all(resWithCount.children.map((child) => this.modelToDTO(child)))
        : undefined,
    });
  }

  async create(item: ShopCategoryCreateDTO): Promise<ShopCategoryOutputDTO> {
    // Validate name length
    if (item.name.length > 50) {
      throw new errors.BadRequestError('Category name must be 50 characters or less');
    }

    // Validate name contains only alphanumeric and special characters (hyphens, underscores, spaces)
    if (!/^[a-zA-Z0-9_\- ]+$/.test(item.name)) {
      throw new errors.BadRequestError(
        'Category name can only contain letters, numbers, spaces, hyphens, and underscores',
      );
    }

    // Validate emoji is exactly one emoji character
    if (!item.emoji) {
      throw new errors.BadRequestError('Emoji is required');
    }

    // Regex to match a single emoji (including compound emojis)
    const emojiRegex = /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)$/u;
    if (!emojiRegex.test(item.emoji)) {
      throw new errors.BadRequestError('Category emoji must be exactly one emoji character');
    }

    const { query } = await this.getModel();

    // Check domain category limit (100 max)
    const categoryCount = await query.count('* as count').first();
    if (categoryCount && Number((categoryCount as any).count) >= 100) {
      throw new errors.BadRequestError('Maximum category limit (100) reached for this domain');
    }

    // Check for case-insensitive uniqueness at the same parent level
    const existing = await query
      .whereRaw('LOWER(name) = LOWER(?)', [item.name])
      .where('parentId', item.parentId || null)
      .first();

    if (existing) {
      throw new errors.BadRequestError('A category with this name already exists at this level');
    }

    const category = await query
      .insert({
        name: item.name,
        emoji: item.emoji,
        parentId: item.parentId || null,
        domain: this.domainId,
      })
      .returning('*');

    return this.findOne(category.id);
  }

  async update(id: string, data: ShopCategoryUpdateDTO): Promise<ShopCategoryOutputDTO> {
    const existing = await this.findOne(id);
    if (!existing) throw new errors.NotFoundError();

    // Validate name if provided
    if (data.name !== undefined) {
      if (data.name.length > 50) {
        throw new errors.BadRequestError('Category name must be 50 characters or less');
      }

      if (!/^[a-zA-Z0-9_\- ]+$/.test(data.name)) {
        throw new errors.BadRequestError(
          'Category name can only contain letters, numbers, spaces, hyphens, and underscores',
        );
      }

      // Check for case-insensitive uniqueness at the same parent level
      const { query: uniqueQuery } = await this.getModel();
      const parentId = data.parentId !== undefined ? data.parentId : existing.parentId;
      const duplicate = await uniqueQuery
        .whereRaw('LOWER(name) = LOWER(?)', [data.name])
        .where('parentId', parentId || null)
        .whereNot('id', id)
        .first();

      if (duplicate) {
        throw new errors.BadRequestError('A category with this name already exists at this level');
      }
    }

    // Validate emoji if provided
    if (data.emoji !== undefined) {
      if (!data.emoji) {
        throw new errors.BadRequestError('Emoji is required');
      }

      // Regex to match a single emoji (including compound emojis)
      const emojiRegex = /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)$/u;
      if (!emojiRegex.test(data.emoji)) {
        throw new errors.BadRequestError('Category emoji must be exactly one emoji character');
      }
    }

    const { query } = await this.getModel();
    await query.updateAndFetchById(id, data.toJSON()).returning('*');

    return this.findOne(id);
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.findOne(id);
    if (!existing) throw new errors.NotFoundError();

    const { query } = await this.getModel();
    await query.deleteById(id);
    return true;
  }

  private async modelToDTO(model: ShopCategoryModel): Promise<ShopCategoryOutputDTO> {
    return new ShopCategoryOutputDTO({
      id: model.id,
      name: model.name,
      emoji: model.emoji,
      parentId: model.parentId,
      domain: model.domain,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  async bulkAssignCategories(
    listingIds: string[],
    addCategoryIds?: string[],
    removeCategoryIds?: string[],
  ): Promise<void> {
    const knex = await this.getKnex();

    // Start a transaction to ensure atomicity
    await knex.transaction(async (trx) => {
      // Remove categories if specified
      if (removeCategoryIds && removeCategoryIds.length > 0) {
        await trx(SHOP_LISTING_CATEGORY_TABLE_NAME)
          .whereIn('shopListingId', listingIds)
          .whereIn('shopCategoryId', removeCategoryIds)
          .delete();
      }

      // Add categories if specified
      if (addCategoryIds && addCategoryIds.length > 0) {
        const assignments = [];

        for (const listingId of listingIds) {
          for (const categoryId of addCategoryIds) {
            assignments.push({
              shopListingId: listingId,
              shopCategoryId: categoryId,
              domain: this.domainId,
            });
          }
        }

        // Insert only if not already assigned (ignore duplicates)
        await trx(SHOP_LISTING_CATEGORY_TABLE_NAME)
          .insert(assignments)
          .onConflict(['shopListingId', 'shopCategoryId'])
          .ignore();
      }
    });
  }
}
