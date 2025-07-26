import { TakaroModel, ITakaroQuery, QueryBuilder } from '@takaro/db';
import { Model } from 'objection';
import { errors, traceableClass, ctx } from '@takaro/util';
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

    // Use transaction from context if available
    const query = ctx.transaction ? model.query(ctx.transaction) : model.query();

    return {
      model,
      query: query.modify('domainScoped', this.domainId),
      knex,
    };
  }

  async find(filters: ITakaroQuery<ShopCategoryOutputDTO>) {
    const { query } = await this.getModel();
    const knex = await this.getKnex();

    // First, get the basic results using QueryBuilder for pagination, filtering, etc.
    const basicResult = await new QueryBuilder<ShopCategoryModel, ShopCategoryOutputDTO>({
      ...filters,
      extend: [...(filters.extend || []), 'parent', 'children'],
    }).build(query);

    // Then, for each category, get the listing count
    const resultsWithCounts = await Promise.all(
      basicResult.results.map(async (category) => {
        let listingCount = 0;

        if (category.children && category.children.length > 0) {
          // For parent categories: count listings assigned to this category OR any of its children
          const childIds = category.children.map((child) => child.id);
          const allCategoryIds = [category.id, ...childIds];

          const countResult = await knex
            .select(knex.raw(`COUNT(DISTINCT "${SHOP_LISTING_CATEGORY_TABLE_NAME}"."shopListingId") as count`))
            .from(SHOP_LISTING_CATEGORY_TABLE_NAME)
            .whereIn(`${SHOP_LISTING_CATEGORY_TABLE_NAME}.shopCategoryId`, allCategoryIds)
            .where(`${SHOP_LISTING_CATEGORY_TABLE_NAME}.domain`, category.domain)
            .first();

          listingCount = parseInt((countResult as any)?.count || '0', 10);
        } else {
          // For child/leaf categories: count only listings assigned directly to this category
          const countResult = await knex
            .select(knex.raw(`COUNT(DISTINCT "${SHOP_LISTING_CATEGORY_TABLE_NAME}"."shopListingId") as count`))
            .from(SHOP_LISTING_CATEGORY_TABLE_NAME)
            .where(`${SHOP_LISTING_CATEGORY_TABLE_NAME}.shopCategoryId`, category.id)
            .where(`${SHOP_LISTING_CATEGORY_TABLE_NAME}.domain`, category.domain)
            .first();

          listingCount = parseInt((countResult as any)?.count || '0', 10);
        }

        return new ShopCategoryOutputDTO({
          id: category.id,
          name: category.name,
          emoji: category.emoji,
          parentId: category.parentId,
          domain: category.domain,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
          listingCount,
          parent: category.parent ? await this.modelToDTO(category.parent) : undefined,
          children: category.children
            ? await Promise.all(category.children.map((child) => this.modelToDTO(child)))
            : undefined,
        });
      }),
    );

    return {
      total: basicResult.total,
      results: resultsWithCounts,
    };
  }

  async findOne(id: string): Promise<ShopCategoryOutputDTO> {
    const { query } = await this.getModel();
    const knex = await this.getKnex();

    // Get the basic category with parent/children relationships
    const res = await query.findById(id).withGraphFetched('[parent, children]');

    if (!res) throw new errors.NotFoundError();

    // Get listing count separately with hierarchical logic
    let listingCount = 0;

    if (res.children && res.children.length > 0) {
      // For parent categories: count listings assigned to this category OR any of its children
      const childIds = res.children.map((child) => child.id);
      const allCategoryIds = [res.id, ...childIds];

      const countResult = await knex
        .select(knex.raw(`COUNT(DISTINCT "${SHOP_LISTING_CATEGORY_TABLE_NAME}"."shopListingId") as count`))
        .from(SHOP_LISTING_CATEGORY_TABLE_NAME)
        .whereIn(`${SHOP_LISTING_CATEGORY_TABLE_NAME}.shopCategoryId`, allCategoryIds)
        .where(`${SHOP_LISTING_CATEGORY_TABLE_NAME}.domain`, res.domain)
        .first();

      listingCount = parseInt((countResult as any)?.count || '0', 10);
    } else {
      // For child/leaf categories: count only listings assigned directly to this category
      const countResult = await knex
        .select(knex.raw(`COUNT(DISTINCT "${SHOP_LISTING_CATEGORY_TABLE_NAME}"."shopListingId") as count`))
        .from(SHOP_LISTING_CATEGORY_TABLE_NAME)
        .where(`${SHOP_LISTING_CATEGORY_TABLE_NAME}.shopCategoryId`, res.id)
        .where(`${SHOP_LISTING_CATEGORY_TABLE_NAME}.domain`, res.domain)
        .first();

      listingCount = parseInt((countResult as any)?.count || '0', 10);
    }

    return new ShopCategoryOutputDTO({
      id: res.id,
      name: res.name,
      emoji: res.emoji,
      parentId: res.parentId,
      domain: res.domain,
      createdAt: res.createdAt,
      updatedAt: res.updatedAt,
      listingCount,
      parent: res.parent ? await this.modelToDTO(res.parent) : undefined,
      children: res.children ? await Promise.all(res.children.map((child) => this.modelToDTO(child))) : undefined,
    });
  }

  async create(item: ShopCategoryCreateDTO): Promise<ShopCategoryOutputDTO> {
    // Validate name length
    if (item.name.length > 50) {
      throw new errors.BadRequestError('Category name must be 50 characters or less');
    }

    // Validate name contains only alphanumeric and special characters (hyphens, underscores, spaces, ampersands)
    if (!/^[a-zA-Z0-9_\- &]+$/.test(item.name)) {
      throw new errors.BadRequestError(
        'Category name can only contain letters, numbers, spaces, hyphens, underscores, and ampersands',
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

    // No need to check for duplicates - database constraint will handle it

    try {
      const category = await query
        .insert({
          name: item.name,
          emoji: item.emoji,
          parentId: item.parentId || null,
          domain: this.domainId,
        })
        .returning('*');

      return this.findOne(category.id);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'UniqueViolationError') {
          throw new errors.BadRequestError('A category with this name already exists');
        }
        if (error.name === 'ForeignKeyViolationError') {
          throw new errors.BadRequestError('Parent category not found');
        }
      }
      throw error;
    }
  }

  async update(id: string, data: ShopCategoryUpdateDTO): Promise<ShopCategoryOutputDTO> {
    const existing = await this.findOne(id);
    if (!existing) throw new errors.NotFoundError();

    // Validate name if provided
    if (data.name !== undefined) {
      if (data.name.length > 50) {
        throw new errors.BadRequestError('Category name must be 50 characters or less');
      }

      if (!/^[a-zA-Z0-9_\- &]+$/.test(data.name)) {
        throw new errors.BadRequestError(
          'Category name can only contain letters, numbers, spaces, hyphens, underscores, and ampersands',
        );
      }

      // No need to check for duplicates - database constraint will handle it
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

    try {
      await query.updateAndFetchById(id, data.toJSON()).returning('*');
      return this.findOne(id);
    } catch (error) {
      if (error instanceof Error && error.name === 'UniqueViolationError') {
        throw new errors.BadRequestError('A category with this name already exists');
      }
      throw error;
    }
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
    // Remove categories if specified
    if (removeCategoryIds && removeCategoryIds.length > 0) {
      const knex = await this.getKnex();
      const query = ctx.transaction
        ? knex(SHOP_LISTING_CATEGORY_TABLE_NAME).transacting(ctx.transaction)
        : knex(SHOP_LISTING_CATEGORY_TABLE_NAME);
      await query.whereIn('shopListingId', listingIds).whereIn('shopCategoryId', removeCategoryIds).delete();
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
      const knex = await this.getKnex();
      const query = ctx.transaction
        ? knex(SHOP_LISTING_CATEGORY_TABLE_NAME).transacting(ctx.transaction)
        : knex(SHOP_LISTING_CATEGORY_TABLE_NAME);
      await query.insert(assignments).onConflict(['shopListingId', 'shopCategoryId']).ignore();
    }
  }

  async getDescendantCategoryIds(categoryIds: string[]): Promise<string[]> {
    if (categoryIds.length === 0) return [];

    const knex = await this.getKnex();

    try {
      // Use a recursive CTE to get all descendants
      const result = await knex.raw(
        `
        WITH RECURSIVE recursive_categories AS (
          -- Base case: start with the provided category IDs
          SELECT id, "parentId"
          FROM "${SHOP_CATEGORY_TABLE_NAME}"
          WHERE id = ANY(?)
            AND domain = ?
          
          UNION ALL
          
          -- Recursive case: find children of current level
          SELECT c.id, c."parentId"
          FROM "${SHOP_CATEGORY_TABLE_NAME}" c
          JOIN recursive_categories rc ON c."parentId" = rc.id
          WHERE c.domain = ?
        )
        SELECT DISTINCT id FROM recursive_categories;
      `,
        [categoryIds, this.domainId, this.domainId],
      );

      return result.rows.map((row: any) => row.id);
    } catch (error) {
      // If recursive CTE fails, fall back to simple implementation
      console.error('Recursive CTE failed, falling back to simple implementation:', error);
      return categoryIds;
    }
  }
}
