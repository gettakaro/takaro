import { IntegrationTest, expect, SetupGameServerPlayers, integrationConfig, EventsAwaiter } from '@takaro/test';
import {
  Client,
  ItemsOutputDTO,
  ShopListingOutputDTO,
  ShopOrderOutputDTOStatusEnum,
  UserOutputDTO,
  isAxiosError,
} from '@takaro/apiclient';
import { faker } from '@faker-js/faker';
import { GameEvents } from '@takaro/modules';

const group = 'ShopOrderController';

async function createUserForPlayer(client: Client, playerId: string, gameServerId: string, createUser = true) {
  const password = 'shop-tester-password-very-safe';

  let user: UserOutputDTO | null = null;

  if (createUser) {
    user = (
      await client.user.userControllerCreate({
        name: 'test',
        email: `test-${faker.internet.email()}`,
        password,
      })
    ).data.data;
  } else {
    const userSearchRes = await client.user.userControllerSearch({ filters: { playerId: [playerId] } });
    if (userSearchRes.data.data.length === 0) {
      throw new Error('No user found for player');
    }
    user = userSearchRes.data.data[0];
  }

  const userClient = new Client({ auth: { username: user.email, password }, url: integrationConfig.get('host') });
  await userClient.login();

  const eventsAwaiter = new EventsAwaiter();
  await eventsAwaiter.connect(client);
  const chatEventWaiter = eventsAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE);
  await client.command.commandControllerTrigger(gameServerId, {
    msg: '/link',
    playerId,
  });
  const chatEvents = await chatEventWaiter;
  expect(chatEvents).to.have.length(1);
  const code = chatEvents[0].data.meta.msg.match(/code=(\w+-\w+-\w+)/)[1];
  await userClient.user.userControllerLinkPlayerProfile({ email: user.email, code });

  return {
    user,
    client: userClient,
  };
}

interface IShopSetup extends SetupGameServerPlayers.ISetupData {
  items: ItemsOutputDTO[];
  listing100: ShopListingOutputDTO;
  listing33: ShopListingOutputDTO;
  user1: UserOutputDTO;
  client1: Client;
  user2: UserOutputDTO;
  client2: Client;
  user3: UserOutputDTO;
  client3: Client;
  user4: UserOutputDTO;
  client4: Client;
}

const shopSetup = async function (this: IntegrationTest<IShopSetup>): Promise<IShopSetup> {
  const setupData = await SetupGameServerPlayers.setup.bind(
    this as unknown as IntegrationTest<SetupGameServerPlayers.ISetupData>,
  )();

  await this.client.settings.settingsControllerSet('economyEnabled', {
    value: 'true',
    gameServerId: setupData.gameServer1.id,
  });

  await this.client.settings.settingsControllerSet('economyEnabled', {
    value: 'true',
    gameServerId: setupData.gameServer2.id,
  });

  await this.client.settings.settingsControllerSet('currencyName', {
    gameServerId: setupData.gameServer1.id,
    value: 'test coin',
  });

  const items = (await this.client.item.itemControllerSearch()).data.data;

  const listing100Res = await this.client.shopListing.shopListingControllerCreate({
    gameServerId: setupData.gameServer1.id,
    items: [{ itemId: items[0].id, amount: 1 }],
    price: 100,
    name: 'Test item',
  });

  const listing33Res = await this.client.shopListing.shopListingControllerCreate({
    gameServerId: setupData.gameServer1.id,
    items: [{ itemId: items[1].id, amount: 1 }],
    price: 33,
    name: 'Test item 2',
  });

  await this.client.playerOnGameserver.playerOnGameServerControllerAddCurrency(
    setupData.gameServer1.id,
    setupData.pogs1[0].playerId,
    { currency: 250 },
  );

  await this.client.playerOnGameserver.playerOnGameServerControllerAddCurrency(
    setupData.gameServer1.id,
    setupData.pogs1[1].playerId,
    { currency: 250 },
  );

  await this.client.playerOnGameserver.playerOnGameServerControllerAddCurrency(
    setupData.gameServer2.id,
    setupData.pogs2[0].playerId,
    { currency: 250 },
  );

  await this.client.playerOnGameserver.playerOnGameServerControllerAddCurrency(
    setupData.gameServer2.id,
    setupData.pogs2[1].playerId,
    { currency: 250 },
  );

  const { client: user1Client, user: user1 } = await createUserForPlayer(
    this.client,
    setupData.pogs1[0].playerId,
    setupData.gameServer1.id,
  );

  const { client: user2Client, user: user2 } = await createUserForPlayer(
    this.client,
    setupData.pogs1[1].playerId,
    setupData.gameServer1.id,
  );

  const { client: user3Client, user: user3 } = await createUserForPlayer(
    this.client,
    setupData.pogs2[0].playerId,
    setupData.gameServer2.id,
  );

  const { client: user4Client, user: user4 } = await createUserForPlayer(
    this.client,
    setupData.pogs2[1].playerId,
    setupData.gameServer2.id,
  );

  return {
    ...setupData,
    items,
    listing100: listing100Res.data.data,
    listing33: listing33Res.data.data,
    user1,
    client1: user1Client,
    user2,
    client2: user2Client,
    user3,
    client3: user3Client,
    user4,
    client4: user4Client,
  };
};

const tests = [
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: true,
    name: 'Create a new order',
    setup: shopSetup,
    filteredFields: ['listingId', 'userId'],
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
    filteredFields: ['listingId', 'userId'],
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
    filteredFields: ['listingId', 'userId'],
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
    filteredFields: ['listingId', 'userId'],
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
    filteredFields: ['listingId', 'userId'],
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
    filteredFields: ['listingId', 'userId'],
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
    filteredFields: ['listingId', 'userId'],
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
    filteredFields: ['listingId', 'userId'],
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
    filteredFields: ['listingId', 'userId'],
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
    filteredFields: ['listingId', 'userId'],
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
    snapshot: true,
    name: 'Claim order that is not yours -> error',
    setup: shopSetup,
    filteredFields: ['listingId', 'userId'],
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
    filteredFields: ['listingId', 'userId'],
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
    filteredFields: ['listingId', 'userId'],
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
    filteredFields: ['listingId', 'userId'],
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
    filteredFields: ['listingId', 'userId'],
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
    filteredFields: ['listingId', 'userId'],
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
    filteredFields: ['listingId', 'userId'],
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
          // eslint-disable-next-line
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
        this.setupData.gameServer1.id,
        this.setupData.pogs1[0].playerId,
        { currency: 250 },
      );

      const orderRes = await this.setupData.client1.shopOrder.shopOrderControllerCreate({
        listingId: this.setupData.listing100.id,
        amount: 1,
      });

      const order = orderRes.data.data;

      const pogsResBefore = await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(
        this.setupData.gameServer1.id,
        this.setupData.pogs1[0].playerId,
      );

      expect(pogsResBefore.data.data.currency).to.be.eq(150);

      await this.setupData.client1.shopOrder.shopOrderControllerCancel(order.id);

      const pogResAfter = await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(
        this.setupData.gameServer1.id,
        this.setupData.pogs1[0].playerId,
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
        this.setupData.gameServer1.id,
        this.setupData.pogs1[0].playerId,
        { currency: 250 },
      );

      const orderRes = await this.setupData.client1.shopOrder.shopOrderControllerCreate({
        listingId: this.setupData.listing100.id,
        amount: 1,
      });

      const order = orderRes.data.data;

      const pogsResBefore = await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(
        this.setupData.gameServer1.id,
        this.setupData.pogs1[0].playerId,
      );

      expect(pogsResBefore.data.data.currency).to.be.eq(150);

      await this.client.shopListing.shopListingControllerDelete(this.setupData.listing100.id);

      const pogResAfter = await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(
        this.setupData.gameServer1.id,
        this.setupData.pogs1[0].playerId,
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
        this.setupData.gameServer1.id,
        this.setupData.pogs1[0].playerId,
        { currency: 250 },
      );

      const orderRes = await this.setupData.client1.shopOrder.shopOrderControllerCreate({
        listingId: this.setupData.listing100.id,
        amount: 1,
      });

      const order = orderRes.data.data;

      const pogsResBefore = await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(
        this.setupData.gameServer1.id,
        this.setupData.pogs1[0].playerId,
      );

      expect(pogsResBefore.data.data.currency).to.be.eq(150);

      await this.client.shopListing.shopListingControllerUpdate(this.setupData.listing100.id, { draft: true });

      const pogResAfter = await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(
        this.setupData.gameServer1.id,
        this.setupData.pogs1[0].playerId,
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
          gameServerId: this.setupData.gameServer1.id,
          items: [{ itemId: this.setupData.items[0].id, amount: 1 }],
          price: 1,
          name: 'Test item 1',
        })
      ).data.data;

      const listingGameserver2 = (
        await this.client.shopListing.shopListingControllerCreate({
          gameServerId: this.setupData.gameServer2.id,
          items: [{ itemId: this.setupData.items[0].id, amount: 1 }],
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
        filters: { gameServerId: [this.setupData.gameServer1.id] },
      });

      expect(filteredOrders.data.data).to.have.length(1);
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
