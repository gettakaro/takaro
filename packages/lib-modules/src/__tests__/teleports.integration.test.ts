import { IntegrationTest, expect } from '@takaro/test';
import { GameEvents } from '@takaro/gameserver';
import {
  IModuleTestsSetupData,
  modulesTestSetup,
} from './setupData.integration.test.js';

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

      await this.client.command.commandControllerTrigger(
        this.setupData.gameserver.id,
        {
          msg: '/settp test',
          player: {
            gameId: '1',
          },
        }
      );
      const events = await this.setupData.waitForEvent(GameEvents.CHAT_MESSAGE);

      expect(events.length).to.be.eq(1);
      expect(events[0].data.msg).to.be.eq('Teleport test set.');
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

      await this.client.command.commandControllerTrigger(
        this.setupData.gameserver.id,
        {
          msg: '/settp test',
          player: {
            gameId: '1',
          },
        }
      );

      const firstEvents = await this.setupData.waitForEvent(
        GameEvents.CHAT_MESSAGE,
        1
      );
      expect(firstEvents.length).to.be.eq(1);
      expect(firstEvents[0].data.msg).to.be.eq('Teleport test set.');

      await this.client.command.commandControllerTrigger(
        this.setupData.gameserver.id,
        {
          msg: '/settp test',
          player: {
            gameId: '1',
          },
        }
      );

      const secondEvents = await this.setupData.waitForEvent(
        GameEvents.CHAT_MESSAGE,
        1
      );
      expect(secondEvents.length).to.be.eq(1);
      expect(secondEvents[0].data.msg).to.be.eq(
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

      await Promise.all(
        Array.from({ length: 3 }).map(async (_, i) => {
          return this.client.command.commandControllerTrigger(
            this.setupData.gameserver.id,
            {
              msg: `/settp test${i}`,
              player: {
                gameId: '1',
              },
            }
          );
        })
      );

      const setEvents = await this.setupData.waitForEvent(
        GameEvents.CHAT_MESSAGE,
        3
      );
      expect(setEvents.length).to.be.eq(3);

      for (const event of setEvents) {
        expect(event.data.msg).to.match(/Teleport test\d set\./);
      }

      await this.client.command.commandControllerTrigger(
        this.setupData.gameserver.id,
        {
          msg: '/settp test',
          player: {
            gameId: '1',
          },
        }
      );

      const events = await this.setupData.waitForEvent(GameEvents.CHAT_MESSAGE);

      expect(events.length).to.be.eq(1);
      expect(events[0].data.msg).to.be.eq(
        'You have reached the maximum number of teleports, maximum allowed is 3'
      );
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Can teleport with /teleport',
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.teleportsModule.id
      );

      await this.client.command.commandControllerTrigger(
        this.setupData.gameserver.id,
        {
          msg: '/settp test',
          player: {
            gameId: '1',
          },
        }
      );

      const setEvents = await this.setupData.waitForEvent(
        GameEvents.CHAT_MESSAGE,
        1
      );
      expect(setEvents.length).to.be.eq(1);
      expect(setEvents[0].data.msg).to.be.eq('Teleport test set.');

      await this.client.command.commandControllerTrigger(
        this.setupData.gameserver.id,
        {
          msg: '/teleport test',
          player: {
            gameId: '1',
          },
        }
      );
      const events = await this.setupData.waitForEvent(
        GameEvents.CHAT_MESSAGE,
        1
      );
      expect(events.length).to.be.eq(1);
      expect(events[0].data.msg).to.be.eq('Teleported to test.');
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

      await this.client.command.commandControllerTrigger(
        this.setupData.gameserver.id,
        {
          msg: '/teleport test',
          player: {
            gameId: '1',
          },
        }
      );

      const events = await this.setupData.waitForEvent(GameEvents.CHAT_MESSAGE);

      expect(events.length).to.be.eq(1);
      expect(events[0].data.msg).to.be.eq('Teleport test does not exist.');
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

      await Promise.all(
        Array.from({ length: 3 }).map(async (_, i) => {
          return this.client.command.commandControllerTrigger(
            this.setupData.gameserver.id,
            {
              msg: `/settp test${i}`,
              player: {
                gameId: '1',
              },
            }
          );
        })
      );

      const setEvents = await this.setupData.waitForEvent(
        GameEvents.CHAT_MESSAGE,
        3
      );

      expect(setEvents.length).to.be.eq(3);

      for (const event of setEvents) {
        expect(event.data.msg).to.match(/Teleport test\d set\./);
      }

      await this.client.command.commandControllerTrigger(
        this.setupData.gameserver.id,
        {
          msg: '/tplist',
          player: {
            gameId: '1',
          },
        }
      );

      const events = await this.setupData.waitForEvent(
        GameEvents.CHAT_MESSAGE,
        4
      );

      expect(events.length).to.be.eq(4);
      expect(events[0].data.msg).to.be.eq('You have 3 teleports set');
      //  - test0: 61, -262, -52
      expect(events[1].data.msg).to.match(/ - test0: [-\d]+, [-\d]+, [-\d]+/);
      expect(events[2].data.msg).to.match(/ - test1: [-\d]+, [-\d]+, [-\d]+/);
      expect(events[3].data.msg).to.match(/ - test2: [-\d]+, [-\d]+, [-\d]+/);
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

      await Promise.all(
        Array.from({ length: 3 }).map(async (_, i) => {
          return this.client.command.commandControllerTrigger(
            this.setupData.gameserver.id,
            {
              msg: `/settp test${i}`,
              player: {
                gameId: '1',
              },
            }
          );
        })
      );

      const setEvents = await this.setupData.waitForEvent(
        GameEvents.CHAT_MESSAGE,
        3
      );

      expect(setEvents.length).to.be.eq(3);

      for (const event of setEvents) {
        expect(event.data.msg).to.match(/Teleport test\d set\./);
      }

      await this.client.command.commandControllerTrigger(
        this.setupData.gameserver.id,
        {
          msg: '/deletetp test1',
          player: {
            gameId: '1',
          },
        }
      );

      const events = await this.setupData.waitForEvent(
        GameEvents.CHAT_MESSAGE,
        1
      );

      expect(events.length).to.be.eq(1);
      expect(events[0].data.msg).to.be.eq('Teleport test1 deleted.');
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

      await this.client.command.commandControllerTrigger(
        this.setupData.gameserver.id,
        {
          msg: '/deletetp test',
          player: {
            gameId: '1',
          },
        }
      );

      const events = await this.setupData.waitForEvent(GameEvents.CHAT_MESSAGE);

      expect(events.length).to.be.eq(1);
      expect(events[0].data.msg).to.be.eq('Teleport test does not exist.');
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
