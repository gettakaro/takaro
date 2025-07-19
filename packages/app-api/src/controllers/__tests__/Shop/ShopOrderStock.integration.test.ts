import { IntegrationTest, expect, IShopSetup, shopSetup } from '@takaro/test';
import { ShopOrderOutputDTOStatusEnum, StockUpdateDTO, isAxiosError } from '@takaro/apiclient';

const group = 'ShopOrderController - Stock';

const tests = [
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    name: 'Can purchase item with sufficient stock',
    setup: shopSetup,
    test: async function () {
      // Set stock
      await this.client.shopListing.shopListingControllerSetStock(
        this.setupData.listing100.id,
        new StockUpdateDTO({ stock: 10 })
      );

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
    setup: shopSetup,
    test: async function () {
      // Set limited stock
      await this.client.shopListing.shopListingControllerSetStock(
        this.setupData.listing100.id,
        new StockUpdateDTO({ stock: 2 })
      );

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
    setup: shopSetup,
    test: async function () {
      // Set stock to 0
      await this.client.shopListing.shopListingControllerSetStock(
        this.setupData.listing100.id,
        new StockUpdateDTO({ stock: 0 })
      );

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
    setup: shopSetup,
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
      expect(listing.data.data.isUnlimitedStock).to.be.true;

      return order;
    },
  }),

  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    name: 'Stock is restored when order is cancelled',
    setup: shopSetup,
    test: async function () {
      // Set stock
      await this.client.shopListing.shopListingControllerSetStock(
        this.setupData.listing100.id,
        new StockUpdateDTO({ stock: 10 })
      );

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
    setup: shopSetup,
    test: async function () {
      // Set stock
      await this.client.shopListing.shopListingControllerSetStock(
        this.setupData.listing100.id,
        new StockUpdateDTO({ stock: 20 })
      );

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
    setup: shopSetup,
    test: async function () {
      // Set stock
      await this.client.shopListing.shopListingControllerSetStock(
        this.setupData.listing100.id,
        new StockUpdateDTO({ stock: 5 })
      );

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