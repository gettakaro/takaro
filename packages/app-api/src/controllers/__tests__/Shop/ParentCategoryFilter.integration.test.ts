import { IntegrationTest, expect, IShopCategorySetup, shopCategorySetup } from '@takaro/test';
import { describe } from 'node:test';

const group = 'Shop/ParentCategoryFilter';

const tests = [
  // Test filtering by parent category returns items from all child categories
  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: false,
    name: 'Filter by parent category returns items from all child categories',
    setup: shopCategorySetup,
    filteredFields: ['id', 'createdAt', 'updatedAt', 'domain', 'gameServerId', 'deletedAt', 'items', 'categories'],
    test: async function () {
      // Filter by Weapons parent category
      const weaponsParentId = this.setupData.rootCategories.weapons.id;

      const res = await this.client.shopListing.shopListingControllerSearch({
        filters: {
          categoryIds: [weaponsParentId],
          gameServerId: [this.setupData.gameserver.id],
        },
      });

      // Should return 3 items:
      // - Iron Sword (melee - child of weapons)
      // - Wooden Bow (ranged - child of weapons)
      // - Combat Gear Bundle (has melee - child of weapons)
      expect(res.data.data.length).to.equal(3);

      // Verify all returned listings are in weapon child categories
      const meleeId = this.setupData.childCategories.melee.id;
      const rangedId = this.setupData.childCategories.ranged.id;

      res.data.data.forEach((listing) => {
        const categoryIds = listing.categories?.map((cat) => cat.id) || [];
        const hasWeaponChildCategory = categoryIds.some((id) => id === meleeId || id === rangedId);
        expect(hasWeaponChildCategory).to.be.true;
      });

      return res;
    },
  }),

  // Test filtering by multiple parent categories
  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: false,
    name: 'Filter by multiple parent categories',
    setup: shopCategorySetup,
    filteredFields: ['id', 'createdAt', 'updatedAt', 'domain', 'gameServerId', 'deletedAt', 'items', 'categories'],
    test: async function () {
      // Filter by both Weapons and Armor parent categories
      const weaponsParentId = this.setupData.rootCategories.weapons.id;
      const armorParentId = this.setupData.rootCategories.armor.id;

      const res = await this.client.shopListing.shopListingControllerSearch({
        filters: {
          categoryIds: [weaponsParentId, armorParentId],
          gameServerId: [this.setupData.gameserver.id],
        },
      });

      // Should return 4 items:
      // - Iron Sword (melee - child of weapons)
      // - Wooden Bow (ranged - child of weapons)
      // - Iron Helmet (helmet - child of armor)
      // - Combat Gear Bundle (has both melee and helmet)
      expect(res.data.data.length).to.equal(4);

      // Verify all returned listings are in either weapon or armor child categories
      const meleeId = this.setupData.childCategories.melee.id;
      const rangedId = this.setupData.childCategories.ranged.id;
      const helmetId = this.setupData.childCategories.helmet.id;

      res.data.data.forEach((listing) => {
        const categoryIds = listing.categories?.map((cat) => cat.id) || [];
        const hasCorrectCategory = categoryIds.some((id) => id === meleeId || id === rangedId || id === helmetId);
        expect(hasCorrectCategory).to.be.true;
      });

      return res;
    },
  }),

  // Test mixing parent and child categories in filter
  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: false,
    name: 'Filter by mix of parent and child categories',
    setup: shopCategorySetup,
    filteredFields: ['id', 'createdAt', 'updatedAt', 'domain', 'gameServerId', 'deletedAt', 'items', 'categories'],
    test: async function () {
      // Filter by Weapons parent category AND helmet child category
      const weaponsParentId = this.setupData.rootCategories.weapons.id;
      const helmetId = this.setupData.childCategories.helmet.id;

      const res = await this.client.shopListing.shopListingControllerSearch({
        filters: {
          categoryIds: [weaponsParentId, helmetId],
          gameServerId: [this.setupData.gameserver.id],
        },
      });

      // Should return 4 items:
      // - Iron Sword (melee - child of weapons)
      // - Wooden Bow (ranged - child of weapons)
      // - Iron Helmet (helmet)
      // - Combat Gear Bundle (has both melee and helmet)
      expect(res.data.data.length).to.equal(4);

      // Verify all returned listings are in the correct categories
      const meleeId = this.setupData.childCategories.melee.id;
      const rangedId = this.setupData.childCategories.ranged.id;

      res.data.data.forEach((listing) => {
        const categoryIds = listing.categories?.map((cat) => cat.id) || [];
        const hasCorrectCategory = categoryIds.some((id) => id === meleeId || id === rangedId || id === helmetId);
        expect(hasCorrectCategory).to.be.true;
      });

      return res;
    },
  }),

  // Test parent category that has children but no direct listings
  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: false,
    name: 'Parent category includes only child listings',
    setup: shopCategorySetup,
    test: async function () {
      // Create a new parent category with no direct listings
      const emptyParent = await this.client.shopCategory.shopCategoryControllerCreate({
        name: 'Construction',
        emoji: '🏗️',
      });

      // Create a child category
      const buildingChild = await this.client.shopCategory.shopCategoryControllerCreate({
        name: 'Foundations',
        emoji: '🧱',
        parentId: emptyParent.data.data.id,
      });

      // Create a listing only in the child category
      await this.client.shopListing.shopListingControllerCreate({
        gameServerId: this.setupData.gameserver.id,
        items: [{ itemId: this.setupData.items[0].id, amount: 1 }],
        price: 100,
        name: 'Concrete Foundation',
        categoryIds: [buildingChild.data.data.id],
      });

      // Filter by the parent category
      const res = await this.client.shopListing.shopListingControllerSearch({
        filters: {
          categoryIds: [emptyParent.data.data.id],
          gameServerId: [this.setupData.gameserver.id],
        },
      });

      // Should return 1 item from the child category
      expect(res.data.data.length).to.equal(1);
      expect(res.data.data[0].name).to.equal('Concrete Foundation');
    },
  }),

  // Test with three-level hierarchy (grandchildren)
  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: false,
    name: 'Filter with three-level category hierarchy',
    setup: async function (this: IntegrationTest<IShopCategorySetup>) {
      // First run the standard setup
      const baseSetup = await shopCategorySetup.bind(this)();

      // Add a grandchild category under melee
      const grandchildCategory = await this.client.shopCategory.shopCategoryControllerCreate({
        name: 'Swords',
        emoji: '⚔️',
        parentId: baseSetup.childCategories.melee.id,
      });

      // Create a listing in the grandchild category
      const grandchildListing = await this.client.shopListing.shopListingControllerCreate({
        gameServerId: baseSetup.gameserver.id,
        items: [{ itemId: baseSetup.items[0].id, amount: 1 }],
        price: 300,
        name: 'Legendary Sword',
        categoryIds: [grandchildCategory.data.data.id],
      });

      return {
        ...baseSetup,
        grandchildCategory: grandchildCategory.data.data,
        grandchildListing: grandchildListing.data.data,
      };
    },
    test: async function () {
      // Filter by top-level Weapons category
      const weaponsParentId = this.setupData.rootCategories.weapons.id;

      const res = await this.client.shopListing.shopListingControllerSearch({
        filters: {
          categoryIds: [weaponsParentId],
          gameServerId: [this.setupData.gameserver.id],
        },
      });

      // Should return 4 items (3 original weapon items + 1 grandchild item):
      // - Iron Sword (melee)
      // - Wooden Bow (ranged)
      // - Combat Gear Bundle (has melee)
      // - Legendary Sword (grandchild of melee)
      expect(res.data.data.length).to.equal(4);

      // Verify the grandchild listing is included
      const listingNames = res.data.data.map((listing) => listing.name);
      expect(listingNames).to.include('Legendary Sword');
    },
  }),

  // Test performance with category that has no listings
  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: false,
    name: 'Parent category filter handles empty parent efficiently',
    setup: shopCategorySetup,
    test: async function () {
      // Create a new parent category with children but no listings
      const emptyParent = await this.client.shopCategory.shopCategoryControllerCreate({
        name: 'Empty Parent',
        emoji: '📦',
      });

      await this.client.shopCategory.shopCategoryControllerCreate({
        name: 'Empty Child 1',
        emoji: '📦',
        parentId: emptyParent.data.data.id,
      });

      await this.client.shopCategory.shopCategoryControllerCreate({
        name: 'Empty Child 2',
        emoji: '📦',
        parentId: emptyParent.data.data.id,
      });

      // Filter by the empty parent category
      const res = await this.client.shopListing.shopListingControllerSearch({
        filters: {
          categoryIds: [emptyParent.data.data.id],
          gameServerId: [this.setupData.gameserver.id],
        },
      });

      // Should return 0 items
      expect(res.data.data.length).to.equal(0);
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
