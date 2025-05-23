import { IntegrationTest, expect, IShopSetup, shopSetup } from '@takaro/test';
import { describe } from 'node:test';

const group = 'ShopController';

const tests = [
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: true,
    name: 'Get by ID',
    setup: shopSetup,
    filteredFields: ['itemId', 'gameServerId', 'gameserverId', 'listingId'],
    test: async function () {
      return this.client.shopListing.shopListingControllerGetOne(this.setupData.listing100.id);
    },
  }),
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: true,
    name: 'Create',
    setup: shopSetup,
    filteredFields: ['itemId', 'gameServerId', 'gameserverId', 'listingId'],
    test: async function () {
      const items = (await this.client.item.itemControllerSearch({ filters: { name: ['Stone'] } })).data.data;
      const res = await this.client.shopListing.shopListingControllerCreate({
        gameServerId: this.setupData.gameserver.id,
        items: [{ code: items[0].code, amount: 1 }],
        price: 150,
        name: 'Test item',
      });

      const findRes = await this.client.shopListing.shopListingControllerGetOne(res.data.data.id);
      expect(findRes.data.data.price).to.be.equal(150);

      return res;
    },
  }),
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: true,
    name: 'Update',
    setup: shopSetup,
    filteredFields: ['itemId', 'gameServerId', 'gameserverId', 'listingId'],
    test: async function () {
      const res = await this.client.shopListing.shopListingControllerUpdate(this.setupData.listing100.id, {
        price: 200,
        items: [{ code: this.setupData.items[1].code, amount: 5 }],
        gameServerId: this.setupData.gameserver.id,
        name: 'Updated item',
      });

      const findRes = await this.client.shopListing.shopListingControllerGetOne(this.setupData.listing100.id);
      expect(findRes.data.data.price).to.be.equal(200);
      expect(findRes.data.data.items[0].amount).to.be.equal(5);
      expect(findRes.data.data.name).to.be.equal('Updated item');
      expect(findRes.data.data.items[0].item.id).to.be.equal(this.setupData.items[1].id);

      return res;
    },
  }),
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: true,
    name: 'Delete',
    filteredFields: ['itemId', 'gameServerId', 'gameserverId', 'listingId'],
    setup: shopSetup,
    expectedStatus: 404,
    test: async function () {
      await this.client.shopListing.shopListingControllerDelete(this.setupData.listing100.id);
      return this.client.shopListing.shopListingControllerGetOne(this.setupData.listing100.id);
    },
  }),
  // Creating a listing with no item should fail
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: true,
    name: 'Create without item',
    setup: shopSetup,
    expectedStatus: 400,
    test: async function () {
      return this.client.shopListing.shopListingControllerCreate({
        gameServerId: this.setupData.gameserver.id,
        price: 150,
        name: 'Test item',
        items: [],
      });
    },
  }),
  // Price cannot be negative
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: true,
    name: 'Create with negative price',
    setup: shopSetup,
    expectedStatus: 400,
    test: async function () {
      return this.client.shopListing.shopListingControllerCreate({
        gameServerId: this.setupData.gameserver.id,
        items: [{ code: this.setupData.items[1].code, amount: 1 }],
        price: -100,
        name: 'Test item',
      });
    },
  }),
  // Price cannot be zero
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: true,
    name: 'Create with zero price',
    setup: shopSetup,
    expectedStatus: 400,
    test: async function () {
      return this.client.shopListing.shopListingControllerCreate({
        gameServerId: this.setupData.gameserver.id,
        items: [{ code: this.setupData.items[1].code, amount: 1 }],
        price: 0,
        name: 'Test item',
      });
    },
  }),
  // Should not include deleted listings in search
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    name: 'Search with deleted listing',
    setup: shopSetup,
    test: async function () {
      const beforeRes = await this.client.shopListing.shopListingControllerSearch({});
      await this.client.shopListing.shopListingControllerDelete(this.setupData.listing100.id);
      const res = await this.client.shopListing.shopListingControllerSearch({});
      expect(res.data.data.length).to.be.equal(beforeRes.data.data.length - 1);
      return res;
    },
  }),
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    name: 'import-export: Can export and import listings, replacing existing listings',
    setup: shopSetup,
    test: async function () {
      // First, create a few listings with dynamic data
      const items = (await this.client.item.itemControllerSearch()).data.data;
      const listingsToMake = 10;
      await Promise.all(
        Array.from({ length: listingsToMake }).map(async (_, i) => {
          return this.client.shopListing.shopListingControllerCreate({
            gameServerId: this.setupData.gameserver.id,
            items: [{ code: items[0].code, amount: 1 }],
            price: 100 + i,
            name: `Test item ${i}`,
          });
        }),
      );

      const shop1Listings = (
        await this.client.shopListing.shopListingControllerSearch({
          filters: { gameServerId: [this.setupData.gameserver.id] },
        })
      ).data.data;
      const shop2ListingsBefore = (
        await this.client.shopListing.shopListingControllerSearch({
          filters: { gameServerId: [this.setupData.gameserver2.id] },
        })
      ).data.data;
      // Export the listings
      const exportRes = await this.client.shopListing.shopListingControllerSearch();

      // Import the listings
      const formData = new FormData();
      formData.append('import', JSON.stringify(exportRes.data.data));
      formData.append(
        'options',
        JSON.stringify({
          replace: true,
          gameServerId: this.setupData.gameserver2.id,
        }),
      );

      // API client doesn't play nicely with file uploads, so we drop down to axios directly
      await this.client.axiosInstance.post('/shop/listing/import', formData);

      const shop2Listings = (
        await this.client.shopListing.shopListingControllerSearch({
          filters: { gameServerId: [this.setupData.gameserver2.id] },
        })
      ).data.data;
      expect(shop2Listings).to.have.length(shop1Listings.length);
      // Check createdAt and compare to before to ensure these are new listings
      expect(shop2ListingsBefore.every((l) => shop2Listings.some((l2) => l2.createdAt < l.createdAt))).to.be.true;
      // Ensure there are items in the listing
      expect(shop2Listings.every((l) => l.items.length > 0)).to.be.true;
    },
  }),
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    name: 'import-export: can export and import listings, adding to existing listings',
    setup: shopSetup,
    test: async function () {
      // First, create a few listings with dynamic data
      const items = (await this.client.item.itemControllerSearch()).data.data;
      const listingsToMake = 10;
      await Promise.all(
        Array.from({ length: listingsToMake }).map(async (_, i) => {
          return this.client.shopListing.shopListingControllerCreate({
            gameServerId: this.setupData.gameserver.id,
            items: [{ code: items[0].code, amount: 1 }],
            price: 100 + i,
            name: `Test item ${i}`,
          });
        }),
      );

      const shop1Listings = (
        await this.client.shopListing.shopListingControllerSearch({
          filters: { gameServerId: [this.setupData.gameserver.id] },
        })
      ).data.data;
      const shop2ListingsBefore = (
        await this.client.shopListing.shopListingControllerSearch({
          filters: { gameServerId: [this.setupData.gameserver2.id] },
        })
      ).data.data;
      // Export the listings
      const exportRes = await this.client.shopListing.shopListingControllerSearch();

      // Import the listings
      const formData = new FormData();
      formData.append('import', JSON.stringify(exportRes.data.data));
      formData.append(
        'options',
        JSON.stringify({
          replace: false,
          gameServerId: this.setupData.gameserver2.id,
        }),
      );

      // API client doesn't play nicely with file uploads, so we drop down to axios directly
      await this.client.axiosInstance.post('/shop/listing/import', formData);

      const shop2Listings = (
        await this.client.shopListing.shopListingControllerSearch({
          filters: { gameServerId: [this.setupData.gameserver2.id] },
        })
      ).data.data;
      expect(shop2Listings).to.have.length(shop1Listings.length + shop2ListingsBefore.length);
      // Ensure there are items in the listing
      expect(shop2Listings.every((l) => l.items.length > 0)).to.be.true;
    },
  }),
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    name: 'import-export: can export and import listings, importing as draft',
    setup: shopSetup,
    test: async function () {
      // First, create a few listings with dynamic data
      const items = (await this.client.item.itemControllerSearch()).data.data;
      const listingsToMake = 10;
      await Promise.all(
        Array.from({ length: listingsToMake }).map(async (_, i) => {
          return this.client.shopListing.shopListingControllerCreate({
            gameServerId: this.setupData.gameserver.id,
            items: [{ code: items[0].code, amount: 1 }],
            price: 100 + i,
            name: `Test item ${i}`,
          });
        }),
      );

      const shop1Listings = (
        await this.client.shopListing.shopListingControllerSearch({
          filters: { gameServerId: [this.setupData.gameserver.id] },
        })
      ).data.data;
      const shop2ListingsBefore = (
        await this.client.shopListing.shopListingControllerSearch({
          filters: { gameServerId: [this.setupData.gameserver2.id] },
        })
      ).data.data;
      // Export the listings
      const exportRes = await this.client.shopListing.shopListingControllerSearch();

      // Import the listings
      const formData = new FormData();
      formData.append('import', JSON.stringify(exportRes.data.data));
      formData.append(
        'options',
        JSON.stringify({
          replace: false,
          gameServerId: this.setupData.gameserver2.id,
          draft: true,
        }),
      );

      // API client doesn't play nicely with file uploads, so we drop down to axios directly
      await this.client.axiosInstance.post('/shop/listing/import', formData);

      const shop2Listings = (
        await this.client.shopListing.shopListingControllerSearch({
          filters: { gameServerId: [this.setupData.gameserver2.id] },
        })
      ).data.data;
      expect(shop2Listings).to.have.length(shop1Listings.length + shop2ListingsBefore.length);
      expect(shop2Listings.every((l) => l.draft)).to.be.true;
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
