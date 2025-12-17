import { EventsAwaiter, expect, IntegrationTest, IShopSetup, shopSetup } from '@takaro/test';
import { HookEvents } from '../../dto/index.js';
import { describe } from 'node:test';

const group = 'EconomyUtils:Shop:Claim';

const tests = [
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    setup: shopSetup,
    name: 'Can claim an order happy path',
    test: async function () {
      await this.setupData.client1.shopOrder.shopOrderControllerCreate({
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
    setup: shopSetup,
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
    setup: shopSetup,
    name: 'Handles double-claiming an order',
    test: async function () {
      await this.setupData.client1.shopOrder.shopOrderControllerCreate({
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
    setup: shopSetup,
    name: 'Only claims the first order by default',
    test: async function () {
      await this.setupData.client1.shopOrder.shopOrderControllerCreate({
        listingId: this.setupData.listing100.id,
        amount: 1,
      });
      await this.setupData.client1.shopOrder.shopOrderControllerCreate({
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
    setup: shopSetup,
    name: 'Can claim all orders in one go',
    test: async function () {
      await this.setupData.client1.shopOrder.shopOrderControllerCreate({
        listingId: this.setupData.listing100.id,
        amount: 1,
      });
      await this.setupData.client1.shopOrder.shopOrderControllerCreate({
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
      expect((await events)[1].data.meta.msg).to.equal('1x Stone');
      expect((await events)[2].data.meta.msg).to.equal('You have received items from a shop order.');
      expect((await events)[3].data.meta.msg).to.equal('1x Wood');
    },
  }),
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    setup: shopSetup,
    name: 'Should only claim orders from the current game server when player has orders on multiple servers',
    test: async function () {
      // Test scenario: Player has pending orders on two servers but is only online on one.
      // The /claim command should only claim orders from the server where they're currently online.

      // Install economyUtils on gameserver2
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver2.id,
        versionId: this.setupData.economyUtilsModule.latestVersion.id,
      });

      await this.client.settings.settingsControllerSet('economyEnabled', {
        value: 'true',
        gameServerId: this.setupData.gameserver2.id,
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Create player on gameserver2 as online, then disconnect to set offline
      // (Must create as online to trigger POG creation via PLAYER_CONNECTED event)
      await this.client.gameserver.gameServerControllerExecuteCommand(this.setupData.gameserver2.id, {
        command: `createPlayer player2_${this.setupData.players[0].steamId} {"name": "${this.setupData.players[0].name}", "steamId": "${this.setupData.players[0].steamId}", "online": true}`,
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const pogsOnServer2 = await this.client.playerOnGameserver.playerOnGameServerControllerSearch({
        filters: {
          gameServerId: [this.setupData.gameserver2.id],
          playerId: [this.setupData.players[0].id],
        },
      });

      if (pogsOnServer2.data.data.length === 0) {
        throw new Error(`Player POG was not created on gameserver2. Player ID: ${this.setupData.players[0].id}`);
      }

      await this.client.gameserver.gameServerControllerExecuteCommand(this.setupData.gameserver2.id, {
        command: `disconnectPlayer ${this.setupData.players[0].steamId}`,
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      await this.client.playerOnGameserver.playerOnGameServerControllerAddCurrency(
        this.setupData.gameserver2.id,
        this.setupData.players[0].id,
        { currency: 250 },
      );

      // Create listings on both servers
      const listingServer1 = await this.client.shopListing.shopListingControllerCreate({
        gameServerId: this.setupData.gameserver.id,
        items: [{ itemId: this.setupData.items[0].id, amount: 1 }],
        price: 50,
        name: 'Server 1 Item',
      });

      const listingServer2 = await this.client.shopListing.shopListingControllerCreate({
        gameServerId: this.setupData.gameserver2.id,
        items: [{ itemId: this.setupData.items2[0].id, amount: 1 }],
        price: 75,
        name: 'Server 2 Item',
      });

      // Create order on server 2 first (older), then server 1 (newer)
      const orderServer2 = await this.setupData.client1.shopOrder.shopOrderControllerCreate({
        listingId: listingServer2.data.data.id,
        amount: 1,
      });

      const orderServer1 = await this.setupData.client1.shopOrder.shopOrderControllerCreate({
        listingId: listingServer1.data.data.id,
        amount: 1,
      });

      // Verify both orders start as PAID
      const orderServer1Status = await this.client.shopOrder.shopOrderControllerGetOne(orderServer1.data.data.id);
      const orderServer2Status = await this.client.shopOrder.shopOrderControllerGetOne(orderServer2.data.data.id);
      expect(orderServer1Status.data.data.status).to.equal('PAID');
      expect(orderServer2Status.data.data.status).to.equal('PAID');

      // Claim on gameserver where player is online
      const claimEvents = (await new EventsAwaiter().connect(this.client)).waitForEvents(HookEvents.CHAT_MESSAGE, 2);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/claim',
        playerId: this.setupData.players[0].id,
      });

      const messages = await claimEvents;

      expect(messages).to.have.length(2);
      expect(messages[0].data.meta.msg).to.equal('You have received items from a shop order.');
      expect(messages[1].data.meta.msg).to.match(/1x/);

      // Verify only the server 1 order was claimed
      const claimedOrderServer1 = await this.client.shopOrder.shopOrderControllerGetOne(orderServer1.data.data.id);
      expect(claimedOrderServer1.data.data.status).to.equal('COMPLETED');

      // Server 2 order should remain unclaimed
      const unclaimedOrderServer2 = await this.client.shopOrder.shopOrderControllerGetOne(orderServer2.data.data.id);
      expect(unclaimedOrderServer2.data.data.status).to.equal('PAID');
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
