import { EventsAwaiter, expect, IntegrationTest, IShopSetup, shopSetup } from '@takaro/test';
import { HookEvents } from '../../dto/index.js';
import { describe } from 'node:test';

const group = 'EconomyUtils:Shop:Browse';

const tests = [
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    setup: shopSetup,
    name: 'Calling /shop without arguments displays help information',
    test: async function () {
      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(HookEvents.CHAT_MESSAGE, 5);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/shop',
        playerId: this.setupData.players[0].id,
      });

      expect(await events).to.have.length(5);
      expect((await events)[0].data.meta.msg).to.eq(
        'This command allows you to browse the shop and view available items.',
      );
      expect((await events)[1].data.meta.msg).to.eq('Usage: /shop [page] [item] [action]');
      expect((await events)[2].data.meta.msg).to.eq('/shop 2 - View the second page of shop items');
      expect((await events)[3].data.meta.msg).to.eq('/shop 1 3 - View details about the third item on the first page');
      expect((await events)[4].data.meta.msg).to.eq('/shop 1 3 buy - Purchase the third item on the first page');
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
        msg: '/shop 1',
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
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.utilsModule.latestVersion.id,
      });
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
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    setup: shopSetup,
    name: 'Can buy an item when not linked to a user',
    test: async function () {
      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(HookEvents.CHAT_MESSAGE, 2);
      const unlinkedPlayer = this.setupData.players[1];
      await this.client.playerOnGameserver.playerOnGameServerControllerAddCurrency(
        this.setupData.gameserver.id,
        unlinkedPlayer.id,
        { currency: 250 },
      );
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/shop 1 1 buy',
        playerId: unlinkedPlayer.id,
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
