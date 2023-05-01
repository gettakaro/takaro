import { IntegrationTest, expect } from '@takaro/test';
import { GameEvents } from '@takaro/gameserver';
import {
  IModuleTestsSetupData,
  modulesTestSetup,
  IDetectedEvent,
} from './setupData.integration.test.js';

const group = 'Help command';

const sorter = (a: IDetectedEvent, b: IDetectedEvent) => {
  if (a.data.msg < b.data.msg) {
    return -1;
  }
  if (a.data.msg > b.data.msg) {
    return 1;
  }
  return 0;
};

const tests = [
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Help command responds with a list of installed commands',
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.utilsModule.id,
        {
          systemConfig: '{}',
          userConfig: '{}',
        }
      );

      await this.client.command.commandControllerTrigger(
        this.setupData.gameserver.id,
        {
          msg: '/help',
          player: {
            gameId: '1',
          },
        }
      );
      const events = await this.setupData.waitForEvent(
        GameEvents.CHAT_MESSAGE,
        3
      );

      expect(events.length).to.be.eq(3);
      const sortedEvents = events.sort(sorter);

      expect(sortedEvents[0].data.msg).to.be.eq('Available commands:');
      expect(sortedEvents[1].data.msg).to.be.eq(
        'help: The text you are reading right now, displays information about commands'
      );
      expect(sortedEvents[2].data.msg).to.be.eq(
        'ping: Replies with pong, useful for testing if the connection works'
      );
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Help command responds with a list of installed commands, picking up commands from multiple modules',
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.utilsModule.id,
        {
          systemConfig: '{}',
          userConfig: '{}',
        }
      );
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.teleportsModule.id,
        {
          systemConfig: '{}',
          userConfig: '{}',
        }
      );

      await this.client.command.commandControllerTrigger(
        this.setupData.gameserver.id,
        {
          msg: '/help',
          player: {
            gameId: '1',
          },
        }
      );

      const events = await this.setupData.waitForEvent(
        GameEvents.CHAT_MESSAGE,
        7
      );

      expect(events.length).to.be.eq(7);
      const sortedEvents = events.sort(sorter);

      expect(sortedEvents[0].data.msg).to.be.eq('Available commands:');
      expect(sortedEvents[1].data.msg).to.be.eq('deletetp: Deletes a location');
      expect(sortedEvents[2].data.msg).to.be.eq(
        'help: The text you are reading right now, displays information about commands'
      );
      expect(sortedEvents[3].data.msg).to.be.eq(
        'ping: Replies with pong, useful for testing if the connection works'
      );
      expect(sortedEvents[4].data.msg).to.be.eq(
        'settp: Sets a location to teleport to'
      );
      expect(sortedEvents[5].data.msg).to.be.eq(
        'teleport: Teleports to one of your set locations'
      );
      expect(sortedEvents[6].data.msg).to.be.eq(
        'tplist: Lists all your set locations'
      );
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Help command responds with detailed info about a specific command',
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.utilsModule.id,
        {
          systemConfig: '{}',
          userConfig: '{}',
        }
      );

      await this.client.command.commandControllerTrigger(
        this.setupData.gameserver.id,
        {
          msg: '/help ping',
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
      const sortedEvents = events.sort(sorter);

      expect(sortedEvents[0].data.msg).to.be.eq(
        'ping: Replies with pong, useful for testing if the connection works'
      );
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Help command responds with unknown command message if command does not exist',
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.utilsModule.id,
        {
          systemConfig: '{}',
          userConfig: '{}',
        }
      );

      await this.client.command.commandControllerTrigger(
        this.setupData.gameserver.id,
        {
          msg: '/help foobar',
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
      expect(events[0].data.msg).to.be.eq(
        'Unknown command "foobar", use this command without arguments to see all available commands.'
      );
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
