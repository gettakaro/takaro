import { IntegrationTest, expect } from '@takaro/test';
import { IModuleTestsSetupData, modulesTestSetup } from '../setupData.integration.test.js';
import { GameEvents } from '../../dto/index.js';

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
      const events = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE);

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

      const firstEvents = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/settp test',
        player: {
          gameId: '1',
        },
      });

      expect((await firstEvents).length).to.be.eq(1);
      expect((await firstEvents)[0].data.msg).to.be.eq('Teleport test set.');

      const secondEvents = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

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
      const setEvents = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 3);

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
      const events = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE);

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
    name: 'Can remove teleports with /deletetp',
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.teleportsModule.id
      );
      const setEvents = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 3);

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
      const events = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);
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
      const events = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE);
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
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
