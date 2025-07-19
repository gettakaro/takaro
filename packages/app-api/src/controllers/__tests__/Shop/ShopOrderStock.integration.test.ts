import { IntegrationTest, expect, IShopSetup, shopSetup } from '@takaro/test';
import { ShopOrderOutputDTOStatusEnum, isAxiosError } from '@takaro/apiclient';
import { describe } from 'node:test';

const group = 'ShopOrderController - Stock';

async function shopSetupWithExtraCurrency(this: IntegrationTest<IShopSetup>): Promise<IShopSetup> {
  const setupData = await shopSetup.bind(this)();

  // Add extra currency for stock tests
  await this.client.playerOnGameserver.playerOnGameServerControllerAddCurrency(
    setupData.gameserver.id,
    setupData.players[0].id,
    { currency: 100000 },
  );

  await this.client.playerOnGameserver.playerOnGameServerControllerAddCurrency(
    setupData.gameserver.id,
    setupData.players[1].id,
    { currency: 100000 },
  );

  return setupData;
}

const tests = [
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    name: 'Can purchase item with sufficient stock',
    setup: shopSetupWithExtraCurrency,
    test: async function () {
      // Set stock
      await this.client.shopListing.shopListingControllerUpdate(this.setupData.listing100.id, {
        stock: 10,
        stockEnabled: true,
      });

      // Create order
      const order = await this.setupData.client1.shopOrder.shopOrderControllerCreate({
        listingId: this.setupData.listing100.id,
        amount: 3,
      });

      expect(order.data.data.status).to.equal(ShopOrderOutputDTOStatusEnum.Paid);

      // Check stock was decremented
      const listing = await this.client.shopListing.shopListingControllerGetOne(this.setupData.listing100.id);
      expect(listing.data.data.stock).to.equal(7);

      return order;
    },
  }),

  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    name: 'Cannot purchase more than available stock',
    setup: shopSetupWithExtraCurrency,
    test: async function () {
      // Set limited stock
      await this.client.shopListing.shopListingControllerUpdate(this.setupData.listing100.id, {
        stock: 2,
        stockEnabled: true,
      });

      // Try to order more than available
      try {
        await this.setupData.client1.shopOrder.shopOrderControllerCreate({
          listingId: this.setupData.listing100.id,
          amount: 5,
        });
        throw new Error('Should have thrown an error');
      } catch (error) {
        if (!isAxiosError(error)) throw error;
        expect(error.response?.status).to.equal(400);
        expect(error.response?.data.meta.error.message).to.include('Insufficient stock');
      }
    },
  }),

  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    name: 'Cannot purchase from out of stock listing',
    setup: shopSetupWithExtraCurrency,
    test: async function () {
      // Set stock to 0
      await this.client.shopListing.shopListingControllerUpdate(this.setupData.listing100.id, {
        stock: 0,
        stockEnabled: true,
      });

      // Try to order
      try {
        await this.setupData.client1.shopOrder.shopOrderControllerCreate({
          listingId: this.setupData.listing100.id,
          amount: 1,
        });
        throw new Error('Should have thrown an error');
      } catch (error) {
        if (!isAxiosError(error)) throw error;
        expect(error.response?.status).to.equal(400);
        expect(error.response?.data.meta.error.message).to.include('Insufficient stock');
      }
    },
  }),

  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    name: 'Can purchase from unlimited stock listing',
    setup: shopSetupWithExtraCurrency,
    test: async function () {
      // Listing should have unlimited stock by default
      const order = await this.setupData.client1.shopOrder.shopOrderControllerCreate({
        listingId: this.setupData.listing100.id,
        amount: 999,
      });

      expect(order.data.data.status).to.equal(ShopOrderOutputDTOStatusEnum.Paid);

      // Check stock wasn't changed
      const listing = await this.client.shopListing.shopListingControllerGetOne(this.setupData.listing100.id);
      expect(listing.data.data.stockEnabled).to.be.false;

      return order;
    },
  }),

  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    name: 'Stock is restored when order is cancelled',
    setup: shopSetupWithExtraCurrency,
    test: async function () {
      // Set stock
      await this.client.shopListing.shopListingControllerUpdate(this.setupData.listing100.id, {
        stock: 10,
        stockEnabled: true,
      });

      // Create order
      const order = await this.setupData.client1.shopOrder.shopOrderControllerCreate({
        listingId: this.setupData.listing100.id,
        amount: 3,
      });

      // Check stock was decremented
      let listing = await this.client.shopListing.shopListingControllerGetOne(this.setupData.listing100.id);
      expect(listing.data.data.stock).to.equal(7);

      // Cancel order
      const cancelledOrder = await this.setupData.client1.shopOrder.shopOrderControllerCancel(order.data.data.id);
      expect(cancelledOrder.data.data.status).to.equal(ShopOrderOutputDTOStatusEnum.Canceled);

      // Check stock was restored
      listing = await this.client.shopListing.shopListingControllerGetOne(this.setupData.listing100.id);
      expect(listing.data.data.stock).to.equal(10);

      return cancelledOrder;
    },
  }),

  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    name: 'Multiple purchases correctly decrement stock',
    setup: shopSetupWithExtraCurrency,
    test: async function () {
      // Set stock
      await this.client.shopListing.shopListingControllerUpdate(this.setupData.listing100.id, {
        stock: 20,
        stockEnabled: true,
      });

      // Create multiple orders
      await this.setupData.client1.shopOrder.shopOrderControllerCreate({
        listingId: this.setupData.listing100.id,
        amount: 5,
      });

      await this.setupData.client2.shopOrder.shopOrderControllerCreate({
        listingId: this.setupData.listing100.id,
        amount: 3,
      });

      await this.setupData.client1.shopOrder.shopOrderControllerCreate({
        listingId: this.setupData.listing100.id,
        amount: 2,
      });

      // Check final stock
      const listing = await this.client.shopListing.shopListingControllerGetOne(this.setupData.listing100.id);
      expect(listing.data.data.stock).to.equal(10); // 20 - 5 - 3 - 2

      return listing;
    },
  }),

  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    name: 'Cannot claim order after stock is restored from cancellation',
    setup: shopSetupWithExtraCurrency,
    test: async function () {
      // Set stock
      await this.client.shopListing.shopListingControllerUpdate(this.setupData.listing100.id, {
        stock: 5,
        stockEnabled: true,
      });

      // Create order
      const order = await this.setupData.client1.shopOrder.shopOrderControllerCreate({
        listingId: this.setupData.listing100.id,
        amount: 3,
      });

      // Cancel order
      await this.setupData.client1.shopOrder.shopOrderControllerCancel(order.data.data.id);

      // Try to claim cancelled order
      try {
        await this.setupData.client1.shopOrder.shopOrderControllerClaim(order.data.data.id);
        throw new Error('Should have thrown an error');
      } catch (error) {
        if (!isAxiosError(error)) throw error;
        expect(error.response?.status).to.equal(400);
        expect(error.response?.data.meta.error.message).to.include('Can only claim paid');
      }
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
