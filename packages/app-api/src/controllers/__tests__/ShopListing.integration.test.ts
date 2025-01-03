import { IntegrationTest, expect, SetupGameServerPlayers } from '@takaro/test';
import { ItemsOutputDTO, ShopListingOutputDTO } from '@takaro/apiclient';

const group = 'ShopController';

interface IShopSetup extends SetupGameServerPlayers.ISetupData {
  items: ItemsOutputDTO[];
  listing: ShopListingOutputDTO;
}

const shopSetup = async function (this: IntegrationTest<IShopSetup>): Promise<IShopSetup> {
  const setupData = await SetupGameServerPlayers.setup.bind(
    this as unknown as IntegrationTest<SetupGameServerPlayers.ISetupData>,
  )();

  await this.client.settings.settingsControllerSet('economyEnabled', {
    value: 'true',
    gameServerId: setupData.gameServer1.id,
  });

  await this.client.settings.settingsControllerSet('currencyName', {
    gameServerId: setupData.gameServer1.id,
    value: 'test coin',
  });

  const items = (
    await this.client.item.itemControllerSearch({
      sortBy: 'name',
      filters: { gameserverId: [setupData.gameServer1.id] },
    })
  ).data.data;

  const listingRes = await this.client.shopListing.shopListingControllerCreate({
    gameServerId: setupData.gameServer1.id,
    items: [{ code: items[0].code, amount: 1 }],
    price: 100,
    name: 'Test item',
  });

  return {
    ...setupData,
    items,
    listing: listingRes.data.data,
  };
};

const tests = [
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: true,
    name: 'Get by ID',
    setup: shopSetup,
    filteredFields: ['itemId', 'gameServerId', 'gameserverId', 'listingId'],
    test: async function () {
      return this.client.shopListing.shopListingControllerGetOne(this.setupData.listing.id);
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
        gameServerId: this.setupData.gameServer1.id,
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
      const res = await this.client.shopListing.shopListingControllerUpdate(this.setupData.listing.id, {
        price: 200,
        items: [{ code: this.setupData.items[1].code, amount: 5 }],
        gameServerId: this.setupData.gameServer1.id,
        name: 'Updated item',
      });

      const findRes = await this.client.shopListing.shopListingControllerGetOne(res.data.data.id);
      expect(findRes.data.data.price).to.be.equal(200);
      expect(findRes.data.data.items[0].item.id).to.be.equal(this.setupData.items[1].id);
      expect(findRes.data.data.items[0].amount).to.be.equal(5);
      expect(findRes.data.data.name).to.be.equal('Updated item');

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
      await this.client.shopListing.shopListingControllerDelete(this.setupData.listing.id);
      return this.client.shopListing.shopListingControllerGetOne(this.setupData.listing.id);
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
        gameServerId: this.setupData.gameServer1.id,
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
        gameServerId: this.setupData.gameServer1.id,
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
        gameServerId: this.setupData.gameServer1.id,
        items: [{ code: this.setupData.items[1].code, amount: 1 }],
        price: 0,
        name: 'Test item',
      });
    },
  }),
  // Should not include deleted listings in search
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: true,
    name: 'Search with deleted listing',
    setup: shopSetup,
    test: async function () {
      await this.client.shopListing.shopListingControllerDelete(this.setupData.listing.id);
      const res = await this.client.shopListing.shopListingControllerSearch({});
      expect(res.data.data.length).to.be.equal(0);
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
            gameServerId: this.setupData.gameServer1.id,
            items: [{ code: items[0].code, amount: 1 }],
            price: 100 + i,
            name: `Test item ${i}`,
          });
        }),
      );

      const shop1Listings = (
        await this.client.shopListing.shopListingControllerSearch({
          filters: { gameServerId: [this.setupData.gameServer1.id] },
        })
      ).data.data;
      const shop2ListingsBefore = (
        await this.client.shopListing.shopListingControllerSearch({
          filters: { gameServerId: [this.setupData.gameServer2.id] },
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
          gameServerId: this.setupData.gameServer2.id,
        }),
      );

      // API client doesn't play nicely with file uploads, so we drop down to axios directly
      await this.client.axiosInstance.post('/shop/listing/import', formData);

      const shop2Listings = (
        await this.client.shopListing.shopListingControllerSearch({
          filters: { gameServerId: [this.setupData.gameServer2.id] },
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
            gameServerId: this.setupData.gameServer1.id,
            items: [{ code: items[0].code, amount: 1 }],
            price: 100 + i,
            name: `Test item ${i}`,
          });
        }),
      );

      const shop1Listings = (
        await this.client.shopListing.shopListingControllerSearch({
          filters: { gameServerId: [this.setupData.gameServer1.id] },
        })
      ).data.data;
      const shop2ListingsBefore = (
        await this.client.shopListing.shopListingControllerSearch({
          filters: { gameServerId: [this.setupData.gameServer2.id] },
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
          gameServerId: this.setupData.gameServer2.id,
        }),
      );

      // API client doesn't play nicely with file uploads, so we drop down to axios directly
      await this.client.axiosInstance.post('/shop/listing/import', formData);

      const shop2Listings = (
        await this.client.shopListing.shopListingControllerSearch({
          filters: { gameServerId: [this.setupData.gameServer2.id] },
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
            gameServerId: this.setupData.gameServer1.id,
            items: [{ code: items[0].code, amount: 1 }],
            price: 100 + i,
            name: `Test item ${i}`,
          });
        }),
      );

      const shop1Listings = (
        await this.client.shopListing.shopListingControllerSearch({
          filters: { gameServerId: [this.setupData.gameServer1.id] },
        })
      ).data.data;
      const shop2ListingsBefore = (
        await this.client.shopListing.shopListingControllerSearch({
          filters: { gameServerId: [this.setupData.gameServer2.id] },
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
          gameServerId: this.setupData.gameServer2.id,
          draft: true,
        }),
      );

      // API client doesn't play nicely with file uploads, so we drop down to axios directly
      await this.client.axiosInstance.post('/shop/listing/import', formData);

      const shop2Listings = (
        await this.client.shopListing.shopListingControllerSearch({
          filters: { gameServerId: [this.setupData.gameServer2.id] },
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
