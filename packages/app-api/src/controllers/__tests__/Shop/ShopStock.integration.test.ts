import { IntegrationTest, expect, IShopSetup, shopSetup } from '@takaro/test';
import { isAxiosError } from '@takaro/apiclient';
import { describe } from 'node:test';

const group = 'ShopStockController';

const tests = [
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    name: 'Can set stock for a listing',
    setup: shopSetup,
    test: async function () {
      const response = await this.client.shopListing.shopListingControllerUpdate(this.setupData.listing100.id, {
        stock: 10,
        stockEnabled: true,
      });

      expect(response.data.data.stock).to.equal(10);
      expect(response.data.data.stockEnabled).to.be.true;

      return response;
    },
  }),

  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    name: 'Cannot set negative stock',
    setup: shopSetup,
    test: async function () {
      try {
        await this.client.shopListing.shopListingControllerUpdate(this.setupData.listing100.id, {
          stock: -5,
          stockEnabled: true,
        });
        throw new Error('Should have thrown an error');
      } catch (error) {
        if (!isAxiosError(error)) throw error;
        expect(error.response?.status).to.equal(400);
        expect(error.response?.data.meta.error.code).to.equal('ValidationError');
      }
    },
  }),

  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    name: 'Regular users cannot manage stock',
    setup: shopSetup,
    test: async function () {
      await this.client.user.userControllerUpdate(this.setupData.user1.id, {
        isDashboardUser: true,
      });

      // Unassign the 'test role' to make sure the user has no permissions
      await this.client.player.playerControllerRemoveRole(this.setupData.players[0].id, this.setupData.role.id);

      try {
        await this.setupData.client1.shopListing.shopListingControllerUpdate(this.setupData.listing100.id, {
          stock: 10,
          stockEnabled: true,
        });
        throw new Error('Should have thrown an error');
      } catch (error) {
        if (!isAxiosError(error)) throw error;
        expect(error.response?.status).to.equal(403);
      }
    },
  }),

  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    name: 'Stock fields are included in listing output',
    setup: shopSetup,
    test: async function () {
      // Set stock
      await this.client.shopListing.shopListingControllerUpdate(this.setupData.listing100.id, {
        stock: 15,
        stockEnabled: true,
      });

      // Get listing
      const response = await this.client.shopListing.shopListingControllerGetOne(this.setupData.listing100.id);

      expect(response.data.data.stock).to.equal(15);
      expect(response.data.data.stockEnabled).to.be.true;

      return response;
    },
  }),

  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    name: 'Can create listing with initial stock',
    setup: shopSetup,
    test: async function () {
      const newListing = await this.client.shopListing.shopListingControllerCreate({
        gameServerId: this.setupData.gameserver.id,
        items: [{ itemId: this.setupData.items[0].id, amount: 1 }],
        price: 50,
        name: 'Limited Stock Item',
        stock: 20,
        stockEnabled: true,
      });

      expect(newListing.data.data.stock).to.equal(20);
      expect(newListing.data.data.stockEnabled).to.be.true;

      return newListing;
    },
  }),

  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    name: 'Can update listing stock through regular update',
    setup: shopSetup,
    test: async function () {
      const response = await this.client.shopListing.shopListingControllerUpdate(this.setupData.listing100.id, {
        stock: 25,
        stockEnabled: true,
      });

      expect(response.data.data.stock).to.equal(25);
      expect(response.data.data.stockEnabled).to.be.true;

      return response;
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
