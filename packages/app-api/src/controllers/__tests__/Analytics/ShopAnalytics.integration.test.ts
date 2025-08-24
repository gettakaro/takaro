import { IntegrationTest, expect, IShopSetup, shopSetup, integrationConfig } from '@takaro/test';
import {
  ShopOrderOutputDTOStatusEnum,
  ShopListingOutputDTO,
  isAxiosError,
  Client,
  AnalyticsControllerGetShopAnalyticsPeriodEnum,
} from '@takaro/apiclient';
import { describe } from 'node:test';

const group = 'Analytics/ShopAnalyticsController';

interface IAnalyticsTestSetup extends IShopSetup {
  client1WithPermissions: Client;
  client2WithoutPermissions: Client;
  gameserver2Listings: ShopListingOutputDTO[];
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
    url: integrationConfig.get('host'),
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

  // Create listings and orders on gameserver2 for proper filtering tests
  await this.client.settings.settingsControllerSet('economyEnabled', {
    value: 'true',
    gameServerId: shopData.gameserver2.id,
  });

  await this.client.settings.settingsControllerSet('currencyName', {
    gameServerId: shopData.gameserver2.id,
    value: 'test coin',
  });

  const gameserver2Listings = await shopData.createListings(this.client, {
    gameServerId: shopData.gameserver2.id,
    amount: 2,
    name: 'Server2 Item',
  });

  // Add currency to players on gameserver2
  await this.client.playerOnGameserver.playerOnGameServerControllerAddCurrency(
    shopData.gameserver2.id,
    shopData.players2[0].id,
    { currency: 500 },
  );

  // Create orders on gameserver2
  for (let i = 0; i < 4; i++) {
    await shopData.client3.shopOrder.shopOrderControllerCreate({
      listingId: gameserver2Listings[0].id,
      amount: 2,
    });
  }

  return {
    ...shopData,
    client1WithPermissions,
    client2WithoutPermissions,
    gameserver2Listings,
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
      // We created 6 orders from listing100 (100 currency each) and 6 orders from listing33 (33 currency each)
      // Plus 1 canceled order that shouldn't count
      expect(res.data.data.kpis.totalRevenue).to.be.greaterThan(0);

      // Check that we have orders
      expect(res.data.data.orders).to.have.property('statusBreakdown');
      expect(res.data.data.orders).to.have.property('recentOrders');
    },
  }),

  new IntegrationTest<IAnalyticsTestSetup>({
    group,
    snapshot: false,
    name: 'Get shop analytics with Last7Days period',
    setup: analyticsSetup,
    test: async function () {
      const res = await this.setupData.client1WithPermissions.analytics.analyticsControllerGetShopAnalytics(
        undefined, // gameServerIds
        AnalyticsControllerGetShopAnalyticsPeriodEnum.Last7Days,
      );

      expect(res.data.data).to.have.property('kpis');
      // Should have revenue from orders created in test setup
      expect(res.data.data.kpis.totalRevenue).to.be.greaterThan(0);
    },
  }),

  new IntegrationTest<IAnalyticsTestSetup>({
    group,
    snapshot: false,
    name: 'Should properly filter analytics by game server',
    setup: analyticsSetup,
    test: async function () {
      // Get analytics for ALL servers (no filter)
      const allServersRes = await this.setupData.client1WithPermissions.analytics.analyticsControllerGetShopAnalytics();

      // Get analytics for gameserver1 only
      const server1Res = await this.setupData.client1WithPermissions.analytics.analyticsControllerGetShopAnalytics([
        this.setupData.gameserver.id,
      ]);

      // Get analytics for gameserver2 only
      const server2Res = await this.setupData.client1WithPermissions.analytics.analyticsControllerGetShopAnalytics([
        this.setupData.gameserver2.id,
      ]);

      // Verify all responses have data
      expect(allServersRes.data.data).to.have.property('kpis');
      expect(server1Res.data.data).to.have.property('kpis');
      expect(server2Res.data.data).to.have.property('kpis');

      // Extract revenue values
      const allRevenue = allServersRes.data.data.kpis.totalRevenue;
      const server1Revenue = server1Res.data.data.kpis.totalRevenue;
      const server2Revenue = server2Res.data.data.kpis.totalRevenue;

      // Each server should have revenue (we created orders on both)
      expect(server1Revenue, 'Server 1 should have revenue').to.be.greaterThan(0);
      expect(server2Revenue, 'Server 2 should have revenue').to.be.greaterThan(0);

      // Combined revenue should equal sum of individual servers
      expect(allRevenue, 'Combined revenue should equal sum of individual servers').to.equal(
        server1Revenue + server2Revenue,
      );

      // Extract order counts
      const allOrders = allServersRes.data.data.orders.totalOrders;
      const server1Orders = server1Res.data.data.orders.totalOrders;
      const server2Orders = server2Res.data.data.orders.totalOrders;

      // Each server should have orders
      expect(server1Orders, 'Server 1 should have orders').to.be.greaterThan(0);
      expect(server2Orders, 'Server 2 should have orders').to.be.greaterThan(0);

      // Combined orders should equal sum of individual servers
      expect(allOrders, 'Combined orders should equal sum of individual servers').to.equal(
        server1Orders + server2Orders,
      );

      // Check customer counts
      const allCustomers = allServersRes.data.data.customers.totalCustomers;
      const server1Customers = server1Res.data.data.customers.totalCustomers;
      const server2Customers = server2Res.data.data.customers.totalCustomers;

      // Each server should have customers
      expect(server1Customers, 'Server 1 should have customers').to.be.greaterThan(0);
      expect(server2Customers, 'Server 2 should have customers').to.be.greaterThan(0);

      // Combined customers should equal sum of individual servers
      // (assuming no overlap of players between servers in test data)
      expect(allCustomers, 'Combined customers should equal sum of individual servers').to.equal(
        server1Customers + server2Customers,
      );

      // Verify that filtering actually makes a difference
      expect(server1Revenue, 'Server revenues should be different').to.not.equal(server2Revenue);
      expect(server1Orders, 'Server order counts should be different').to.not.equal(server2Orders);
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
          expect(error.response?.data?.meta?.error?.message).to.equal('Forbidden');
        } else {
          throw error;
        }
      }
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

      // We created multiple orders, so there should be recent orders
      expect(res.data.data.orders.recentOrders.length).to.be.greaterThan(0);
      const recentOrder = res.data.data.orders.recentOrders[0];
      expect(recentOrder).to.have.property('id');
      expect(recentOrder).to.have.property('playerName');
      expect(recentOrder).to.have.property('itemName');
      expect(recentOrder).to.have.property('value');
      expect(recentOrder).to.have.property('time');
      expect(recentOrder).to.have.property('status');
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
      // We have orders from 2 different listings
      expect(res.data.data.products.topItems.length).to.be.at.least(2);
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

      // We have 2 test players making orders
      expect(res.data.data.customers.totalCustomers).to.be.at.least(2);
      expect(res.data.data.customers.topBuyers).to.be.an('array');
      // We have 2 players making purchases
      expect(res.data.data.customers.topBuyers.length).to.be.at.least(2);
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
    name: 'Analytics should handle Last24Hours period',
    setup: analyticsSetup,
    test: async function () {
      const res = await this.setupData.client1WithPermissions.analytics.analyticsControllerGetShopAnalytics(
        undefined,
        AnalyticsControllerGetShopAnalyticsPeriodEnum.Last24Hours,
      );

      expect(res.data.data).to.have.property('kpis');
      // Should have revenue from today's orders
      expect(res.data.data.kpis.totalRevenue).to.be.greaterThan(0);
      // With test data created "today", Last24Hours should have data
      expect(res.data.data.orders.recentOrders).to.be.an('array');
      expect(res.data.data.orders.recentOrders.length).to.be.greaterThan(0);
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
        // Some statuses might have 0 count if no orders in that status
        expect(status.count).to.be.at.least(0);
        expect(status.percentage).to.be.at.least(0);
        expect(status.percentage).to.be.lessThanOrEqual(100);
      });
    },
  }),

  new IntegrationTest<IAnalyticsTestSetup>({
    group,
    snapshot: false,
    name: 'Analytics should support Last30Days period',
    setup: analyticsSetup,
    test: async function () {
      const res = await this.setupData.client1WithPermissions.analytics.analyticsControllerGetShopAnalytics(
        undefined,
        AnalyticsControllerGetShopAnalyticsPeriodEnum.Last30Days,
      );

      expect(res.data.data).to.have.property('kpis');
      expect(res.data.data.kpis.totalRevenue).to.be.greaterThan(0);
      expect(res.data.data).to.have.property('lastUpdated');
      expect(res.data.data).to.have.property('dateRange');
    },
  }),

  new IntegrationTest<IAnalyticsTestSetup>({
    group,
    snapshot: false,
    name: 'Analytics should support Last90Days period',
    setup: analyticsSetup,
    test: async function () {
      const res = await this.setupData.client1WithPermissions.analytics.analyticsControllerGetShopAnalytics(
        undefined,
        AnalyticsControllerGetShopAnalyticsPeriodEnum.Last90Days,
      );

      expect(res.data.data).to.have.property('kpis');
      expect(res.data.data.kpis.totalRevenue).to.be.greaterThan(0);
      expect(res.data.data).to.have.property('lastUpdated');
      expect(res.data.data).to.have.property('dateRange');
    },
  }),

  new IntegrationTest<IAnalyticsTestSetup>({
    group,
    snapshot: false,
    name: 'Analytics with different periods should return consistent structure',
    setup: analyticsSetup,
    test: async function () {
      const periods = [
        AnalyticsControllerGetShopAnalyticsPeriodEnum.Last24Hours,
        AnalyticsControllerGetShopAnalyticsPeriodEnum.Last7Days,
        AnalyticsControllerGetShopAnalyticsPeriodEnum.Last30Days,
        AnalyticsControllerGetShopAnalyticsPeriodEnum.Last90Days,
      ];

      for (const period of periods) {
        const res = await this.setupData.client1WithPermissions.analytics.analyticsControllerGetShopAnalytics(
          undefined,
          period,
        );

        // All periods should return the same structure
        expect(res.data.data).to.have.property('kpis');
        expect(res.data.data).to.have.property('revenue');
        expect(res.data.data).to.have.property('products');
        expect(res.data.data).to.have.property('orders');
        expect(res.data.data).to.have.property('customers');
        expect(res.data.data).to.have.property('insights');
        expect(res.data.data).to.have.property('lastUpdated');
        expect(res.data.data).to.have.property('dateRange');
      }
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
