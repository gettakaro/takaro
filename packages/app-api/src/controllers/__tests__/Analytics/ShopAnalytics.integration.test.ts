import { IntegrationTest, expect, IShopSetup, shopSetup } from '@takaro/test';
import { ShopOrderOutputDTOStatusEnum, isAxiosError, Client } from '@takaro/apiclient';
import { Redis } from '@takaro/db';
import { DateTime } from 'luxon';
import { describe } from 'node:test';

const group = 'Analytics/ShopAnalyticsController';

interface IAnalyticsTestSetup extends IShopSetup {
  client1WithPermissions: Client;
  client2WithoutPermissions: Client;
}

const analyticsSetup = async function (this: IntegrationTest<IAnalyticsTestSetup>): Promise<IAnalyticsTestSetup> {
  // First run the shop setup to create listings and initial data
  const shopData = (await shopSetup.call(this as any)) as IShopSetup;

  // Create a client with MANAGE_SHOP_LISTINGS permission (already has it from shopSetup)
  const client1WithPermissions = this.client;

  // Create a client without the required permission
  await this.client.user.userControllerCreate({
    name: 'nopermission',
    email: 'nopermission@test.com',
    password: 'testPassword123!',
  });

  const client2WithoutPermissions = new Client({
    auth: {
      username: 'nopermission@test.com',
      password: 'testPassword123!',
    },
    url: (this.client as any).baseURL || (this.client as any).defaults?.baseURL || 'http://127.0.0.1:13000',
  });
  await client2WithoutPermissions.login();

  // Add more currency to test players to allow creating multiple orders
  await this.client.playerOnGameserver.playerOnGameServerControllerAddCurrency(
    shopData.gameserver.id,
    shopData.players[0].id,
    { currency: 1000 },
  );

  await this.client.playerOnGameserver.playerOnGameServerControllerAddCurrency(
    shopData.gameserver.id,
    shopData.players[1].id,
    { currency: 1000 },
  );

  // Create multiple orders across different time periods for testing

  // Create orders from today (reduced from 5 to 3 for faster tests)
  for (let i = 0; i < 3; i++) {
    await shopData.client1.shopOrder.shopOrderControllerCreate({
      listingId: shopData.listing100.id,
      amount: 1,
    });
  }

  // Create orders from another listing
  for (let i = 0; i < 3; i++) {
    await shopData.client2.shopOrder.shopOrderControllerCreate({
      listingId: shopData.listing33.id,
      amount: 2,
    });
  }

  // Create some canceled orders for status distribution testing
  const canceledOrder = await shopData.client1.shopOrder.shopOrderControllerCreate({
    listingId: shopData.listing100.id,
    amount: 1,
  });

  await shopData.client1.shopOrder.shopOrderControllerCancel(canceledOrder.data.data.id);

  return {
    ...shopData,
    client1WithPermissions,
    client2WithoutPermissions,
  };
};

const tests = [
  new IntegrationTest<IAnalyticsTestSetup>({
    group,
    snapshot: false,
    name: 'Get shop analytics with default parameters',
    setup: analyticsSetup,
    test: async function () {
      const res = await this.client.analytics.analyticsControllerGetShopAnalytics();

      expect(res.data.data).to.have.property('kpis');
      expect(res.data.data).to.have.property('revenue');
      expect(res.data.data).to.have.property('products');
      expect(res.data.data).to.have.property('orders');
      expect(res.data.data).to.have.property('customers');
      expect(res.data.data).to.have.property('insights');

      // Check KPIs structure
      expect(res.data.data.kpis).to.have.property('totalRevenue');
      expect(res.data.data.kpis.totalRevenue).to.be.greaterThanOrEqual(0);

      // Check that we have orders
      expect(res.data.data.orders).to.have.property('statusBreakdown');
      expect(res.data.data.orders).to.have.property('recentOrders');
    },
  }),

  new IntegrationTest<IAnalyticsTestSetup>({
    group,
    snapshot: false,
    name: 'Get shop analytics with date range filter',
    setup: analyticsSetup,
    test: async function () {
      const startDate = DateTime.now().minus({ days: 7 }).toISO();
      const endDate = DateTime.now().toISO();

      const res = await this.setupData.client1WithPermissions.analytics.analyticsControllerGetShopAnalytics(
        undefined, // gameServerIds
        startDate as any, // startDate
        endDate as any, // endDate
      );

      expect(res.data.data).to.have.property('kpis');
      expect(res.data.data.kpis.totalRevenue).to.be.greaterThanOrEqual(0);
    },
  }),

  new IntegrationTest<IAnalyticsTestSetup>({
    group,
    snapshot: false,
    name: 'Get shop analytics filtered by game server',
    setup: analyticsSetup,
    test: async function () {
      const res = await this.setupData.client1WithPermissions.analytics.analyticsControllerGetShopAnalytics([
        this.setupData.gameserver.id,
      ]);

      expect(res.data.data).to.have.property('kpis');
      // The response includes metadata about which gameServerIds were used
      expect(res.data.data).to.have.property('metadata');
    },
  }),

  new IntegrationTest<IAnalyticsTestSetup>({
    group,
    snapshot: false,
    name: 'Should deny access without MANAGE_SHOP_LISTINGS permission',
    setup: analyticsSetup,
    expectedStatus: 403,
    test: async function () {
      try {
        await this.setupData.client2WithoutPermissions.analytics.analyticsControllerGetShopAnalytics();
        throw new Error('Should have thrown 403 error');
      } catch (error) {
        if (isAxiosError(error)) {
          expect(error.response?.status).to.equal(403);
          expect(error.response?.data?.meta?.error?.message).to.include('permission');
        } else {
          throw error;
        }
      }
    },
  }),

  new IntegrationTest<IAnalyticsTestSetup>({
    group,
    snapshot: false,
    name: 'Analytics should be cached on second request',
    setup: analyticsSetup,
    test: async function () {
      // Clear any existing cache
      const redisClient = await Redis.getClient('shop-analytics');
      const domainId = (this.setupData as any).domainId || 'test-domain';
      const pattern = `shop:analytics:${domainId}:*`;
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }

      // First request - should generate fresh data
      const startTime1 = Date.now();
      const res1 = await this.setupData.client1WithPermissions.analytics.analyticsControllerGetShopAnalytics();
      const duration1 = Date.now() - startTime1;

      // Second request - should be cached
      const startTime2 = Date.now();
      const res2 = await this.setupData.client1WithPermissions.analytics.analyticsControllerGetShopAnalytics();
      const duration2 = Date.now() - startTime2;

      // Cached response should be significantly faster (at least 50% faster)
      expect(duration2).to.be.lessThan(duration1 * 0.5);

      // Data should be the same
      expect(res1.data.data.kpis.totalRevenue).to.equal(res2.data.data.kpis.totalRevenue);
    },
  }),

  new IntegrationTest<IAnalyticsTestSetup>({
    group,
    snapshot: false,
    name: 'Analytics should include recent orders',
    setup: analyticsSetup,
    test: async function () {
      const res = await this.setupData.client1WithPermissions.analytics.analyticsControllerGetShopAnalytics();

      expect(res.data.data.orders).to.have.property('recentOrders');
      expect(res.data.data.orders.recentOrders).to.be.an('array');

      if (res.data.data.orders.recentOrders.length > 0) {
        const recentOrder = res.data.data.orders.recentOrders[0];
        expect(recentOrder).to.have.property('id');
        expect(recentOrder).to.have.property('playerName');
        expect(recentOrder).to.have.property('itemName');
        expect(recentOrder).to.have.property('value');
        expect(recentOrder).to.have.property('time');
        expect(recentOrder).to.have.property('status');
      }
    },
  }),

  new IntegrationTest<IAnalyticsTestSetup>({
    group,
    snapshot: false,
    name: 'Analytics should include product metrics',
    setup: analyticsSetup,
    test: async function () {
      const res = await this.setupData.client1WithPermissions.analytics.analyticsControllerGetShopAnalytics();

      expect(res.data.data.products).to.have.property('topItems');
      expect(res.data.data.products).to.have.property('categories');
      expect(res.data.data.products).to.have.property('deadStock');
      expect(res.data.data.products.topItems).to.be.an('array');

      expect(res.data.data.products.topItems).to.be.an('array');
      expect(res.data.data.products.categories).to.be.an('array');
    },
  }),

  new IntegrationTest<IAnalyticsTestSetup>({
    group,
    snapshot: false,
    name: 'Analytics should include customer metrics',
    setup: analyticsSetup,
    test: async function () {
      const res = await this.setupData.client1WithPermissions.analytics.analyticsControllerGetShopAnalytics();

      expect(res.data.data.customers).to.have.property('totalCustomers');
      expect(res.data.data.customers).to.have.property('segments');
      expect(res.data.data.customers).to.have.property('topBuyers');
      expect(res.data.data.customers).to.have.property('repeatRate');

      expect(res.data.data.customers.totalCustomers).to.be.greaterThanOrEqual(0);
      expect(res.data.data.customers.topBuyers).to.be.an('array');
    },
  }),

  new IntegrationTest<IAnalyticsTestSetup>({
    group,
    snapshot: false,
    name: 'Analytics should generate insights',
    setup: analyticsSetup,
    test: async function () {
      const res = await this.setupData.client1WithPermissions.analytics.analyticsControllerGetShopAnalytics();

      expect(res.data.data.insights).to.be.an('array');

      if (res.data.data.insights.length > 0) {
        const insight = res.data.data.insights[0];
        expect(insight).to.have.property('type');
        expect(insight).to.have.property('title');
        expect(insight).to.have.property('description');
        expect(['success', 'warning', 'info', 'tip']).to.include(insight.type);
      }
    },
  }),

  new IntegrationTest<IAnalyticsTestSetup>({
    group,
    snapshot: false,
    name: 'Analytics should handle empty date range gracefully',
    setup: analyticsSetup,
    test: async function () {
      // Request analytics for a future date range with no data
      const startDate = DateTime.now().plus({ days: 100 }).toISO();
      const endDate = DateTime.now().plus({ days: 101 }).toISO();

      const res = await this.setupData.client1WithPermissions.analytics.analyticsControllerGetShopAnalytics(
        undefined,
        startDate || undefined,
        endDate || undefined,
      );

      expect(res.data.data).to.have.property('kpis');
      expect(res.data.data.kpis.totalRevenue).to.equal(0);
      expect(res.data.data.orders.recentOrders).to.be.an('array').that.is.empty;
    },
  }),

  new IntegrationTest<IAnalyticsTestSetup>({
    group,
    snapshot: false,
    name: 'Analytics should include order status breakdown',
    setup: analyticsSetup,
    test: async function () {
      const res = await this.setupData.client1WithPermissions.analytics.analyticsControllerGetShopAnalytics();

      expect(res.data.data.orders.statusBreakdown).to.be.an('array');

      // Should have at least PAID and CANCELED statuses from our setup
      const statuses = res.data.data.orders.statusBreakdown.map((s: any) => s.status);
      expect(statuses).to.include.oneOf([
        ShopOrderOutputDTOStatusEnum.Paid,
        ShopOrderOutputDTOStatusEnum.Canceled,
        ShopOrderOutputDTOStatusEnum.Completed,
      ]);

      // Each status should have count and percentage
      res.data.data.orders.statusBreakdown.forEach((status: any) => {
        expect(status).to.have.property('status');
        expect(status).to.have.property('count');
        expect(status).to.have.property('percentage');
        expect(status.count).to.be.greaterThanOrEqual(0);
        expect(status.percentage).to.be.greaterThanOrEqual(0);
        expect(status.percentage).to.be.lessThanOrEqual(100);
      });
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
