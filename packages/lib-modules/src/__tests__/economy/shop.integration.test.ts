import { EventsAwaiter, expect, IntegrationTest, IShopSetup, shopSetup } from '@takaro/test';
import { HookEvents } from '../../dto/index.js';

const group = 'EconomyUtils:Shop:Browse';

const tests = [
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    setup: shopSetup,
    name: 'Can view the first page of shop items',
    test: async function () {
      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(HookEvents.CHAT_MESSAGE, 2);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/shop',
        playerId: this.setupData.players[0].id,
      });

      expect(await events).to.have.length(2);
      expect((await events)[0].data.meta.msg).to.eq('- Test item - 100 test coin. 1x Stone');
      expect((await events)[1].data.meta.msg).to.eq('- Test item 2 - 33 test coin. 1x Wood');
    },
  }),
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    setup: shopSetup,
    name: 'First page shows the first 5 items',
    test: async function () {
      await this.setupData.createListings(this.client, { gameServerId: this.setupData.gameserver.id, amount: 5 });
      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(HookEvents.CHAT_MESSAGE, 5);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/shop',
        playerId: this.setupData.players[0].id,
      });

      console.log(JSON.stringify((await events)[0].data.meta.msg, null, 2));
      expect(await events).to.have.length(5);
    },
  }),
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    setup: shopSetup,
    name: 'Can view the second page of shop items',
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.utilsModule.id,
      );
      await this.setupData.createListings(this.client, { gameServerId: this.setupData.gameserver.id, amount: 5 });
      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(HookEvents.CHAT_MESSAGE, 3);
      const commandExecutedEvent = (await new EventsAwaiter().connect(this.client)).waitForEvents(
        HookEvents.COMMAND_EXECUTED,
        1,
      );
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/shop 2',
        playerId: this.setupData.players[0].id,
      });

      await commandExecutedEvent;

      // We trigger the ping command to make sure we can see the FULL output of the previous command
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/ping',
        playerId: this.setupData.players[0].id,
      });

      expect(await events).to.have.length(3);
      expect((await events)[(await events).length - 1].data.meta.msg).to.eq('Pong!');
    },
  }),
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    setup: shopSetup,
    name: 'When no items are available, shows a message',
    test: async function () {
      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(HookEvents.CHAT_MESSAGE, 1);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/shop 5',
        playerId: this.setupData.players[0].id,
      });

      expect(await events).to.have.length(1);
      expect((await events)[0].data.meta.msg).to.equal('No items found.');
    },
  }),
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    setup: shopSetup,
    name: 'Can show details about an item',
    test: async function () {
      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(HookEvents.CHAT_MESSAGE, 2);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/shop 1 1',
        playerId: this.setupData.players[0].id,
      });

      expect(await events).to.have.length(2);
      expect((await events)[0].data.meta.msg).to.equal('Listing Test item - 100 test coin');
      expect((await events)[1].data.meta.msg).to.equal('- 1x Stone.  Description: Stone can get you stoned');
    },
  }),
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    setup: shopSetup,
    name: 'Shows an error when requesting details for an invalid item',
    test: async function () {
      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(HookEvents.CHAT_MESSAGE, 1);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/shop 1 5',
        playerId: this.setupData.players[0].id,
      });

      expect(await events).to.have.length(1);
      expect((await events)[0].data.meta.msg).to.equal(
        'Item not found. Please select an item from the list, valid options are 1-2.',
      );
    },
  }),

  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    setup: shopSetup,
    name: 'Can buy an item',
    test: async function () {
      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(HookEvents.CHAT_MESSAGE, 1);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/shop 1 1 buy',
        playerId: this.setupData.players[0].id,
      });

      expect(await events).to.have.length(1);
      expect((await events)[0].data.meta.msg).to.equal(
        'You have purchased Test item for 100 test coin. You can now claim your items.',
      );
    },
  }),
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    setup: shopSetup,
    name: 'Buying an item automatically claims it',
    test: async function () {
      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(HookEvents.CHAT_MESSAGE, 2);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/shop 1 1 buy',
        playerId: this.setupData.players[0].id,
      });

      expect(await events).to.have.length(2);
      expect((await events)[0].data.meta.msg).to.equal('You have purchased Test item for 100 test coin.');
      expect((await events)[1].data.meta.msg).to.equal('You have received items from a shop order.');
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
