import { IntegrationTest, expect, IShopCategorySetup, shopCategorySetup } from '@takaro/test';

const group = 'ShopListingCategoryFilter';

const tests = [
  // Test filtering by category IDs
  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: true,
    name: 'Filter listings by category IDs',
    setup: shopCategorySetup,
    filteredFields: ['id', 'createdAt', 'updatedAt', 'domain', 'gameServerId', 'deletedAt', 'items', 'categories'],
    test: async function () {
      // Get weapon and armor category IDs
      const weaponsCategoryId = this.setupData.rootCategories.weapons.id;
      const armorCategoryId = this.setupData.rootCategories.armor.id;

      // Search for listings in weapons and armor categories
      const res = await this.client.shopListing.shopListingControllerSearch({
        filters: {
          categoryIds: [weaponsCategoryId, armorCategoryId],
          gameServerId: [this.setupData.gameserver.id],
        },
      });

      // Should return 4 listings (2 weapons + 2 armor)
      expect(res.data.data.length).to.equal(4);

      // Verify all returned listings are in the requested categories
      res.data.data.forEach((listing) => {
        const categoryIds = listing.categories?.map((cat) => cat.id) || [];
        const hasRequestedCategory = categoryIds.some((id) => id === weaponsCategoryId || id === armorCategoryId);
        expect(hasRequestedCategory).to.be.true;
      });

      return res;
    },
  }),

  // Test uncategorized filter
  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: true,
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
      expect(res.data.data.length).to.equal(this.setupData.uncategorizedListings.length);

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
    snapshot: true,
    name: 'Filter listings by single category',
    setup: shopCategorySetup,
    filteredFields: ['id', 'createdAt', 'updatedAt', 'domain', 'gameServerId', 'deletedAt', 'items', 'categories'],
    test: async function () {
      const buildingCategoryId = this.setupData.rootCategories.building.id;

      const res = await this.client.shopListing.shopListingControllerSearch({
        filters: {
          categoryIds: [buildingCategoryId],
          gameServerId: [this.setupData.gameserver.id],
        },
      });

      // Should return 2 building listings
      expect(res.data.data.length).to.equal(2);

      // Verify all listings are in building category
      res.data.data.forEach((listing) => {
        const categoryIds = listing.categories?.map((cat) => cat.id) || [];
        expect(categoryIds).to.include(buildingCategoryId);
      });

      return res;
    },
  }),

  // Test child category filter
  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: true,
    name: 'Filter listings by child category',
    setup: shopCategorySetup,
    filteredFields: ['id', 'createdAt', 'updatedAt', 'domain', 'gameServerId', 'deletedAt', 'items', 'categories'],
    test: async function () {
      const meleeWeaponsCategoryId = this.setupData.childCategories.meleeWeapons.id;

      const res = await this.client.shopListing.shopListingControllerSearch({
        filters: {
          categoryIds: [meleeWeaponsCategoryId],
          gameServerId: [this.setupData.gameserver.id],
        },
      });

      // Should return 1 melee weapon listing
      expect(res.data.data.length).to.equal(1);

      // Verify the listing is in melee weapons category
      const listing = res.data.data[0];
      const categoryIds = listing.categories?.map((cat) => cat.id) || [];
      expect(categoryIds).to.include(meleeWeaponsCategoryId);

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
      const allListingsCount = this.setupData.categorizedListings.length + this.setupData.uncategorizedListings.length;
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
          categoryIds: ['00000000-0000-0000-0000-000000000000'],
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
    snapshot: true,
    name: 'Category filter combined with price filter',
    setup: shopCategorySetup,
    filteredFields: ['id', 'createdAt', 'updatedAt', 'domain', 'gameServerId', 'deletedAt', 'items', 'categories'],
    test: async function () {
      const weaponsCategoryId = this.setupData.rootCategories.weapons.id;

      // First get all weapons to find a price to filter by
      const allWeapons = await this.client.shopListing.shopListingControllerSearch({
        filters: {
          categoryIds: [weaponsCategoryId],
          gameServerId: [this.setupData.gameserver.id],
        },
      });

      // Use the price of the first weapon as our filter
      const targetPrice = allWeapons.data.data[0].price;

      const res = await this.client.shopListing.shopListingControllerSearch({
        filters: {
          categoryIds: [weaponsCategoryId],
          price: [targetPrice],
          gameServerId: [this.setupData.gameserver.id],
        },
      });

      // Should return only weapons with the specific price
      expect(res.data.data.length).to.be.greaterThan(0);
      res.data.data.forEach((listing) => {
        expect(listing.price).to.equal(targetPrice);
        const categoryIds = listing.categories?.map((cat) => cat.id) || [];
        expect(categoryIds).to.include(weaponsCategoryId);
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
      const weaponsCategoryId = this.setupData.rootCategories.weapons.id;

      // Search for weapons with "sword" in the name
      const res = await this.client.shopListing.shopListingControllerSearch({
        filters: {
          categoryIds: [weaponsCategoryId],
          gameServerId: [this.setupData.gameserver.id],
        },
        search: {
          name: ['sword'],
        },
      });

      // Verify results are filtered by both category and name
      res.data.data.forEach((listing) => {
        const categoryIds = listing.categories?.map((cat) => cat.id) || [];
        expect(categoryIds).to.include(weaponsCategoryId);
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
      const weaponsCategoryId = this.setupData.rootCategories.weapons.id;

      // When both are set, categoryIds should take precedence
      const res = await this.client.shopListing.shopListingControllerSearch({
        filters: {
          categoryIds: [weaponsCategoryId],
          uncategorized: true,
          gameServerId: [this.setupData.gameserver.id],
        },
      });

      // Should return weapons (categoryIds takes precedence)
      expect(res.data.data.length).to.be.greaterThan(0);
      res.data.data.forEach((listing) => {
        const categoryIds = listing.categories?.map((cat) => cat.id) || [];
        expect(categoryIds).to.include(weaponsCategoryId);
      });
    },
  }),

  // Test multiple child categories from different parents
  new IntegrationTest<IShopCategorySetup>({
    group,
    snapshot: true,
    name: 'Filter by multiple child categories',
    setup: shopCategorySetup,
    filteredFields: ['id', 'createdAt', 'updatedAt', 'domain', 'gameServerId', 'deletedAt', 'items', 'categories'],
    test: async function () {
      const meleeWeaponsCategoryId = this.setupData.childCategories.meleeWeapons.id;
      const heavyArmorCategoryId = this.setupData.childCategories.heavyArmor.id;

      const res = await this.client.shopListing.shopListingControllerSearch({
        filters: {
          categoryIds: [meleeWeaponsCategoryId, heavyArmorCategoryId],
          gameServerId: [this.setupData.gameserver.id],
        },
      });

      // Should return listings from both child categories
      expect(res.data.data.length).to.equal(2); // 1 melee weapon + 1 heavy armor

      res.data.data.forEach((listing) => {
        const categoryIds = listing.categories?.map((cat) => cat.id) || [];
        const hasRequestedCategory = categoryIds.some(
          (id) => id === meleeWeaponsCategoryId || id === heavyArmorCategoryId,
        );
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
