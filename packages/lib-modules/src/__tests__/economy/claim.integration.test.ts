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
    setup: shopSetup,
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
    setup: shopSetup,
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
      expect((await events)[1].data.meta.msg).to.equal('1x Stone');
      expect((await events)[2].data.meta.msg).to.equal('You have received items from a shop order.');
      expect((await events)[3].data.meta.msg).to.equal('1x Wood');
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
