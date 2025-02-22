import { IntegrationTest, expect, IModuleTestsSetupData, modulesTestSetup, EventsAwaiter } from '@takaro/test';
import { GameEvents } from '../../dto/index.js';
import { describe } from 'node:test';

const group = 'Teleports suite';

const tests = [
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Can list teleports with /tplist',
    test: async function () {
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.teleportsModule.latestVersion.id,
      });

      const setEvents = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 3);

      await Promise.all(
        Array.from({ length: 3 }).map(async (_, i) => {
          return this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
            msg: `/settp test${i}`,
            playerId: this.setupData.players[0].id,
          });
        }),
      );

      expect((await setEvents).length).to.be.eq(3);

      for (const event of await setEvents) {
        expect(event.data.meta.msg).to.match(/Teleport test\d set\./);
      }

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 4);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/tplist',
        playerId: this.setupData.players[0].id,
      });

      expect((await events).length).to.be.eq(4);
      expect((await events)[0].data.meta.msg).to.be.eq('You have 3 teleports available');
      expect((await events)[1].data.meta.msg).to.match(/test0: \([-\d]+,[-\d]+,[-\d]+\)/);
      expect((await events)[2].data.meta.msg).to.match(/test1: \([-\d]+,[-\d]+,[-\d]+\)/);
      expect((await events)[3].data.meta.msg).to.match(/test2: \([-\d]+,[-\d]+,[-\d]+\)/);
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Public teleports show up in /tplist',
    test: async function () {
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.teleportsModule.latestVersion.id,
        userConfig: JSON.stringify({
          allowPublicTeleports: true,
        }),
      });

      const setTpEvent = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/settp test',
        playerId: this.setupData.players[0].id,
      });

      expect((await setTpEvent).length).to.be.eq(1);
      expect((await setTpEvent)[0].data.meta.msg).to.be.eq('Teleport test set.');

      const setPublicEvent = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/setpublic test',
        playerId: this.setupData.players[0].id,
      });

      expect((await setPublicEvent).length).to.be.eq(1);
      expect((await setPublicEvent)[0].data.meta.msg).to.be.eq('Teleport test is now public.');

      const setTpEvent2 = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/settp test2',
        playerId: this.setupData.players[0].id,
      });

      expect((await setTpEvent2).length).to.be.eq(1);
      expect((await setTpEvent2)[0].data.meta.msg).to.be.eq('Teleport test2 set.');

      const tpEvent = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 2);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/tplist',
        playerId: this.setupData.players[1].id,
      });

      expect((await tpEvent).length).to.be.eq(2);
      expect((await tpEvent)[0].data.meta.msg).to.be.eq('You have 1 teleport available');
      expect((await tpEvent)[1].data.meta.msg).to.match(/test: \([-\d]+,[-\d]+,[-\d]+\) \(public\)/);
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Teleports set by player A cannot be seen by player B with /tplist',
    test: async function () {
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.teleportsModule.latestVersion.id,
      });

      const setTpEvent = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/settp test',
        playerId: this.setupData.players[0].id,
      });

      expect((await setTpEvent).length).to.be.eq(1);
      expect((await setTpEvent)[0].data.meta.msg).to.be.eq('Teleport test set.');

      const tpEvent = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/tplist',
        playerId: this.setupData.players[1].id,
      });

      expect((await tpEvent).length).to.be.eq(1);
      expect((await tpEvent)[0].data.meta.msg).to.be.eq(
        'You have no teleports available, use /settp <name> to set one.',
      );
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    // eslint-disable-next-line quotes
    name: "bug repro /tplist: Player A and B have teleports set but B cannot see A's teleports",
    test: async function () {
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.teleportsModule.latestVersion.id,
      });

      const setTpEvent = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/settp test',
        playerId: this.setupData.players[0].id,
      });

      expect((await setTpEvent).length).to.be.eq(1);
      expect((await setTpEvent)[0].data.meta.msg).to.be.eq('Teleport test set.');

      const setTpEvent2 = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/settp test2',
        playerId: this.setupData.players[1].id,
      });

      expect((await setTpEvent2).length).to.be.eq(1);
      expect((await setTpEvent2)[0].data.meta.msg).to.be.eq('Teleport test2 set.');

      const tpEvent = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 2);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/tplist',
        playerId: this.setupData.players[1].id,
      });

      expect((await tpEvent).length).to.be.eq(2);
      expect((await tpEvent)[0].data.meta.msg).to.be.eq('You have 1 teleport available');
      expect((await tpEvent)[1].data.meta.msg).to.match(/test2: \([-\d]+,[-\d]+,[-\d]+\)/);
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
