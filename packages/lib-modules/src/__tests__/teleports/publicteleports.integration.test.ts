import { IntegrationTest, expect } from '@takaro/test';
import { IModuleTestsSetupData, modulesTestSetup } from '@takaro/test';
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
        },
      );

      const setTpEvent = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/settp test',
        playerId: this.setupData.players[0].id,
      });

      expect((await setTpEvent).length).to.be.eq(1);
      expect((await setTpEvent)[0].data.msg).to.be.eq('Teleport test set.');

      const setPublicEvent = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/setpublic test',
        playerId: this.setupData.players[0].id,
      });

      expect((await setPublicEvent).length).to.be.eq(1);
      expect((await setPublicEvent)[0].data.msg).to.be.eq('Teleport test is now public.');

      const tpEvent = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/tp test',
        playerId: this.setupData.players[1].id,
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
        },
      );

      const setTpEvent = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/settp test',
        playerId: this.setupData.players[0].id,
      });

      expect((await setTpEvent).length).to.be.eq(1);
      expect((await setTpEvent)[0].data.msg).to.be.eq('Teleport test set.');

      const setPublicEvent = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/setpublic test',
        playerId: this.setupData.players[0].id,
      });

      expect((await setPublicEvent).length).to.be.eq(1);
      expect((await setPublicEvent)[0].data.msg).to.be.eq('Teleport test is now public.');

      const setPrivateEvent = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/setprivate test',
        playerId: this.setupData.players[0].id,
      });

      expect((await setPrivateEvent).length).to.be.eq(1);
      expect((await setPrivateEvent)[0].data.msg).to.be.eq('Teleport test is now private.');

      const tpEvent = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/tp test',
        playerId: this.setupData.players[1].id,
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
        },
      );

      const setTpEvent = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/settp test',
        playerId: this.setupData.players[0].id,
      });

      expect((await setTpEvent).length).to.be.eq(1);
      expect((await setTpEvent)[0].data.msg).to.be.eq('Teleport test set.');

      const setPublicEvent = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/setpublic test',
        playerId: this.setupData.players[0].id,
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
        },
      );

      const setTpEvent = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/settp test',
        playerId: this.setupData.players[0].id,
      });

      expect((await setTpEvent).length).to.be.eq(1);
      expect((await setTpEvent)[0].data.msg).to.be.eq('Teleport test set.');

      const setPublicEvent = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/setpublic test',
        playerId: this.setupData.players[0].id,
      });

      expect((await setPublicEvent).length).to.be.eq(1);
      expect((await setPublicEvent)[0].data.msg).to.be.eq('Teleport test is now public.');

      const tpEvent = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/tp test',
        playerId: this.setupData.players[1].id,
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
        },
      );

      const tpEvent2 = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/tp test',
        playerId: this.setupData.players[1].id,
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
      const useTeleportsRole = await this.client.permissionCodesToInputs(['TELEPORTS_USE']);
      await this.client.role.roleControllerUpdate(this.setupData.role.id, {
        permissions: [
          {
            permissionId: useTeleportsRole[0].permissionId,
            count: 3,
          },
        ],
      });

      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.teleportsModule.id,
        {
          userConfig: JSON.stringify({
            allowPublicTeleports: true,
            timeout: 0,
          }),
        },
      );

      const setTpEvent = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/settp test',
        playerId: this.setupData.players[1].id,
      });

      expect((await setTpEvent).length).to.be.eq(1);
      expect((await setTpEvent)[0].data.msg).to.be.eq('Teleport test set.');

      const setPublicEvent = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/setpublic test',
        playerId: this.setupData.players[1].id,
      });

      expect((await setPublicEvent).length).to.be.eq(1);
      expect((await setPublicEvent)[0].data.msg).to.be.eq('You do not have permission to create public teleports.');
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Prohibits players from settings more public teleports than their role allows',
    test: async function () {
      const permissionRes = await this.client.permissionCodesToInputs(['TELEPORTS_CREATE_PUBLIC', 'TELEPORTS_USE']);
      await this.client.role.roleControllerUpdate(this.setupData.role.id, {
        permissions: [
          {
            permissionId: permissionRes[0].permissionId,
            count: 3,
          },
          {
            permissionId: permissionRes[1].permissionId,
            count: 5,
          },
        ],
      });

      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.teleportsModule.id,
        {
          userConfig: JSON.stringify({
            allowPublicTeleports: true,
            timeout: 0,
          }),
        },
      );

      const setTpEvent = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 4);

      await Promise.all(
        Array.from({ length: 4 }).map(async (_, i) => {
          return this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
            msg: `/settp test${i}`,
            playerId: this.setupData.players[0].id,
          });
        }),
      );

      expect((await setTpEvent).length).to.be.eq(4);

      for (const event of await setTpEvent) {
        expect(event.data.msg).to.match(/Teleport test\d set\./);
      }

      const setPublicEvent = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 3);

      await Promise.all(
        Array.from({ length: 3 }).map(async (_, i) => {
          return this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
            msg: `/setpublic test${i}`,
            playerId: this.setupData.players[0].id,
          });
        }),
      );

      expect((await setPublicEvent).length).to.be.eq(3);

      for (const event of await setPublicEvent) {
        expect(event.data.msg).to.match(/Teleport test\d is now public\./);
      }

      const setPublicEvent2 = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/setpublic test4',
        playerId: this.setupData.players[0].id,
      });

      expect((await setPublicEvent2).length).to.be.eq(1);

      expect((await setPublicEvent2)[0].data.msg).to.be.eq(
        'You have reached the maximum number of public teleports for your role, maximum allowed is 3',
      );
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
