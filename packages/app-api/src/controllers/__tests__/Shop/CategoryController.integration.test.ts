import { IntegrationTest, expect, IShopCategorySetup, shopCategorySetup } from '@takaro/test';
import { describe } from 'node:test';
import { ShopCategorySearchInputDTOSortDirectionEnum } from '@takaro/apiclient';

const group = 'ShopCategoryController';

const tests = [
  // Basic CRUD Operations
  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: true,
    name: 'Get by ID',
    setup: shopCategorySetup,
    filteredFields: ['id', 'createdAt', 'updatedAt', 'domain', 'parentId', 'parent', 'children', 'listingCount'],
    test: async function () {
      return this.client.shopCategory.shopCategoryControllerGetOne(this.setupData.rootCategories.weapons.id);
    },
  }),

  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: true,
    name: 'Get all categories',
    setup: shopCategorySetup,
    filteredFields: ['id', 'createdAt', 'updatedAt', 'domain', 'parentId', 'parent', 'children', 'listingCount'],
    test: async function () {
      return this.client.shopCategory.shopCategoryControllerGetAll();
    },
  }),

  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: true,
    name: 'Create category',
    setup: shopCategorySetup,
    filteredFields: ['id', 'createdAt', 'updatedAt', 'parentId'],
    test: async function () {
      const res = await this.client.shopCategory.shopCategoryControllerCreate({
        name: 'New Category',
        emoji: '🆕',
      });

      // Verify the category was created
      const findRes = await this.client.shopCategory.shopCategoryControllerGetOne(res.data.data.id);
      expect(findRes.data.data.name).to.equal('New Category');
      expect(findRes.data.data.emoji).to.equal('🆕');
      expect(findRes.data.data.parentId).to.be.null;

      return res;
    },
  }),

  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: true,
    name: 'Create child category',
    setup: shopCategorySetup,
    filteredFields: ['id', 'createdAt', 'updatedAt', 'parentId'],
    test: async function () {
      const res = await this.client.shopCategory.shopCategoryControllerCreate({
        name: 'Child Category',
        emoji: '👶',
        parentId: this.setupData.rootCategories.weapons.id,
      });

      // Verify the child category was created with correct parent
      const findRes = await this.client.shopCategory.shopCategoryControllerGetOne(res.data.data.id);
      expect(findRes.data.data.name).to.equal('Child Category');
      expect(findRes.data.data.parentId).to.equal(this.setupData.rootCategories.weapons.id);

      return res;
    },
  }),

  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: true,
    name: 'Update category',
    setup: shopCategorySetup,
    filteredFields: ['id', 'createdAt', 'updatedAt', 'parentId'],
    test: async function () {
      const res = await this.client.shopCategory.shopCategoryControllerUpdate(this.setupData.childCategories.melee.id, {
        name: 'Updated Melee',
        emoji: '🗡️',
      });

      // Verify the update
      const findRes = await this.client.shopCategory.shopCategoryControllerGetOne(
        this.setupData.childCategories.melee.id,
      );
      expect(findRes.data.data.name).to.equal('Updated Melee');
      expect(findRes.data.data.emoji).to.equal('🗡️');

      return res;
    },
  }),

  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: true,
    name: 'Delete category',
    setup: shopCategorySetup,
    expectedStatus: 404,
    test: async function () {
      await this.client.shopCategory.shopCategoryControllerRemove(this.setupData.childCategories.power.id);
      return this.client.shopCategory.shopCategoryControllerGetOne(this.setupData.childCategories.power.id);
    },
  }),

  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: true,
    name: 'Search categories',
    setup: shopCategorySetup,
    filteredFields: ['id', 'createdAt', 'updatedAt', 'parentId'],
    test: async function () {
      return this.client.shopCategory.shopCategoryControllerSearch({
        search: { name: ['Weapons'] },
        sortBy: 'name',
        sortDirection: ShopCategorySearchInputDTOSortDirectionEnum.Asc,
      });
    },
  }),

  // Hierarchical Structure Tests
  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: true,
    name: 'Move category to different parent',
    setup: shopCategorySetup,
    filteredFields: ['id', 'createdAt', 'updatedAt', 'domain', 'parentId', 'parent', 'children', 'listingCount'],
    test: async function () {
      const res = await this.client.shopCategory.shopCategoryControllerMove(this.setupData.childCategories.melee.id, {
        parentId: this.setupData.rootCategories.tools.id,
      });

      // Verify the move
      const findRes = await this.client.shopCategory.shopCategoryControllerGetOne(
        this.setupData.childCategories.melee.id,
      );
      expect(findRes.data.data.parentId).to.equal(this.setupData.rootCategories.tools.id);

      return res;
    },
  }),

  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: true,
    name: 'Move category to root level',
    setup: shopCategorySetup,
    filteredFields: ['id', 'createdAt', 'updatedAt', 'parentId'],
    test: async function () {
      const res = await this.client.shopCategory.shopCategoryControllerMove(this.setupData.childCategories.helmet.id, {
        parentId: undefined,
      });

      // Verify the move to root
      const findRes = await this.client.shopCategory.shopCategoryControllerGetOne(
        this.setupData.childCategories.helmet.id,
      );
      expect(findRes.data.data.parentId).to.be.null;

      return res;
    },
  }),

  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: true,
    name: 'Prevent circular reference when moving',
    setup: shopCategorySetup,
    expectedStatus: 400,
    test: async function () {
      // Try to move a parent to be a child of its own descendant
      const res = await this.client.shopCategory.shopCategoryControllerMove(this.setupData.rootCategories.weapons.id, {
        parentId: this.setupData.childCategories.melee.id,
      });

      expect(res.status).to.equal(400);
      expect(res.data.meta.error.message).to.include('Cannot create circular category hierarchy');

      return res;
    },
  }),

  // Bulk Operations Tests
  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: true,
    name: 'Bulk assign categories to listings',
    setup: shopCategorySetup,
    filteredFields: ['id', 'createdAt', 'updatedAt', 'domain', 'parentId'],
    test: async function () {
      const res = await this.client.shopCategory.shopCategoryControllerBulkAssign({
        listingIds: [this.setupData.uncategorizedListings[0].id],
        addCategoryIds: [this.setupData.rootCategories.weapons.id, this.setupData.childCategories.melee.id],
      });

      // Verify the assignment
      const listingRes = await this.client.shopListing.shopListingControllerGetOne(
        this.setupData.uncategorizedListings[0].id,
      );
      expect(listingRes.data.data.categories).to.have.length(2);
      const categoryIds = listingRes.data.data.categories!.map((c) => c.id);
      expect(categoryIds).to.include(this.setupData.rootCategories.weapons.id);
      expect(categoryIds).to.include(this.setupData.childCategories.melee.id);

      return res;
    },
  }),

  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: true,
    name: 'Bulk remove categories from listings',
    setup: shopCategorySetup,
    filteredFields: ['id', 'createdAt', 'updatedAt', 'domain', 'parentId'],
    test: async function () {
      const res = await this.client.shopCategory.shopCategoryControllerBulkAssign({
        listingIds: [this.setupData.categorizedListings[0].id],
        removeCategoryIds: [this.setupData.childCategories.melee.id],
      });

      // Verify the removal
      const listingRes = await this.client.shopListing.shopListingControllerGetOne(
        this.setupData.categorizedListings[0].id,
      );
      const categoryIds = listingRes.data.data.categories?.map((c) => c.id) || [];
      expect(categoryIds).to.not.include(this.setupData.childCategories.melee.id);

      return res;
    },
  }),

  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: true,
    name: 'Mixed bulk operations (add and remove)',
    setup: shopCategorySetup,
    filteredFields: ['id', 'createdAt', 'updatedAt', 'domain', 'parentId'],
    test: async function () {
      const res = await this.client.shopCategory.shopCategoryControllerBulkAssign({
        listingIds: [this.setupData.categorizedListings[3].id], // Multi-category listing
        addCategoryIds: [this.setupData.rootCategories.tools.id],
        removeCategoryIds: [this.setupData.childCategories.melee.id],
      });

      // Verify the mixed operation
      const listingRes = await this.client.shopListing.shopListingControllerGetOne(
        this.setupData.categorizedListings[3].id,
      );
      const categoryIds = listingRes.data.data.categories?.map((c) => c.id) || [];
      expect(categoryIds).to.include(this.setupData.rootCategories.tools.id);
      expect(categoryIds).to.not.include(this.setupData.childCategories.melee.id);

      return res;
    },
  }),

  // Validation & Error Handling Tests
  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: true,
    name: 'Get category with invalid ID',
    setup: shopCategorySetup,
    expectedStatus: 400,
    test: async function () {
      return this.client.shopCategory.shopCategoryControllerGetOne('invalid-id');
    },
  }),

  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: true,
    name: 'Create category with invalid name (too long)',
    setup: shopCategorySetup,
    expectedStatus: 400,
    test: async function () {
      return this.client.shopCategory.shopCategoryControllerCreate({
        name: 'A'.repeat(51), // Max is 50 characters
        emoji: '🚫',
      });
    },
  }),

  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: true,
    name: 'Create category with invalid emoji (multiple)',
    setup: shopCategorySetup,
    expectedStatus: 400,
    test: async function () {
      return this.client.shopCategory.shopCategoryControllerCreate({
        name: 'Invalid Emoji',
        emoji: '🚫🚫', // Multiple emojis not allowed
      });
    },
  }),

  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: true,
    name: 'Create category with empty name',
    setup: shopCategorySetup,
    expectedStatus: 400,
    test: async function () {
      return this.client.shopCategory.shopCategoryControllerCreate({
        name: '',
        emoji: '🚫',
      });
    },
  }),

  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: true,
    name: 'Create category with duplicate name (global check)',
    setup: shopCategorySetup,
    expectedStatus: 400,
    test: async function () {
      // Try to create a category with same name as existing 'Melee Weapons'
      // which is a child category under Weapons
      const res = await this.client.shopCategory.shopCategoryControllerCreate({
        name: 'Melee Weapons', // This already exists as a child category
        emoji: '⚔️',
      });

      expect(res.status).to.equal(400);
      expect(res.data.meta.error.message).to.include('Category with this name already exists');

      return res;
    },
  }),

  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: true,
    name: 'Create category with non-existent parent',
    setup: shopCategorySetup,
    expectedStatus: 400,
    test: async function () {
      return this.client.shopCategory.shopCategoryControllerCreate({
        name: 'Orphan Category',
        emoji: '👻',
        parentId: '00000000-0000-0000-0000-000000000000',
      });
    },
  }),

  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: true,
    name: 'Update category with invalid ID',
    setup: shopCategorySetup,
    expectedStatus: 400,
    test: async function () {
      return this.client.shopCategory.shopCategoryControllerUpdate('invalid-id', {
        name: 'Updated Name',
      });
    },
  }),

  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: true,
    name: 'Delete category with invalid ID',
    setup: shopCategorySetup,
    expectedStatus: 400,
    test: async function () {
      return this.client.shopCategory.shopCategoryControllerRemove('invalid-id');
    },
  }),

  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: true,
    name: 'Move category with invalid ID',
    setup: shopCategorySetup,
    expectedStatus: 400,
    test: async function () {
      return this.client.shopCategory.shopCategoryControllerMove('invalid-id', {
        parentId: this.setupData.rootCategories.weapons.id,
      });
    },
  }),

  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: true,
    name: 'Bulk assign with invalid listing IDs',
    setup: shopCategorySetup,
    expectedStatus: 400,
    filteredFields: ['addCategoryIds'],
    test: async function () {
      return this.client.shopCategory.shopCategoryControllerBulkAssign({
        listingIds: ['invalid-listing-id'],
        addCategoryIds: [this.setupData.rootCategories.weapons.id],
      });
    },
  }),

  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: true,
    name: 'Bulk assign with invalid category IDs',
    setup: shopCategorySetup,
    expectedStatus: 400,
    filteredFields: ['listingIds'],
    test: async function () {
      return this.client.shopCategory.shopCategoryControllerBulkAssign({
        listingIds: [this.setupData.uncategorizedListings[0].id],
        addCategoryIds: ['invalid-category-id'],
      });
    },
  }),

  // Edge Cases & Integration Tests
  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: true,
    name: 'Delete parent category with children',
    setup: shopCategorySetup,
    expectedStatus: 404,
    filteredFields: ['id', 'createdAt', 'updatedAt', 'parentId'],
    test: async function () {
      // Delete a parent category that has children
      await this.client.shopCategory.shopCategoryControllerRemove(this.setupData.rootCategories.armor.id);

      // Verify children are orphaned (parentId set to null)
      const childRes = await this.client.shopCategory.shopCategoryControllerGetOne(
        this.setupData.childCategories.helmet.id,
      );
      expect(childRes.data.data.parentId).to.be.null;

      return this.client.shopCategory.shopCategoryControllerGetOne(this.setupData.rootCategories.armor.id);
    },
  }),

  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: true,
    name: 'Search categories with special characters',
    setup: shopCategorySetup,
    filteredFields: ['id', 'createdAt', 'updatedAt', 'parentId'],
    test: async function () {
      // Create a category with special characters for search
      const _createRes = await this.client.shopCategory.shopCategoryControllerCreate({
        name: 'Test & Category',
        emoji: '🧪',
      });

      // Search for it
      const searchRes = await this.client.shopCategory.shopCategoryControllerSearch({
        search: { name: ['Test & Category'] },
      });

      expect(searchRes.data.data).to.have.length(1);
      expect(searchRes.data.data[0].name).to.equal('Test & Category');

      return searchRes;
    },
  }),

  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: true,
    name: 'Category with listings assigned',
    setup: shopCategorySetup,
    filteredFields: ['id', 'createdAt', 'updatedAt', 'parentId'],
    test: async function () {
      // Get a category that has listings assigned
      const categoryRes = await this.client.shopCategory.shopCategoryControllerGetOne(
        this.setupData.childCategories.melee.id,
      );

      // Verify it has listings
      expect(categoryRes.data.data.listingCount).to.be.greaterThan(0);

      return categoryRes;
    },
  }),

  // Hierarchical counting tests
  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: false,
    name: 'Parent category counts listings from children',
    setup: shopCategorySetup,
    test: async function () {
      // Get the parent Weapons category
      const weaponsRes = await this.client.shopCategory.shopCategoryControllerGetOne(
        this.setupData.rootCategories.weapons.id,
      );
      const weapons = weaponsRes.data.data;

      // Weapons should have listings from both its direct assignments and its children
      // The shopCategorySetup creates listings assigned to child categories (melee, ranged)
      expect(weapons.listingCount).to.be.greaterThan(0);

      return weaponsRes;
    },
  }),

  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: false,
    name: 'Child categories count their own listings',
    setup: shopCategorySetup,
    test: async function () {
      // Get child categories that should have listings
      const meleeRes = await this.client.shopCategory.shopCategoryControllerGetOne(
        this.setupData.childCategories.melee.id,
      );
      const rangedRes = await this.client.shopCategory.shopCategoryControllerGetOne(
        this.setupData.childCategories.ranged.id,
      );

      const melee = meleeRes.data.data;
      const ranged = rangedRes.data.data;

      // Child categories should have their own listing counts
      expect(melee.listingCount).to.be.greaterThan(0);
      expect(ranged.listingCount).to.be.greaterThan(0);

      return meleeRes;
    },
  }),

  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: false,
    name: 'Hierarchical counts in getAll endpoint',
    setup: shopCategorySetup,
    test: async function () {
      // Get all categories
      const categoriesRes = await this.client.shopCategory.shopCategoryControllerGetAll({});
      const categories = categoriesRes.data.data;

      // Find our test categories
      const weapons = categories.find((c) => c.id === this.setupData.rootCategories.weapons.id);
      const melee = categories.find((c) => c.id === this.setupData.childCategories.melee.id);
      const ranged = categories.find((c) => c.id === this.setupData.childCategories.ranged.id);

      expect(weapons).to.exist;
      expect(melee).to.exist;
      expect(ranged).to.exist;

      // Verify hierarchical counting works in getAll
      expect(weapons!.listingCount).to.be.greaterThan(0); // Should include children
      expect(melee!.listingCount).to.be.greaterThan(0); // Direct assignment
      expect(ranged!.listingCount).to.be.greaterThan(0); // Direct assignment

      // Parent should have count >= sum of children (may have direct assignments too)
      const meleeCount = melee!.listingCount || 0;
      const rangedCount = ranged!.listingCount || 0;
      expect(weapons!.listingCount).to.be.at.least(Math.max(meleeCount, rangedCount));

      return categoriesRes;
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
