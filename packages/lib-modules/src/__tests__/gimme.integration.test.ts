import { IntegrationTest, expect, EventsAwaiter } from '@takaro/test';
import {
  IModuleTestsSetupData,
  modulesTestSetup,
} from './setupData.integration.test.js';
import { GameEvents } from '../dto/index.js';

const group = 'gimme suite';

const tests = [
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Can give an item to a player',
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.gimmeModule.id,
        {
          userConfig: JSON.stringify({
            items: ['apple', 'banana', 'orange'],
            commands: [],
          }),
        }
      );
      const eventAwaiter = new EventsAwaiter();
      await eventAwaiter.connect(this.client);
      const events = eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE);

      await this.client.command.commandControllerTrigger(
        this.setupData.gameserver.id,
        {
          msg: '/gimme',
          player: {
            gameId: '1',
          },
        }
      );

      expect((await events).length).to.be.eq(1);
      expect((await events)[0].data.msg).to.match(
        /You received (apple|banana|orange)/
      );
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Can execute command',
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.gimmeModule.id,
        {
          userConfig: JSON.stringify({
            items: [],
            commands: ['say hello from test'],
          }),
        }
      );

      const eventAwaiter = new EventsAwaiter();
      await eventAwaiter.connect(this.client);
      const events = eventAwaiter.waitForEvents(GameEvents.LOG_LINE);

      await this.client.command.commandControllerTrigger(
        this.setupData.gameserver.id,
        {
          msg: '/gimme',
          player: {
            gameId: '1',
          },
        }
      );

      expect((await events).length).to.be.eq(1);
      expect((await events)[0].data.msg).to.match(
        /\[🗨️ Chat\] Server:  hello from test/
      );
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
