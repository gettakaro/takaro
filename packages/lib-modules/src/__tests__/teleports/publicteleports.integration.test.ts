import { IntegrationTest, expect, EventsAwaiter } from '@takaro/test';
import { IModuleTestsSetupData, modulesTestSetup } from '../setupData.integration.test.js';
import { GameEvents } from '../../dto/index.js';

const group = 'Teleports suite';

const tests = [
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
