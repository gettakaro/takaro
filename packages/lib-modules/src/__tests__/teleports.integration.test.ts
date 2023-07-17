import { IntegrationTest, expect, EventsAwaiter } from '@takaro/test';
import { IModuleTestsSetupData, modulesTestSetup } from './setupData.integration.test.js';
import { GameEvents } from '../dto/index.js';

const group = 'Teleports suite';

const tests = [
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Can set a teleport with /settp',
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.teleportsModule.id
      );
      const eventAwaiter = new EventsAwaiter();
      await eventAwaiter.connect(this.client);
      const events = eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/settp test',
        player: {
          gameId: '1',
        },
      });

      expect((await events).length).to.be.eq(1);
      expect((await events)[0].data.msg).to.be.eq('Teleport test set.');
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Shows an error when setting a teleport with an existing name',
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.teleportsModule.id
      );

      const eventAwaiter = new EventsAwaiter();
      await eventAwaiter.connect(this.client);
      const firstEvents = eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/settp test',
        player: {
          gameId: '1',
        },
      });

      expect((await firstEvents).length).to.be.eq(1);
      expect((await firstEvents)[0].data.msg).to.be.eq('Teleport test set.');

      const secondEvents = eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/settp test',
        player: {
          gameId: '1',
        },
      });

      expect((await secondEvents).length).to.be.eq(1);
      expect((await secondEvents)[0].data.msg).to.be.eq(
        'Teleport test already exists, use /deletetp test to delete it.'
      );
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Cannot set more than the user-defined amount of max teleports',
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.teleportsModule.id,
        {
          userConfig: JSON.stringify({ maxTeleports: 3 }),
        }
      );
      const eventAwaiter = new EventsAwaiter();
      await eventAwaiter.connect(this.client);
      const setEvents = eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 3);

      await Promise.all(
        Array.from({ length: 3 }).map(async (_, i) => {
          return this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
            msg: `/settp test${i}`,
            player: {
              gameId: '1',
            },
          });
        })
      );

      expect((await setEvents).length).to.be.eq(3);

      for (const event of await setEvents) {
        expect(event.data.msg).to.match(/Teleport test\d set\./);
      }
      const events = eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/settp test',
        player: {
          gameId: '1',
        },
      });

      expect((await events).length).to.be.eq(1);
      expect((await events)[0].data.msg).to.be.eq(
        'You have reached the maximum number of teleports, maximum allowed is 3'
      );
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Can teleport with /tp',
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.teleportsModule.id
      );

      const eventAwaiter = new EventsAwaiter();
      await eventAwaiter.connect(this.client);
      const setEvents = eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/settp test',
        player: {
          gameId: '1',
        },
      });

      expect((await setEvents).length).to.be.eq(1);
      expect((await setEvents)[0].data.msg).to.be.eq('Teleport test set.');

      const events = eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/tp test',
        player: {
          gameId: '1',
        },
      });

      expect((await events).length).to.be.eq(1);
      expect((await events)[0].data.msg).to.be.eq('Teleported to test.');
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Shows an error when teleporting to a non-existing teleport',
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.teleportsModule.id
      );
      const eventAwaiter = new EventsAwaiter();
      await eventAwaiter.connect(this.client);
      const events = eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/tp test',
        player: {
          gameId: '1',
        },
      });

      expect((await events).length).to.be.eq(1);
      expect((await events)[0].data.msg).to.be.eq('Teleport test does not exist.');
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Can list teleports with /tplist',
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.teleportsModule.id
      );

      const eventAwaiter = new EventsAwaiter();
      await eventAwaiter.connect(this.client);
      const setEvents = eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 3);

      await Promise.all(
        Array.from({ length: 3 }).map(async (_, i) => {
          return this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
            msg: `/settp test${i}`,
            player: {
              gameId: '1',
            },
          });
        })
      );

      expect((await setEvents).length).to.be.eq(3);

      for (const event of await setEvents) {
        expect(event.data.msg).to.match(/Teleport test\d set\./);
      }

      const events = eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 4);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/tplist',
        player: {
          gameId: '1',
        },
      });

      expect((await events).length).to.be.eq(4);
      expect((await events)[0].data.msg).to.be.eq('You have 3 teleports available');
      //  - test0: 61, -262, -52
      expect((await events)[1].data.msg).to.match(/ - test0: [-\d]+, [-\d]+, [-\d]+/);
      expect((await events)[2].data.msg).to.match(/ - test1: [-\d]+, [-\d]+, [-\d]+/);
      expect((await events)[3].data.msg).to.match(/ - test2: [-\d]+, [-\d]+, [-\d]+/);
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Can remove teleports with /deletetp',
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.teleportsModule.id
      );
      const eventAwaiter = new EventsAwaiter();
      await eventAwaiter.connect(this.client);
      const setEvents = eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 3);

      await Promise.all(
        Array.from({ length: 3 }).map(async (_, i) => {
          return this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
            msg: `/settp test${i}`,
            player: {
              gameId: '1',
            },
          });
        })
      );

      expect((await setEvents).length).to.be.eq(3);

      for (const event of await setEvents) {
        expect(event.data.msg).to.match(/Teleport test\d set\./);
      }
      const events = eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/deletetp test1',
        player: {
          gameId: '1',
        },
      });

      expect((await events).length).to.be.eq(1);
      expect((await events)[0].data.msg).to.be.eq('Teleport test1 deleted.');
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Shows an error when removing a non-existing teleport',
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.teleportsModule.id
      );
      const eventAwaiter = new EventsAwaiter();
      await eventAwaiter.connect(this.client);
      const events = eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/deletetp test',
        player: {
          gameId: '1',
        },
      });

      expect((await events).length).to.be.eq(1);
      expect((await events)[0].data.msg).to.be.eq('Teleport test does not exist.');
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Times out when teleporting faster than set timeout',
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.teleportsModule.id,
        {
          userConfig: JSON.stringify({
            timeout: 5000,
          }),
        }
      );
      const eventAwaiter = new EventsAwaiter();
      await eventAwaiter.connect(this.client);

      const setTpEvent = eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/settp test',
        player: {
          gameId: '1',
        },
      });

      expect((await setTpEvent).length).to.be.eq(1);

      const tpEvent = eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/tp test',
        player: {
          gameId: '1',
        },
      });

      expect((await tpEvent)[0].data.msg).to.be.eq('Teleported to test.');

      const tpTimeoutEvent = eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/tp test',
        player: {
          gameId: '1',
        },
      });

      expect((await tpTimeoutEvent)[0].data.msg).to.be.eq('You cannot teleport yet. Please wait before trying again.');
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Can set teleports as public, allowing other players to use it',
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.teleportsModule.id,
        {
          userConfig: JSON.stringify({
            allowPublicTeleports: true,
          }),
        }
      );
      const eventAwaiter = new EventsAwaiter();
      await eventAwaiter.connect(this.client);

      const setTpEvent = eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/settp test',
        player: {
          gameId: '1',
        },
      });

      expect((await setTpEvent).length).to.be.eq(1);
      expect((await setTpEvent)[0].data.msg).to.be.eq('Teleport test set.');

      const setPublicEvent = eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/setpublic test',
        player: {
          gameId: '1',
        },
      });

      expect((await setPublicEvent).length).to.be.eq(1);
      expect((await setPublicEvent)[0].data.msg).to.be.eq('Teleport test is now public.');

      const tpEvent = eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/tp test',
        player: {
          gameId: '2',
        },
      });

      expect((await tpEvent)[0].data.msg).to.be.eq('Teleported to test.');
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Can set public teleports as private again',
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.teleportsModule.id,
        {
          userConfig: JSON.stringify({
            allowPublicTeleports: true,
          }),
        }
      );
      const eventAwaiter = new EventsAwaiter();
      await eventAwaiter.connect(this.client);

      const setTpEvent = eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/settp test',
        player: {
          gameId: '1',
        },
      });

      expect((await setTpEvent).length).to.be.eq(1);
      expect((await setTpEvent)[0].data.msg).to.be.eq('Teleport test set.');

      const setPublicEvent = eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/setpublic test',
        player: {
          gameId: '1',
        },
      });

      expect((await setPublicEvent).length).to.be.eq(1);
      expect((await setPublicEvent)[0].data.msg).to.be.eq('Teleport test is now public.');

      const setPrivateEvent = eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/setprivate test',
        player: {
          gameId: '1',
        },
      });

      expect((await setPrivateEvent).length).to.be.eq(1);
      expect((await setPrivateEvent)[0].data.msg).to.be.eq('Teleport test is now private.');

      const tpEvent = eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/tp test',
        player: {
          gameId: '2',
        },
      });

      expect((await tpEvent)[0].data.msg).to.be.eq('Teleport test does not exist.');
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Public teleports show up in /tplist',
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.teleportsModule.id,
        {
          userConfig: JSON.stringify({
            allowPublicTeleports: true,
          }),
        }
      );
      const eventAwaiter = new EventsAwaiter();
      await eventAwaiter.connect(this.client);

      const setTpEvent = eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/settp test',
        player: {
          gameId: '1',
        },
      });

      expect((await setTpEvent).length).to.be.eq(1);
      expect((await setTpEvent)[0].data.msg).to.be.eq('Teleport test set.');

      const setPublicEvent = eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/setpublic test',
        player: {
          gameId: '1',
        },
      });

      expect((await setPublicEvent).length).to.be.eq(1);
      expect((await setPublicEvent)[0].data.msg).to.be.eq('Teleport test is now public.');

      const setTpEvent2 = eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/settp test2',
        player: {
          gameId: '1',
        },
      });

      expect((await setTpEvent2).length).to.be.eq(1);
      expect((await setTpEvent2)[0].data.msg).to.be.eq('Teleport test2 set.');

      const tpEvent = eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 2);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/tplist',
        player: {
          gameId: '2',
        },
      });

      expect((await tpEvent).length).to.be.eq(2);
      expect((await tpEvent)[0].data.msg).to.be.eq('You have 1 teleport available');
      expect((await tpEvent)[1].data.msg).to.match(/ - test: [-\d]+, [-\d]+, [-\d]+ \(public\)/);
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'When configured to not allow public teleports, creating public teleports is not allowed',
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.teleportsModule.id,
        {
          userConfig: JSON.stringify({
            allowPublicTeleports: false,
            timeout: 0,
          }),
        }
      );

      const eventAwaiter = new EventsAwaiter();
      await eventAwaiter.connect(this.client);

      const setTpEvent = eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/settp test',
        player: {
          gameId: '1',
        },
      });

      expect((await setTpEvent).length).to.be.eq(1);
      expect((await setTpEvent)[0].data.msg).to.be.eq('Teleport test set.');

      const setPublicEvent = eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/setpublic test',
        player: {
          gameId: '1',
        },
      });

      expect((await setPublicEvent).length).to.be.eq(1);
      expect((await setPublicEvent)[0].data.msg).to.be.eq('Public teleports are disabled.');
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'When configured to not allow public teleports, players cannot teleport to public teleports',
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.teleportsModule.id,
        {
          userConfig: JSON.stringify({
            allowPublicTeleports: true,
            timeout: 0,
          }),
        }
      );

      const eventAwaiter = new EventsAwaiter();
      await eventAwaiter.connect(this.client);

      const setTpEvent = eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/settp test',
        player: {
          gameId: '1',
        },
      });

      expect((await setTpEvent).length).to.be.eq(1);
      expect((await setTpEvent)[0].data.msg).to.be.eq('Teleport test set.');

      const setPublicEvent = eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/setpublic test',
        player: {
          gameId: '1',
        },
      });

      expect((await setPublicEvent).length).to.be.eq(1);
      expect((await setPublicEvent)[0].data.msg).to.be.eq('Teleport test is now public.');

      const tpEvent = eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/tp test',
        player: {
          gameId: '2',
        },
      });

      expect((await tpEvent).length).to.be.eq(1);
      expect((await tpEvent)[0].data.msg).to.be.eq('Teleported to test.');

      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.teleportsModule.id,
        {
          userConfig: JSON.stringify({
            allowPublicTeleports: false,
            timeout: 0,
          }),
        }
      );

      const tpEvent2 = eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/tp test',
        player: {
          gameId: '2',
        },
      });

      expect((await tpEvent2).length).to.be.eq(1);
      expect((await tpEvent2)[0].data.msg).to.be.eq('Teleport test does not exist.');
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'If player does not have role to create public teleports, command gets denied',
    test: async function () {
      await this.client.role.roleControllerUpdate(this.setupData.role.id, {
        name: this.setupData.role.name,
        permissions: ['TELEPORTS_USE'],
      });

      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.teleportsModule.id,
        {
          userConfig: JSON.stringify({
            allowPublicTeleports: true,
            timeout: 0,
          }),
        }
      );

      const eventAwaiter = new EventsAwaiter();
      await eventAwaiter.connect(this.client);

      const setTpEvent = eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/settp test',
        player: {
          gameId: '2',
        },
      });

      expect((await setTpEvent).length).to.be.eq(1);
      expect((await setTpEvent)[0].data.msg).to.be.eq('Teleport test set.');

      const setPublicEvent = eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/setpublic test',
        player: {
          gameId: '2',
        },
      });

      expect((await setPublicEvent).length).to.be.eq(1);
      expect((await setPublicEvent)[0].data.msg).to.be.eq('You do not have permission to create public teleports.');
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
