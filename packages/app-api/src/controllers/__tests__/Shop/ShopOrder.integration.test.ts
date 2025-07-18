import { IntegrationTest, expect, IShopSetup, shopSetup } from '@takaro/test';
import { ShopOrderOutputDTOStatusEnum, isAxiosError } from '@takaro/apiclient';
import { describe } from 'node:test';
import { EventChatMessage } from '@takaro/modules';
const group = 'Shop/ShopOrderController';

const tests = [
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: true,
    name: 'Create a new order',
    setup: shopSetup,
    filteredFields: ['listingId', 'playerId'],
    test: async function () {
      const res = await this.setupData.client1.shopOrder.shopOrderControllerCreate({
        listingId: this.setupData.listing100.id,
        amount: 1,
      });

      expect(res.data.data.status).to.be.eq(ShopOrderOutputDTOStatusEnum.Paid);

      return res;
    },
  }),
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: true,
    name: 'Create a new order when not enough money',
    setup: shopSetup,
    filteredFields: ['listingId', 'playerId'],
    expectedStatus: 400,
    test: async function () {
      try {
        await this.setupData.client1.shopOrder.shopOrderControllerCreate({
          listingId: this.setupData.listing100.id,
          amount: 5,
        });
        throw new Error('Should not be able to create order');
      } catch (error) {
        if (!isAxiosError(error)) throw error;
        if (!error.response) throw error;
        expect(error.response.data.meta.error.code).to.be.eq('BadRequestError');
        expect(error.response.data.meta.error.message).to.be.eq('Not enough currency');
        return error.response;
      }
    },
  }),
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: true,
    name: 'Get order by ID',
    setup: shopSetup,
    filteredFields: ['listingId', 'playerId'],
    test: async function () {
      const order = await this.setupData.client1.shopOrder.shopOrderControllerCreate({
        listingId: this.setupData.listing100.id,
        amount: 1,
      });

      const res = await this.setupData.client1.shopOrder.shopOrderControllerGetOne(order.data.data.id);
      return res;
    },
  }),
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: true,
    name: 'Get order by ID that is not yours -> error',
    setup: shopSetup,
    filteredFields: ['listingId', 'playerId'],
    expectedStatus: 404,
    test: async function () {
      const order = await this.setupData.client1.shopOrder.shopOrderControllerCreate({
        listingId: this.setupData.listing100.id,
        amount: 1,
      });

      try {
        await this.setupData.client2.shopOrder.shopOrderControllerGetOne(order.data.data.id);
        throw new Error('Should not be able to get order');
      } catch (error) {
        if (!isAxiosError(error)) throw error;
        if (!error.response) throw error;
        expect(error.response.data.meta.error.code).to.be.eq('NotFoundError');
        return error.response;
      }
    },
  }),
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: true,
    name: 'Get order by ID that is not yours but you have high privileges -> success',
    setup: shopSetup,
    filteredFields: ['listingId', 'playerId'],
    test: async function () {
      const order = await this.setupData.client1.shopOrder.shopOrderControllerCreate({
        listingId: this.setupData.listing100.id,
        amount: 1,
      });

      const res = await this.client.shopOrder.shopOrderControllerGetOne(order.data.data.id);
      return res;
    },
  }),
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: true,
    name: 'Search orders',
    setup: shopSetup,
    filteredFields: ['listingId', 'playerId'],
    test: async function () {
      await this.setupData.client1.shopOrder.shopOrderControllerCreate({
        listingId: this.setupData.listing100.id,
        amount: 1,
      });
      const res = await this.setupData.client1.shopOrder.shopOrderControllerSearch();
      expect(res.data.data).to.have.length(1);
      return res;
    },
  }),
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: true,
    name: 'Search orders returns only own orders',
    setup: shopSetup,
    filteredFields: ['listingId', 'playerId'],
    test: async function () {
      await this.setupData.client1.shopOrder.shopOrderControllerCreate({
        listingId: this.setupData.listing100.id,
        amount: 1,
      });

      const res = await this.setupData.client2.shopOrder.shopOrderControllerSearch();
      expect(res.data.data).to.have.length(0);
      return res;
    },
  }),
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: true,
    name: 'Cannot search orders of another user',
    setup: shopSetup,
    filteredFields: ['listingId', 'playerId'],
    test: async function () {
      await this.setupData.client1.shopOrder.shopOrderControllerCreate({
        listingId: this.setupData.listing100.id,
        amount: 1,
      });

      const ordersRes = await this.setupData.client2.shopOrder.shopOrderControllerSearch({
        filters: { userId: [this.setupData.user1.id] },
      });
      expect(ordersRes.data.data).to.have.length(0);
      return ordersRes;
    },
  }),
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: true,
    name: 'Search orders returns all orders when called by high privileged user',
    setup: shopSetup,
    filteredFields: ['listingId', 'playerId'],
    test: async function () {
      await this.setupData.client1.shopOrder.shopOrderControllerCreate({
        listingId: this.setupData.listing100.id,
        amount: 1,
      });

      await this.setupData.client2.shopOrder.shopOrderControllerCreate({
        listingId: this.setupData.listing33.id,
        amount: 1,
      });

      const res = await this.client.shopOrder.shopOrderControllerSearch();
      expect(res.data.data).to.have.length(2);
      return res;
    },
  }),
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: true,
    name: 'Claim order',
    setup: shopSetup,
    filteredFields: ['listingId', 'playerId'],
    test: async function () {
      const order = await this.setupData.client1.shopOrder.shopOrderControllerCreate({
        listingId: this.setupData.listing100.id,
        amount: 1,
      });

      const res = await this.setupData.client1.shopOrder.shopOrderControllerClaim(order.data.data.id);
      expect(res.data.data.status).to.be.eq(ShopOrderOutputDTOStatusEnum.Completed);
      return res;
    },
  }),
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    name: 'Claim order with multiple amounts gives correct quantity',
    setup: shopSetup,
    test: async function () {
      // First create a listing with multiple items per order
      const items = (
        await this.client.item.itemControllerSearch({
          filters: { gameserverId: [this.setupData.gameserver.id] },
        })
      ).data.data;
      const testItem = items[0];

      const multiItemListing = await this.client.shopListing.shopListingControllerCreate({
        gameServerId: this.setupData.gameserver.id,
        items: [{ itemId: testItem.id, amount: 5 }], // 5 items per order
        price: 50,
        name: 'Multi-item test listing',
      });

      // Give the player enough currency
      await this.client.playerOnGameserver.playerOnGameServerControllerAddCurrency(
        this.setupData.gameserver.id,
        this.setupData.players[0].id,
        { currency: 1000 },
      );

      // Create an order for 3 units (should give 5 * 3 = 15 items total)
      const order = await this.setupData.client1.shopOrder.shopOrderControllerCreate({
        listingId: multiItemListing.data.data.id,
        amount: 3,
      });

      const res = await this.setupData.client1.shopOrder.shopOrderControllerClaim(order.data.data.id);
      expect(res.data.data.status).to.be.eq(ShopOrderOutputDTOStatusEnum.Completed);

      // Bug repro: before when ordering 3 units, we would send 3 messages to the player,
      // each with 5 items, resulting in 15 items total but 3 separate messages
      // Now we should only have 1 message with 15 items total
      const messages = (await this.client.event.eventControllerSearch({ filters: { eventName: ['chat-message'] } }))
        .data.data;
      const containsItemMessage = messages.some((msg) =>
        (msg.meta as EventChatMessage)?.msg?.includes(`15x ${testItem.name}`),
      );
      expect(containsItemMessage).to.be.true;

      return res;
    },
  }),
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: true,
    name: 'Claim order that is not yours -> error',
    setup: shopSetup,
    filteredFields: ['listingId', 'playerId'],
    expectedStatus: 404,
    test: async function () {
      const order = await this.setupData.client1.shopOrder.shopOrderControllerCreate({
        listingId: this.setupData.listing100.id,
        amount: 1,
      });

      try {
        await this.setupData.client2.shopOrder.shopOrderControllerClaim(order.data.data.id);
        throw new Error('Should not be able to claim order');
      } catch (error) {
        if (!isAxiosError(error)) throw error;
        if (!error.response) throw error;
        expect(error.response.data.meta.error.code).to.be.eq('NotFoundError');
        return error.response;
      }
    },
  }),
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: true,
    name: 'Claim order that is already claimed -> error',
    setup: shopSetup,
    filteredFields: ['listingId', 'playerId'],
    expectedStatus: 400,
    test: async function () {
      const order = await this.setupData.client1.shopOrder.shopOrderControllerCreate({
        listingId: this.setupData.listing100.id,
        amount: 1,
      });

      await this.setupData.client1.shopOrder.shopOrderControllerClaim(order.data.data.id);

      try {
        await this.setupData.client1.shopOrder.shopOrderControllerClaim(order.data.data.id);
        throw new Error('Should not be able to claim order');
      } catch (error) {
        if (!isAxiosError(error)) throw error;
        if (!error.response) throw error;
        expect(error.response.data.meta.error.code).to.be.eq('BadRequestError');
        expect(error.response.data.meta.error.message).to.be.eq(
          'Can only claim paid, unclaimed orders. Current status: COMPLETED',
        );
        return error.response;
      }
    },
  }),
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: true,
    name: 'Claim order that is canceled -> error',
    setup: shopSetup,
    filteredFields: ['listingId', 'playerId'],
    expectedStatus: 400,
    test: async function () {
      const order = await this.setupData.client1.shopOrder.shopOrderControllerCreate({
        listingId: this.setupData.listing100.id,
        amount: 1,
      });

      await this.setupData.client1.shopOrder.shopOrderControllerCancel(order.data.data.id);

      try {
        await this.setupData.client1.shopOrder.shopOrderControllerClaim(order.data.data.id);
        throw new Error('Should not be able to claim order');
      } catch (error) {
        if (!isAxiosError(error)) throw error;
        if (!error.response) throw error;
        expect(error.response.data.meta.error.code).to.be.eq('BadRequestError');
        expect(error.response.data.meta.error.message).to.be.eq(
          'Can only claim paid, unclaimed orders. Current status: CANCELED',
        );
        return error.response;
      }
    },
  }),
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: true,
    name: 'Cancel order',
    setup: shopSetup,
    filteredFields: ['listingId', 'playerId'],
    test: async function () {
      const order = await this.setupData.client1.shopOrder.shopOrderControllerCreate({
        listingId: this.setupData.listing100.id,
        amount: 1,
      });

      const res = await this.setupData.client1.shopOrder.shopOrderControllerCancel(order.data.data.id);
      expect(res.data.data.status).to.be.eq(ShopOrderOutputDTOStatusEnum.Canceled);
      return res;
    },
  }),
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: true,
    name: 'Cancel order that is not yours -> error',
    setup: shopSetup,
    filteredFields: ['listingId', 'playerId'],
    expectedStatus: 404,
    test: async function () {
      const order = await this.setupData.client1.shopOrder.shopOrderControllerCreate({
        listingId: this.setupData.listing100.id,
        amount: 1,
      });

      try {
        await this.setupData.client2.shopOrder.shopOrderControllerCancel(order.data.data.id);
        throw new Error('Should not be able to cancel order');
      } catch (error) {
        if (!isAxiosError(error)) throw error;
        if (!error.response) throw error;
        expect(error.response.data.meta.error.code).to.be.eq('NotFoundError');
        return error.response;
      }
    },
  }),
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: true,
    name: 'High priv user cancel order that is not yours -> success',
    setup: shopSetup,
    filteredFields: ['listingId', 'playerId'],
    test: async function () {
      const order = await this.setupData.client1.shopOrder.shopOrderControllerCreate({
        listingId: this.setupData.listing100.id,
        amount: 1,
      });

      const res = await this.client.shopOrder.shopOrderControllerCancel(order.data.data.id);
      expect(res.data.data.status).to.be.eq(ShopOrderOutputDTOStatusEnum.Canceled);
      return res;
    },
  }),
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: true,
    name: 'Cancel order that is already canceled -> error',
    setup: shopSetup,
    filteredFields: ['listingId', 'playerId'],
    expectedStatus: 400,
    test: async function () {
      const order = await this.setupData.client1.shopOrder.shopOrderControllerCreate({
        listingId: this.setupData.listing100.id,
        amount: 1,
      });

      await this.setupData.client1.shopOrder.shopOrderControllerCancel(order.data.data.id);

      try {
        await this.setupData.client1.shopOrder.shopOrderControllerCancel(order.data.data.id);
        throw new Error('Should not be able to cancel order');
      } catch (error) {
        if (!isAxiosError(error)) throw error;
        if (!error.response) throw error;
        expect(error.response.data.meta.error.code).to.be.eq('BadRequestError');
        expect(error.response.data.meta.error.message).to.be.eq(
          "Can only cancel paid orders that weren't claimed yet. Current status: CANCELED",
        );
        return error.response;
      }
    },
  }),
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    name: 'Cancelling an order returns the currency',
    setup: shopSetup,
    test: async function () {
      await this.client.playerOnGameserver.playerOnGameServerControllerSetCurrency(
        this.setupData.gameserver.id,
        this.setupData.players[0].id,
        { currency: 250 },
      );

      const orderRes = await this.setupData.client1.shopOrder.shopOrderControllerCreate({
        listingId: this.setupData.listing100.id,
        amount: 1,
      });

      const order = orderRes.data.data;

      const pogsResBefore = await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(
        this.setupData.gameserver.id,
        this.setupData.players[0].id,
      );

      expect(pogsResBefore.data.data.currency).to.be.eq(150);

      await this.setupData.client1.shopOrder.shopOrderControllerCancel(order.id);

      const pogResAfter = await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(
        this.setupData.gameserver.id,
        this.setupData.players[0].id,
      );

      expect(pogResAfter.data.data.currency).to.be.eq(250);

      return pogResAfter;
    },
  }),
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    name: 'Deleting a listing, cancels orders and refunds currency',
    setup: shopSetup,
    test: async function () {
      await this.client.playerOnGameserver.playerOnGameServerControllerSetCurrency(
        this.setupData.gameserver.id,
        this.setupData.players[0].id,
        { currency: 250 },
      );

      const orderRes = await this.setupData.client1.shopOrder.shopOrderControllerCreate({
        listingId: this.setupData.listing100.id,
        amount: 1,
      });

      const order = orderRes.data.data;

      const pogsResBefore = await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(
        this.setupData.gameserver.id,
        this.setupData.players[0].id,
      );

      expect(pogsResBefore.data.data.currency).to.be.eq(150);

      await this.client.shopListing.shopListingControllerDelete(this.setupData.listing100.id);

      const pogResAfter = await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(
        this.setupData.gameserver.id,
        this.setupData.players[0].id,
      );

      expect(pogResAfter.data.data.currency).to.be.eq(250);

      const orderResAfter = await this.setupData.client1.shopOrder.shopOrderControllerGetOne(order.id);

      expect(orderResAfter.data.data.status).to.be.eq(ShopOrderOutputDTOStatusEnum.Canceled);

      return pogResAfter;
    },
  }),
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    name: 'Cannot buy a deleted listing',
    setup: shopSetup,
    expectedStatus: 404,
    test: async function () {
      await this.client.shopListing.shopListingControllerDelete(this.setupData.listing100.id);

      try {
        await this.setupData.client1.shopOrder.shopOrderControllerCreate({
          listingId: this.setupData.listing100.id,
          amount: 1,
        });
        throw new Error('Should not be able to create order');
      } catch (error) {
        if (!isAxiosError(error)) throw error;
        if (!error.response) throw error;
        expect(error.response.data.meta.error.code).to.be.eq('NotFoundError');
        return error.response;
      }
    },
  }),
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    name: 'Cannot buy a draft listing',
    setup: shopSetup,
    expectedStatus: 400,
    test: async function () {
      await this.client.shopListing.shopListingControllerUpdate(this.setupData.listing100.id, { draft: true });

      try {
        await this.setupData.client1.shopOrder.shopOrderControllerCreate({
          listingId: this.setupData.listing100.id,
          amount: 1,
        });
        throw new Error('Should not be able to create order');
      } catch (error) {
        if (!isAxiosError(error)) throw error;
        if (!error.response) throw error;
        expect(error.response.data.meta.error.code).to.be.eq('BadRequestError');
        expect(error.response.data.meta.error.message).to.be.eq('Cannot order a draft listing');
        return error.response;
      }
    },
  }),
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    name: 'Setting a listing to draft cancels pending orders',
    setup: shopSetup,
    test: async function () {
      await this.client.playerOnGameserver.playerOnGameServerControllerSetCurrency(
        this.setupData.gameserver.id,
        this.setupData.players[0].id,
        { currency: 250 },
      );

      const orderRes = await this.setupData.client1.shopOrder.shopOrderControllerCreate({
        listingId: this.setupData.listing100.id,
        amount: 1,
      });

      const order = orderRes.data.data;

      const pogsResBefore = await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(
        this.setupData.gameserver.id,
        this.setupData.players[0].id,
      );

      expect(pogsResBefore.data.data.currency).to.be.eq(150);

      await this.client.shopListing.shopListingControllerUpdate(this.setupData.listing100.id, { draft: true });

      const pogResAfter = await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(
        this.setupData.gameserver.id,
        this.setupData.players[0].id,
      );

      expect(pogResAfter.data.data.currency).to.be.eq(250);

      const orderResAfter = await this.setupData.client1.shopOrder.shopOrderControllerGetOne(order.id);

      expect(orderResAfter.data.data.status).to.be.eq(ShopOrderOutputDTOStatusEnum.Canceled);

      return pogResAfter;
    },
  }),
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    name: 'High privilege user can claim an order in someone elses name',
    setup: shopSetup,
    test: async function () {
      const orderRes = await this.setupData.client1.shopOrder.shopOrderControllerCreate({
        listingId: this.setupData.listing100.id,
        amount: 1,
      });

      const order = orderRes.data.data;

      const res = await this.client.shopOrder.shopOrderControllerClaim(order.id);
      expect(res.data.data.status).to.be.eq(ShopOrderOutputDTOStatusEnum.Completed);
      return res;
    },
  }),
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    name: 'Can filter shop orders by gameserver ID',
    setup: shopSetup,
    test: async function () {
      /**
       * Setup listings on both gameservers
       * Create orders for both listings
       * Then, filter orders by gameserver ID
       * Expect to only get orders for that gameserver
       */
      const listingGameserver1 = (
        await this.client.shopListing.shopListingControllerCreate({
          gameServerId: this.setupData.gameserver.id,
          items: [{ code: this.setupData.items[0].code, amount: 1 }],
          price: 1,
          name: 'Test item 1',
        })
      ).data.data;

      const listingGameserver2 = (
        await this.client.shopListing.shopListingControllerCreate({
          gameServerId: this.setupData.gameserver2.id,
          items: [{ code: this.setupData.items[0].code, amount: 1 }],
          price: 1,
          name: 'Test item 2',
        })
      ).data.data;

      await this.setupData.client1.shopOrder.shopOrderControllerCreate({
        listingId: listingGameserver1.id,
        amount: 1,
      });

      await this.setupData.client3.shopOrder.shopOrderControllerCreate({
        listingId: listingGameserver2.id,
        amount: 1,
      });

      const filteredOrders = await this.client.shopOrder.shopOrderControllerSearch({
        filters: { gameServerId: [this.setupData.gameserver.id] },
        extend: ['listing'],
      });

      const allOrders = await this.client.shopOrder.shopOrderControllerSearch();

      expect(filteredOrders.data.data).to.have.length(1);
      expect(filteredOrders.data.data[0].listing?.gameServerId).to.be.eq(this.setupData.gameserver.id);
      expect(allOrders.data.data).to.have.length(2);
    },
  }),
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    name: 'Can filter shop orders by user ID',
    setup: shopSetup,
    test: async function () {
      /**
       * Setup listings on both gameservers
       * Create orders for both listings
       * Then, filter orders by user ID
       * Expect to only get orders for that user
       */
      const listingGameserver1 = (
        await this.client.shopListing.shopListingControllerCreate({
          gameServerId: this.setupData.gameserver.id,
          items: [{ code: this.setupData.items[0].code, amount: 1 }],
          price: 1,
          name: 'Test item 1',
        })
      ).data.data;

      const listingGameserver2 = (
        await this.client.shopListing.shopListingControllerCreate({
          gameServerId: this.setupData.gameserver2.id,
          items: [{ code: this.setupData.items[0].code, amount: 1 }],
          price: 1,
          name: 'Test item 2',
        })
      ).data.data;

      await this.setupData.client1.shopOrder.shopOrderControllerCreate({
        listingId: listingGameserver1.id,
        amount: 1,
      });

      await this.setupData.client3.shopOrder.shopOrderControllerCreate({
        listingId: listingGameserver2.id,
        amount: 1,
      });

      const filteredOrders = await this.client.shopOrder.shopOrderControllerSearch({
        filters: { userId: [this.setupData.user1.id] },
      });

      const allOrders = await this.client.shopOrder.shopOrderControllerSearch();

      expect(filteredOrders.data.data).to.have.length(1);
      expect(filteredOrders.data.data[0].playerId).to.be.eq(this.setupData.players[0].id);
      expect(allOrders.data.data).to.have.length(2);
    },
  }),
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    name: 'Can filter shop orders by player ID',
    setup: shopSetup,
    test: async function () {
      /**
       * Setup listings on both gameservers
       * Create orders for both listings
       * Then, filter orders by player ID
       * Expect to only get orders for that player
       */
      const listingGameserver1 = (
        await this.client.shopListing.shopListingControllerCreate({
          gameServerId: this.setupData.gameserver.id,
          items: [{ code: this.setupData.items[0].code, amount: 1 }],
          price: 1,
          name: 'Test item 1',
        })
      ).data.data;

      const listingGameserver2 = (
        await this.client.shopListing.shopListingControllerCreate({
          gameServerId: this.setupData.gameserver2.id,
          items: [{ code: this.setupData.items[0].code, amount: 1 }],
          price: 1,
          name: 'Test item 2',
        })
      ).data.data;

      await this.setupData.client1.shopOrder.shopOrderControllerCreate({
        listingId: listingGameserver1.id,
        amount: 1,
      });

      await this.setupData.client3.shopOrder.shopOrderControllerCreate({
        listingId: listingGameserver2.id,
        amount: 1,
      });

      const filteredOrders = await this.client.shopOrder.shopOrderControllerSearch({
        filters: { playerId: [this.setupData.players[0].id] },
      });

      const allOrders = await this.client.shopOrder.shopOrderControllerSearch();

      expect(filteredOrders.data.data).to.have.length(1);
      expect(filteredOrders.data.data[0].playerId).to.be.eq(this.setupData.players[0].id);
      expect(allOrders.data.data).to.have.length(2);
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
