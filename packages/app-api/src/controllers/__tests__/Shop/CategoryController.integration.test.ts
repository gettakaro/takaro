import { IntegrationTest, expect, IShopCategorySetup, shopCategorySetup } from '@takaro/test';
import { describe } from 'node:test';
import { ShopCategorySearchInputDTOSortDirectionEnum } from '@takaro/apiclient';
import { randomUUID } from 'crypto';

const group = 'Shop/ShopCategoryController';

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
      const categoriesRes = await this.client.shopCategory.shopCategoryControllerGetAll();
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
  // Test for game-server specific listing counts
  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: false,
    name: 'Category listing counts are game-server specific',
    setup: shopCategorySetup,
    test: async function () {
      // Create a test category
      const testCategory = await this.client.shopCategory.shopCategoryControllerCreate({
        name: `Test Category ${Date.now()}`,
        emoji: '🎮',
      });

      // Create another gameserver using getMockServer
      const gameServer2IdentityToken = randomUUID();
      if (!this.domainRegistrationToken) throw new Error('Domain registration token is not set. Invalid setup?');

      const mockserver2 = await this.createMockServer({
        mockserver: { registrationToken: this.domainRegistrationToken, identityToken: gameServer2IdentityToken },
      });

      // Find the created gameserver
      const gameServers = await this.client.gameserver.gameServerControllerSearch({
        filters: { identityToken: [gameServer2IdentityToken] },
      });
      const gameserver2 = gameServers.data.data.find((gs) => gs.identityToken === gameServer2IdentityToken);
      if (!gameserver2) {
        throw new Error('Game server 2 not found. Did something fail when registering?');
      }

      // Create listings for gameserver1 with the test category
      await this.client.shopListing.shopListingControllerCreate({
        gameServerId: this.setupData.gameserver.id,
        items: [{ itemId: this.setupData.items[0].id, amount: 1 }],
        price: 100,
        name: 'Server1 Listing 1',
        categoryIds: [testCategory.data.data.id],
      });

      await this.client.shopListing.shopListingControllerCreate({
        gameServerId: this.setupData.gameserver.id,
        items: [{ itemId: this.setupData.items[0].id, amount: 1 }],
        price: 100,
        name: 'Server1 Listing 2',
        categoryIds: [testCategory.data.data.id],
      });

      // Create listings for gameserver2 with the same test category
      await this.client.shopListing.shopListingControllerCreate({
        gameServerId: gameserver2.id,
        items: [{ itemId: this.setupData.items[0].id, amount: 1 }],
        price: 100,
        name: 'Server2 Listing 1',
        categoryIds: [testCategory.data.data.id],
      });

      // Test 1: Get categories without gameServerId filter - should count all listings (3)
      const allCategories = await this.client.shopCategory.shopCategoryControllerGetAll();
      const testCategoryInAll = allCategories.data.data.find((c) => c.id === testCategory.data.data.id);
      expect(testCategoryInAll?.listingCount).to.equal(3);

      // Test 2: Get categories with gameserver1 filter - should count only server1 listings (2)
      const server1Categories = await this.client.axiosInstance.get(
        `/shop/category?gameServerId=${this.setupData.gameserver.id}`,
      );
      const testCategoryInServer1 = server1Categories.data.data.find((c: any) => c.id === testCategory.data.data.id);
      expect(testCategoryInServer1?.listingCount).to.equal(2);

      // Test 3: Get categories with gameserver2 filter - should count only server2 listings (1)
      const server2Categories = await this.client.axiosInstance.get(`/shop/category?gameServerId=${gameserver2.id}`);
      const testCategoryInServer2 = server2Categories.data.data.find((c: any) => c.id === testCategory.data.data.id);
      expect(testCategoryInServer2?.listingCount).to.equal(1);

      // Test 4: Test with search endpoint as well
      const searchResult = await this.client.shopCategory.shopCategoryControllerSearch({
        filters: { id: [testCategory.data.data.id] },
      });
      expect(searchResult.data.data[0].listingCount).to.equal(3);

      // Search endpoint with gameServerId uses filters
      const searchResultWithGameServer = await this.client.shopCategory.shopCategoryControllerSearch({
        filters: {
          id: [testCategory.data.data.id],
          gameServerId: [this.setupData.gameserver.id],
        },
      });
      expect(searchResultWithGameServer.data.data[0].listingCount).to.equal(2);

      // Test 5: Test getOne endpoint
      const singleCategoryNoFilter = await this.client.shopCategory.shopCategoryControllerGetOne(
        testCategory.data.data.id,
      );
      expect(singleCategoryNoFilter.data.data.listingCount).to.equal(3);

      const singleCategoryWithFilter = await this.client.axiosInstance.get(
        `/shop/category/${testCategory.data.data.id}?gameServerId=${this.setupData.gameserver.id}`,
      );
      expect(singleCategoryWithFilter.data.data.listingCount).to.equal(2);

      // Cleanup
      await mockserver2.shutdown();
    },
  }),

  // Test for hierarchical category counts with game-server filtering
  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: false,
    name: 'Parent category listing counts include children and respect game-server filter',
    setup: shopCategorySetup,
    test: async function () {
      // Create parent and child categories
      const parentCategory = await this.client.shopCategory.shopCategoryControllerCreate({
        name: `Parent Category ${Date.now()}`,
        emoji: '📦',
      });

      const childCategory = await this.client.shopCategory.shopCategoryControllerCreate({
        name: `Child Category ${Date.now()}`,
        emoji: '📦',
        parentId: parentCategory.data.data.id,
      });

      // Create another gameserver using getMockServer
      const gameServer2IdentityToken = randomUUID();
      if (!this.domainRegistrationToken) throw new Error('Domain registration token is not set. Invalid setup?');

      const mockserver2 = await this.createMockServer({
        mockserver: { registrationToken: this.domainRegistrationToken, identityToken: gameServer2IdentityToken },
      });

      // Find the created gameserver
      const gameServers = await this.client.gameserver.gameServerControllerSearch({
        filters: { identityToken: [gameServer2IdentityToken] },
      });
      const gameserver2 = gameServers.data.data.find((gs) => gs.identityToken === gameServer2IdentityToken);
      if (!gameserver2) {
        throw new Error('Game server 2 not found. Did something fail when registering?');
      }

      // Create listings for gameserver1
      // 1 listing in parent category
      await this.client.shopListing.shopListingControllerCreate({
        gameServerId: this.setupData.gameserver.id,
        items: [{ itemId: this.setupData.items[0].id, amount: 1 }],
        price: 100,
        name: 'Parent Category Listing',
        categoryIds: [parentCategory.data.data.id],
      });

      // 2 listings in child category
      await this.client.shopListing.shopListingControllerCreate({
        gameServerId: this.setupData.gameserver.id,
        items: [{ itemId: this.setupData.items[0].id, amount: 1 }],
        price: 100,
        name: 'Child Category Listing 1',
        categoryIds: [childCategory.data.data.id],
      });

      await this.client.shopListing.shopListingControllerCreate({
        gameServerId: this.setupData.gameserver.id,
        items: [{ itemId: this.setupData.items[0].id, amount: 1 }],
        price: 100,
        name: 'Child Category Listing 2',
        categoryIds: [childCategory.data.data.id],
      });

      // Create listings for gameserver2
      // 1 listing in child category
      await this.client.shopListing.shopListingControllerCreate({
        gameServerId: gameserver2.id,
        items: [{ itemId: this.setupData.items[0].id, amount: 1 }],
        price: 100,
        name: 'Server2 Child Listing',
        categoryIds: [childCategory.data.data.id],
      });

      // Test without filter - parent should count all (4 total: 1 parent + 3 child)
      const allCategories = await this.client.shopCategory.shopCategoryControllerGetAll();
      const parentInAll = allCategories.data.data.find((c) => c.id === parentCategory.data.data.id);
      const childInAll = allCategories.data.data.find((c) => c.id === childCategory.data.data.id);
      expect(parentInAll?.listingCount).to.equal(4);
      expect(childInAll?.listingCount).to.equal(3);

      // Test with gameserver1 filter - parent should count only server1 (3 total: 1 parent + 2 child)
      const server1Categories = await this.client.axiosInstance.get(
        `/shop/category?gameServerId=${this.setupData.gameserver.id}`,
      );
      const parentInServer1 = server1Categories.data.data.find((c: any) => c.id === parentCategory.data.data.id);
      const childInServer1 = server1Categories.data.data.find((c: any) => c.id === childCategory.data.data.id);
      expect(parentInServer1?.listingCount).to.equal(3);
      expect(childInServer1?.listingCount).to.equal(2);

      // Test with gameserver2 filter - parent should count only server2 (1 total: 0 parent + 1 child)
      const server2Categories = await this.client.axiosInstance.get(`/shop/category?gameServerId=${gameserver2.id}`);
      const parentInServer2 = server2Categories.data.data.find((c: any) => c.id === parentCategory.data.data.id);
      const childInServer2 = server2Categories.data.data.find((c: any) => c.id === childCategory.data.data.id);
      expect(parentInServer2?.listingCount).to.equal(1);
      expect(childInServer2?.listingCount).to.equal(1);

      // Cleanup
      await mockserver2.shutdown();
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
