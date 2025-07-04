import { IntegrationTest, expect, IShopSetup, shopSetup } from '@takaro/test';
import { ShopOrderOutputDTOStatusEnum, isAxiosError } from '@takaro/apiclient';
import { describe } from 'node:test';

const group = 'ShopOrderController - Race Condition';

const tests = [
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    name: 'Race condition protection: Multiple concurrent claim attempts only succeed once',
    setup: shopSetup,
    test: async function () {
      // Create a single order
      const order = await this.setupData.client1.shopOrder.shopOrderControllerCreate({
        listingId: this.setupData.listing100.id,
        amount: 1,
      });

      // Attempt to claim the same order concurrently multiple times
      const claimPromises = [];
      const numConcurrentAttempts = 10;

      for (let i = 0; i < numConcurrentAttempts; i++) {
        claimPromises.push(
          this.setupData.client1.shopOrder
            .shopOrderControllerClaim(order.data.data.id)
            .then((response) => {
              return { type: 'success' as const, response };
            })
            .catch((error) => {
              if (isAxiosError(error)) {
                // if no response
                if (!error.response) {
                  throw new Error(`Claim attempt ${i + 1} failed with no response`);
                }
              }
              return { type: 'error' as const, error };
            }),
        );
      }

      // Wait for all claim attempts to complete
      const results = await Promise.all(claimPromises);

      // Verify that exactly one claim succeeded
      const successfulClaims = results.filter((r) => r.type === 'success');
      const failedClaims = results.filter((r) => r.type === 'error');

      expect(successfulClaims).to.have.length(1);
      expect(successfulClaims[0].response.data.data.status).to.eq(ShopOrderOutputDTOStatusEnum.Completed);

      expect(failedClaims).to.have.length(numConcurrentAttempts - 1);

      // Most failed claims should have the correct error
      // Note: Some might fail with other errors due to timeouts or delivery issues
      const raceconditionErrors = failedClaims.filter((failed) => {
        if (isAxiosError(failed.error) && failed.error.response) {
          return (
            failed.error.response.data.meta.error.message ===
            'Can only claim paid, unclaimed orders. Current status: COMPLETED'
          );
        }
        return false;
      });

      // At least most of the failures should be due to the race condition
      expect(raceconditionErrors.length).to.be.greaterThanOrEqual(failedClaims.length - 2);

      // Verify the race condition errors have the correct format
      raceconditionErrors.forEach((failed) => {
        expect(failed.error.response.data.meta.error.code).to.eq('BadRequestError');
      });

      // Verify the order is indeed completed
      const finalOrder = await this.setupData.client1.shopOrder.shopOrderControllerGetOne(order.data.data.id);
      expect(finalOrder.data.data.status).to.eq(ShopOrderOutputDTOStatusEnum.Completed);

      return finalOrder;
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
