import { faker } from '@faker-js/faker';
import { Client, ShopListingOutputDTO, UserOutputDTO } from '@takaro/apiclient';

import {
  EventsAwaiter,
  integrationConfig,
  expect,
  modulesTestSetup,
  IModuleTestsSetupData,
  IntegrationTest,
} from '@takaro/test';
import { HookEvents } from '../dto/index.js';

const group = 'EconomyUtils:Shop';

interface IShopSetup extends IModuleTestsSetupData {
  userClient: Client;
  listing100: ShopListingOutputDTO;
  listing33: ShopListingOutputDTO;
}

async function createUserForPlayer(client: Client, playerId: string, gameServerId: string) {
  const password = 'shop-tester-password-very-safe';

  let user: UserOutputDTO | null = null;

  user = (
    await client.user.userControllerCreate({
      name: 'test',
      email: `test-${faker.internet.email()}`,
      password,
    })
  ).data.data;

  const userClient = new Client({ auth: { username: user.email, password }, url: integrationConfig.get('host') });
  await userClient.login();

  const eventsAwaiter = new EventsAwaiter();
  await eventsAwaiter.connect(client);
  const chatEventWaiter = eventsAwaiter.waitForEvents(HookEvents.CHAT_MESSAGE);
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

async function setupShop(client: Client, gameServerId: string) {
  const items = (await client.item.itemControllerSearch()).data.data;

  const listing100Res = await client.shopListing.shopListingControllerCreate({
    gameServerId: gameServerId,
    items: [{ itemId: items[0].id, amount: 1 }],
    price: 100,
    name: 'Test item',
  });

  const listing33Res = await client.shopListing.shopListingControllerCreate({
    gameServerId: gameServerId,
    items: [{ itemId: items[1].id, amount: 1 }],
    price: 33,
    name: 'Test item 2',
  });

  return {
    listing100: listing100Res.data.data,
    listing33: listing33Res.data.data,
  };
}

const customSetup = async function (this: IntegrationTest<IShopSetup>): Promise<IShopSetup> {
  const setupData = await modulesTestSetup.bind(this as unknown as IntegrationTest<IModuleTestsSetupData>)();

  await this.client.settings.settingsControllerSet('economyEnabled', {
    value: 'true',
    gameServerId: setupData.gameserver.id,
  });

  await this.client.settings.settingsControllerSet('economyEnabled', {
    value: 'true',
  });
  await this.client.settings.settingsControllerSet('currencyName', {
    gameServerId: setupData.gameserver.id,
    value: 'test coin',
  });

  await this.client.gameserver.gameServerControllerInstallModule(
    setupData.gameserver.id,
    setupData.economyUtilsModule.id,
  );

  const { client: userClient } = await createUserForPlayer(
    this.client,
    setupData.players[0].id,
    setupData.gameserver.id,
  );
  const { listing100, listing33 } = await setupShop(this.client, setupData.gameserver.id);

  await this.client.playerOnGameserver.playerOnGameServerControllerAddCurrency(
    setupData.gameserver.id,
    setupData.players[0].id,
    { currency: 250 },
  );

  return { ...setupData, userClient, listing100, listing33 };
};

const tests = [
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    setup: customSetup,
    name: 'Can claim an order happy path',
    test: async function () {
      await this.setupData.userClient.shopOrder.shopOrderControllerCreate({
        listingId: this.setupData.listing100.id,
        amount: 1,
      });
      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(HookEvents.CHAT_MESSAGE, 1);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/claim',
        playerId: this.setupData.players[0].id,
      });

      expect(await events).to.have.length(1);
      expect((await events)[0].data.meta.msg).to.equal('You have received items from a shop order.');
    },
  }),
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    setup: customSetup,
    name: 'Shows a friendly error when there are no pending orders',
    test: async function () {
      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(HookEvents.CHAT_MESSAGE, 1);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/claim',
        playerId: this.setupData.players[0].id,
      });

      expect(await events).to.have.length(1);
      expect((await events)[0].data.meta.msg).to.equal('You have no pending orders.');
    },
  }),
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    setup: customSetup,
    name: 'Handles double-claiming an order',
    test: async function () {
      await this.setupData.userClient.shopOrder.shopOrderControllerCreate({
        listingId: this.setupData.listing100.id,
        amount: 1,
      });
      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(HookEvents.CHAT_MESSAGE, 1);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/claim',
        playerId: this.setupData.players[0].id,
      });

      expect(await events).to.have.length(1);
      expect((await events)[0].data.meta.msg).to.equal('You have received items from a shop order.');

      const secondEvents = (await new EventsAwaiter().connect(this.client)).waitForEvents(HookEvents.CHAT_MESSAGE, 1);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/claim',
        playerId: this.setupData.players[0].id,
      });

      expect(await secondEvents).to.have.length(1);
      expect((await secondEvents)[0].data.meta.msg).to.equal('You have no pending orders.');
    },
  }),
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    setup: customSetup,
    name: 'Only claims the first order by default',
    test: async function () {
      await this.setupData.userClient.shopOrder.shopOrderControllerCreate({
        listingId: this.setupData.listing100.id,
        amount: 1,
      });
      await this.setupData.userClient.shopOrder.shopOrderControllerCreate({
        listingId: this.setupData.listing33.id,
        amount: 1,
      });

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(HookEvents.CHAT_MESSAGE, 1);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/claim',
        playerId: this.setupData.players[0].id,
      });

      expect(await events).to.have.length(1);
      expect((await events)[0].data.meta.msg).to.equal('You have received items from a shop order.');

      const secondEvents = (await new EventsAwaiter().connect(this.client)).waitForEvents(HookEvents.CHAT_MESSAGE, 1);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/claim',
        playerId: this.setupData.players[0].id,
      });

      expect(await secondEvents).to.have.length(1);
      expect((await secondEvents)[0].data.meta.msg).to.equal('You have received items from a shop order.');
    },
  }),

  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    setup: customSetup,
    name: 'Can claim all orders in one go',
    test: async function () {
      await this.setupData.userClient.shopOrder.shopOrderControllerCreate({
        listingId: this.setupData.listing100.id,
        amount: 1,
      });
      await this.setupData.userClient.shopOrder.shopOrderControllerCreate({
        listingId: this.setupData.listing33.id,
        amount: 1,
      });

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(HookEvents.CHAT_MESSAGE, 4);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/claim true',
        playerId: this.setupData.players[0].id,
      });

      expect(await events).to.have.length(4);
      expect((await events)[0].data.meta.msg).to.equal('You have received items from a shop order.');
      expect((await events)[1].data.meta.msg).to.equal('1x Wood');
      expect((await events)[2].data.meta.msg).to.equal('You have received items from a shop order.');
      expect((await events)[3].data.meta.msg).to.equal('1x Stone');
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
