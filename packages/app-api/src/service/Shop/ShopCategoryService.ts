import { TakaroService } from '../Base.js';
import { ShopCategoryModel, ShopCategoryRepo } from '../../db/shopCategory.js';
import { errors, traceableClass, ctx } from '@takaro/util';
import { ITakaroQuery } from '@takaro/db';
import { PaginatedOutput } from '../../db/base.js';
import { ShopCategoryOutputDTO, ShopCategoryCreateDTO, ShopCategoryUpdateDTO } from './dto.js';
import { EventService } from '../EventService.js';
import { ShopListingService } from './index.js';

@traceableClass('service:shopCategory')
export class ShopCategoryService extends TakaroService<
  ShopCategoryModel,
  ShopCategoryOutputDTO,
  ShopCategoryCreateDTO,
  ShopCategoryUpdateDTO
> {
  private eventService = new EventService(this.domainId);

  get repo() {
    return new ShopCategoryRepo(this.domainId);
  }

  async find(filters: ITakaroQuery<ShopCategoryOutputDTO>): Promise<PaginatedOutput<ShopCategoryOutputDTO>> {
    return this.repo.find(filters);
  }

  async findOne(id: string): Promise<ShopCategoryOutputDTO> {
    return this.repo.findOne(id);
  }

  async create(item: ShopCategoryCreateDTO): Promise<ShopCategoryOutputDTO> {
    const created = await this.repo.create(item);

    // TODO: Emit category created event if needed

    return created;
  }

  async update(id: string, data: ShopCategoryUpdateDTO): Promise<ShopCategoryOutputDTO> {
    const updated = await this.repo.update(id, data);

    // TODO: Emit category updated event if needed

    return updated;
  }

  async delete(id: string): Promise<string> {
    await this.findOne(id);

    // Move all sub-categories to root level
    const subCategories = await this.find({
      filters: { parentId: [id] },
    });

    for (const subCategory of subCategories.results) {
      await this.update(subCategory.id, new ShopCategoryUpdateDTO({ parentId: null }));
    }

    await this.repo.delete(id);

    // TODO: Emit category deleted event if needed

    return id;
  }

  async moveCategory(categoryId: string, newParentId: string | null): Promise<ShopCategoryOutputDTO> {
    await this.findOne(categoryId);

    // Prevent moving a category to itself
    if (categoryId === newParentId) {
      throw new errors.BadRequestError('Cannot move a category to itself');
    }

    // Prevent creating circular references
    if (newParentId) {
      let currentParent = await this.findOne(newParentId);
      while (currentParent.parentId) {
        if (currentParent.parentId === categoryId) {
          throw new errors.BadRequestError('Cannot create circular category hierarchy');
        }
        currentParent = await this.findOne(currentParent.parentId);
      }
    }

    return this.update(categoryId, new ShopCategoryUpdateDTO({ parentId: newParentId }));
  }

  async getCategoryTree(): Promise<ShopCategoryOutputDTO[]> {
    // Get all categories
    const allCategories = await this.find({});

    // Build tree structure (only root categories)
    const rootCategories = allCategories.results.filter((cat) => !cat.parentId);

    // The children are already populated by the repo's find method
    return rootCategories;
  }

  async getCategoryListingCount(categoryId: string): Promise<number> {
    await this.repo.findOne(categoryId);
    // This would need to be implemented with a proper query
    // For now, return 0 as a placeholder
    return 0;
  }

  async bulkAssignCategories(
    listingIds: string[],
    addCategoryIds?: string[],
    removeCategoryIds?: string[],
  ): Promise<void> {
    if (!addCategoryIds?.length && !removeCategoryIds?.length) {
      throw new errors.BadRequestError('Must provide at least one category to add or remove');
    }

    const { knex } = await this.repo.getModel();

    // Execute all operations in a single transaction
    await ctx.runInTransaction(knex, async () => {
      // Validate all category IDs exist within the transaction
      if (addCategoryIds && addCategoryIds.length > 0) {
        const categories = await this.find({ filters: { id: addCategoryIds } });
        if (categories.results.length !== addCategoryIds.length) {
          throw new errors.BadRequestError('One or more categories not found');
        }
      }

      if (removeCategoryIds && removeCategoryIds.length > 0) {
        const categories = await this.find({ filters: { id: removeCategoryIds } });
        if (categories.results.length !== removeCategoryIds.length) {
          throw new errors.BadRequestError('One or more categories not found');
        }
      }

      // Validate all listing IDs exist within the transaction
      const shopListingService = new ShopListingService(this.domainId);
      const listings = await shopListingService.find({ filters: { id: listingIds } });
      if (listings.results.length !== listingIds.length) {
        throw new errors.BadRequestError('One or more listings not found');
      }

      // Use the repo to handle the bulk assignments
      await this.repo.bulkAssignCategories(listingIds, addCategoryIds, removeCategoryIds);
    });
  }
}
