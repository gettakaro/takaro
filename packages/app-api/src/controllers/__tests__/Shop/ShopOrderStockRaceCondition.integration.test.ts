import { IntegrationTest, expect, IShopSetup, shopSetup } from '@takaro/test';
import { ShopOrderOutputDTOStatusEnum, isAxiosError } from '@takaro/apiclient';

const group = 'ShopOrderController - Stock Race Conditions';

const tests = [
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    name: 'Race condition protection: Multiple concurrent purchases of last item only succeed once',
    setup: shopSetup,
    test: async function () {
      // Set stock to 1
      await this.client.shopListing.shopListingControllerSetStock(
        this.setupData.listing100.id,
        { stock: 1 }
      );

      // Attempt to purchase the same item concurrently multiple times
      const purchasePromises = [];
      const numConcurrentAttempts = 10;

      for (let i = 0; i < numConcurrentAttempts; i++) {
        purchasePromises.push(
          this.setupData.client1.shopOrder
            .shopOrderControllerCreate({
              listingId: this.setupData.listing100.id,
              amount: 1,
            })
            .then((response) => {
              return { type: 'success' as const, response };
            })
            .catch((error) => {
              return { type: 'error' as const, error };
            }),
        );
      }

      // Wait for all purchase attempts to complete
      const results = await Promise.all(purchasePromises);

      // Verify that exactly one purchase succeeded
      const successfulPurchases = results.filter((r) => r.type === 'success');
      const failedPurchases = results.filter((r) => r.type === 'error');

      expect(successfulPurchases).to.have.length(1);
      expect(successfulPurchases[0].response.data.data.status).to.eq(ShopOrderOutputDTOStatusEnum.Paid);

      expect(failedPurchases).to.have.length(numConcurrentAttempts - 1);

      // Verify all failures are due to insufficient stock
      failedPurchases.forEach((failed) => {
        if (isAxiosError(failed.error) && failed.error.response) {
          expect(failed.error.response.data.meta.error.message).to.include('Insufficient stock');
        }
      });

      // Verify the stock is now 0
      const listing = await this.client.shopListing.shopListingControllerGetOne(this.setupData.listing100.id);
      expect(listing.data.data.stock).to.equal(0);

      return listing;
    },
  }),

  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    name: 'Race condition protection: Multiple concurrent purchases with limited stock',
    setup: shopSetup,
    test: async function () {
      // Set stock to 5
      await this.client.shopListing.shopListingControllerSetStock(
        this.setupData.listing100.id,
        { stock: 5 }
      );

      // Attempt to purchase 2 items each, 5 times concurrently (total demand: 10, available: 5)
      const purchasePromises = [];
      const numConcurrentAttempts = 5;
      const amountPerPurchase = 2;

      for (let i = 0; i < numConcurrentAttempts; i++) {
        purchasePromises.push(
          this.setupData.client1.shopOrder
            .shopOrderControllerCreate({
              listingId: this.setupData.listing100.id,
              amount: amountPerPurchase,
            })
            .then((response) => {
              return { type: 'success' as const, response };
            })
            .catch((error) => {
              return { type: 'error' as const, error };
            }),
        );
      }

      const results = await Promise.all(purchasePromises);

      const successfulPurchases = results.filter((r) => r.type === 'success');
      const failedPurchases = results.filter((r) => r.type === 'error');

      // At most 2 purchases should succeed (2 * 2 = 4, which is less than 5)
      expect(successfulPurchases.length).to.be.at.most(2);
      expect(failedPurchases.length).to.be.at.least(3);

      // Verify the final stock
      const listing = await this.client.shopListing.shopListingControllerGetOne(this.setupData.listing100.id);
      const totalPurchased = successfulPurchases.length * amountPerPurchase;
      expect(listing.data.data.stock).to.equal(5 - totalPurchased);

      return listing;
    },
  }),

  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    name: 'Race condition protection: Concurrent purchases from different users',
    setup: shopSetup,
    test: async function () {
      // Set stock to 3
      await this.client.shopListing.shopListingControllerSetStock(
        this.setupData.listing100.id,
        { stock: 3 }
      );

      // Three different users try to purchase 2 items each
      const purchasePromises = [
        this.setupData.client1.shopOrder
          .shopOrderControllerCreate({
            listingId: this.setupData.listing100.id,
            amount: 2,
          })
          .then((response) => ({ type: 'success' as const, user: 'client1', response }))
          .catch((error) => ({ type: 'error' as const, user: 'client1', error })),
        
        this.setupData.client2.shopOrder
          .shopOrderControllerCreate({
            listingId: this.setupData.listing100.id,
            amount: 2,
          })
          .then((response) => ({ type: 'success' as const, user: 'client2', response }))
          .catch((error) => ({ type: 'error' as const, user: 'client2', error })),
        
        this.setupData.client1.shopOrder
          .shopOrderControllerCreate({
            listingId: this.setupData.listing100.id,
            amount: 2,
          })
          .then((response) => ({ type: 'success' as const, user: 'client1-2', response }))
          .catch((error) => ({ type: 'error' as const, user: 'client1-2', error })),
      ];

      const results = await Promise.all(purchasePromises);

      const successfulPurchases = results.filter((r) => r.type === 'success');
      const failedPurchases = results.filter((r) => r.type === 'error');

      // Only one purchase should succeed
      expect(successfulPurchases).to.have.length(1);
      expect(failedPurchases).to.have.length(2);

      // Verify the stock
      const listing = await this.client.shopListing.shopListingControllerGetOne(this.setupData.listing100.id);
      expect(listing.data.data.stock).to.equal(1); // 3 - 2 = 1

      return { results, listing };
    },
  }),

  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    name: 'No race condition issues with unlimited stock',
    setup: shopSetup,
    test: async function () {
      // Don't set stock - listing should have unlimited stock by default

      // Attempt many concurrent purchases
      const purchasePromises = [];
      const numConcurrentAttempts = 20;

      for (let i = 0; i < numConcurrentAttempts; i++) {
        purchasePromises.push(
          this.setupData.client1.shopOrder.shopOrderControllerCreate({
            listingId: this.setupData.listing100.id,
            amount: 10,
          }),
        );
      }

      const results = await Promise.all(purchasePromises);

      // All purchases should succeed
      results.forEach((result) => {
        expect(result.data.data.status).to.eq(ShopOrderOutputDTOStatusEnum.Paid);
      });

      // Verify stock is still unlimited
      const listing = await this.client.shopListing.shopListingControllerGetOne(this.setupData.listing100.id);
      expect(listing.data.data.stockEnabled).to.be.false;

      return listing;
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});