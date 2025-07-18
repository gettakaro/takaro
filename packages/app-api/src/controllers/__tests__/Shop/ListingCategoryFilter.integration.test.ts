import { IntegrationTest, expect, IShopCategorySetup, shopCategorySetup } from '@takaro/test';
import { describe } from 'node:test';

const group = 'Shop/ShopListingCategoryFilter';

const tests = [
  // Test filtering by category IDs
  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: false,
    name: 'Filter listings by category IDs',
    setup: shopCategorySetup,
    filteredFields: ['id', 'createdAt', 'updatedAt', 'domain', 'gameServerId', 'deletedAt', 'items', 'categories'],
    test: async function () {
      // Get child category IDs (since listings are assigned to child categories, not parent)
      const meleeId = this.setupData.childCategories.melee.id;
      const rangedId = this.setupData.childCategories.ranged.id;
      const helmetId = this.setupData.childCategories.helmet.id;

      // Search for listings in weapon and armor child categories
      const res = await this.client.shopListing.shopListingControllerSearch({
        filters: {
          categoryIds: [meleeId, rangedId, helmetId],
          gameServerId: [this.setupData.gameserver.id],
        },
      });

      // Should return 4 listings:
      // - Iron Sword (melee)
      // - Wooden Bow (ranged)
      // - Iron Helmet (helmet)
      // - Combat Gear Bundle (melee + helmet)
      expect(res.data.data.length).to.equal(4);

      // Verify all returned listings are in the requested categories
      res.data.data.forEach((listing) => {
        const categoryIds = listing.categories?.map((cat) => cat.id) || [];
        const hasRequestedCategory = categoryIds.some((id) => id === meleeId || id === rangedId || id === helmetId);
        expect(hasRequestedCategory).to.be.true;
      });

      return res;
    },
  }),

  // Test uncategorized filter
  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: false,
    name: 'Filter uncategorized listings',
    setup: shopCategorySetup,
    filteredFields: ['id', 'createdAt', 'updatedAt', 'domain', 'gameServerId', 'deletedAt', 'items', 'categories'],
    test: async function () {
      // Search for uncategorized listings
      const res = await this.client.shopListing.shopListingControllerSearch({
        filters: {
          uncategorized: true,
          gameServerId: [this.setupData.gameserver.id],
        },
      });

      // Should return only uncategorized listings
      // This includes the 2 from shopCategorySetup + 2 base listings from shopSetup (listing100 and listing33)
      expect(res.data.data.length).to.equal(4);

      // Verify all returned listings have no categories
      res.data.data.forEach((listing) => {
        expect(listing.categories).to.have.lengthOf(0);
      });

      return res;
    },
  }),

  // Test single category filter
  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: false,
    name: 'Filter listings by single category',
    setup: shopCategorySetup,
    filteredFields: ['id', 'createdAt', 'updatedAt', 'domain', 'gameServerId', 'deletedAt', 'items', 'categories'],
    test: async function () {
      // Test with both weapon child categories (melee and ranged)
      const meleeId = this.setupData.childCategories.melee.id;
      const rangedId = this.setupData.childCategories.ranged.id;

      const res = await this.client.shopListing.shopListingControllerSearch({
        filters: {
          categoryIds: [meleeId, rangedId],
          gameServerId: [this.setupData.gameserver.id],
        },
      });

      // Should return 3 listings:
      // - Iron Sword (melee)
      // - Wooden Bow (ranged)
      // - Combat Gear Bundle (has melee)
      expect(res.data.data.length).to.equal(3);

      // Verify all listings are in the requested categories
      res.data.data.forEach((listing) => {
        const categoryIds = listing.categories?.map((cat) => cat.id) || [];
        const hasRequestedCategory = categoryIds.includes(meleeId) || categoryIds.includes(rangedId);
        expect(hasRequestedCategory).to.be.true;
      });

      return res;
    },
  }),

  // Test child category filter
  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: false,
    name: 'Filter listings by child category',
    setup: shopCategorySetup,
    filteredFields: ['id', 'createdAt', 'updatedAt', 'domain', 'gameServerId', 'deletedAt', 'items', 'categories'],
    test: async function () {
      const meleeWeaponsCategoryId = this.setupData.childCategories.melee.id;

      const res = await this.client.shopListing.shopListingControllerSearch({
        filters: {
          categoryIds: [meleeWeaponsCategoryId],
          gameServerId: [this.setupData.gameserver.id],
        },
      });

      // Should return 2 melee weapon listings (Iron Sword + Combat Gear Bundle)
      expect(res.data.data.length).to.equal(2);

      // Verify all listings have the melee weapons category
      res.data.data.forEach((listing) => {
        const categoryIds = listing.categories?.map((cat) => cat.id) || [];
        expect(categoryIds).to.include(meleeWeaponsCategoryId);
      });

      return res;
    },
  }),

  // Test empty category filter
  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: false,
    name: 'Empty categoryIds array returns all listings',
    setup: shopCategorySetup,
    test: async function () {
      const res = await this.client.shopListing.shopListingControllerSearch({
        filters: {
          categoryIds: [],
          gameServerId: [this.setupData.gameserver.id],
        },
      });

      // Should return all listings when categoryIds is empty
      // This includes the 2 base listings from shopSetup (listing100 and listing33)
      const allListingsCount =
        this.setupData.categorizedListings.length + this.setupData.uncategorizedListings.length + 2;
      expect(res.data.data.length).to.equal(allListingsCount);
    },
  }),

  // Test non-existent category ID
  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: false,
    name: 'Non-existent category ID returns no listings',
    setup: shopCategorySetup,
    test: async function () {
      const res = await this.client.shopListing.shopListingControllerSearch({
        filters: {
          categoryIds: ['550e8400-e29b-41d4-a716-446655440000'],
          gameServerId: [this.setupData.gameserver.id],
        },
      });

      // Should return no listings for non-existent category
      expect(res.data.data.length).to.equal(0);
    },
  }),

  // Test category filter with price filter
  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: false,
    name: 'Category filter combined with price filter',
    setup: shopCategorySetup,
    filteredFields: ['id', 'createdAt', 'updatedAt', 'domain', 'gameServerId', 'deletedAt', 'items', 'categories'],
    test: async function () {
      const meleeId = this.setupData.childCategories.melee.id;

      // First get all melee weapons to find a price to filter by
      const allMelee = await this.client.shopListing.shopListingControllerSearch({
        filters: {
          categoryIds: [meleeId],
          gameServerId: [this.setupData.gameserver.id],
        },
      });

      // Use the price of the first melee weapon as our filter
      const targetPrice = allMelee.data.data[0].price;

      const res = await this.client.shopListing.shopListingControllerSearch({
        filters: {
          categoryIds: [meleeId],
          price: [targetPrice],
          gameServerId: [this.setupData.gameserver.id],
        },
      });

      // Should return only melee weapons with the specific price
      expect(res.data.data.length).to.be.greaterThan(0);
      res.data.data.forEach((listing) => {
        expect(listing.price).to.equal(targetPrice);
        const categoryIds = listing.categories?.map((cat) => cat.id) || [];
        expect(categoryIds).to.include(meleeId);
      });

      return res;
    },
  }),

  // Test category filter with name search
  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: false,
    name: 'Category filter combined with name search',
    setup: shopCategorySetup,
    test: async function () {
      const meleeId = this.setupData.childCategories.melee.id;

      // Search for melee weapons with "sword" in the name
      const res = await this.client.shopListing.shopListingControllerSearch({
        filters: {
          categoryIds: [meleeId],
          gameServerId: [this.setupData.gameserver.id],
        },
        search: {
          name: ['sword'],
        },
      });

      // Should find Iron Sword (has "sword" in name and is in melee category)
      expect(res.data.data.length).to.equal(1);
      res.data.data.forEach((listing) => {
        const categoryIds = listing.categories?.map((cat) => cat.id) || [];
        expect(categoryIds).to.include(meleeId);
        expect(listing.name?.toLowerCase()).to.include('sword');
      });
    },
  }),

  // Test both categoryIds and uncategorized set (should be mutually exclusive)
  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: false,
    name: 'CategoryIds and uncategorized filters are mutually exclusive',
    setup: shopCategorySetup,
    test: async function () {
      const meleeId = this.setupData.childCategories.melee.id;

      // When both categoryIds and uncategorized are set, they conflict and return no results
      const res = await this.client.shopListing.shopListingControllerSearch({
        filters: {
          categoryIds: [meleeId],
          uncategorized: true,
          gameServerId: [this.setupData.gameserver.id],
        },
      });

      // Should return 0 listings because the filters are mutually exclusive
      expect(res.data.data.length).to.equal(0);
    },
  }),

  // Test multiple child categories from different parents
  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: false,
    name: 'Filter by multiple child categories',
    setup: shopCategorySetup,
    filteredFields: ['id', 'createdAt', 'updatedAt', 'domain', 'gameServerId', 'deletedAt', 'items', 'categories'],
    test: async function () {
      const meleeWeaponsCategoryId = this.setupData.childCategories.melee.id;
      const helmetCategoryId = this.setupData.childCategories.helmet.id;

      const res = await this.client.shopListing.shopListingControllerSearch({
        filters: {
          categoryIds: [meleeWeaponsCategoryId, helmetCategoryId],
          gameServerId: [this.setupData.gameserver.id],
        },
      });

      // Should return listings from both child categories
      expect(res.data.data.length).to.equal(3); // 1 melee weapon + 1 helmet + 1 multi-category (has both)

      res.data.data.forEach((listing) => {
        const categoryIds = listing.categories?.map((cat) => cat.id) || [];
        const hasRequestedCategory = categoryIds.some((id) => id === meleeWeaponsCategoryId || id === helmetCategoryId);
        expect(hasRequestedCategory).to.be.true;
      });

      return res;
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
