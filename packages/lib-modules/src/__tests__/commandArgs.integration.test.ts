import { IntegrationTest, expect, EventsAwaiter } from '@takaro/test';
import { IModuleTestsSetupData, modulesTestSetup } from './setupData.integration.test.js';
import { GameEvents } from '../dto/gameEvents.js';

const group = 'Command args';

const tests = [
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Sends a clear error when passing invalid arguments (passing string to number args)',
    test: async function () {
      const moduleRes = await this.client.module.moduleControllerCreate({
        name: 'test',
      });

      await this.client.command.commandControllerCreate({
        name: 'test',
        trigger: 'test',
        moduleId: moduleRes.data.data.id,
        arguments: [
          {
            name: 'test',
            type: 'number',
            position: 0,
          },
        ],
      });

      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        moduleRes.data.data.id
      );

      const eventAwaiter = new EventsAwaiter();
      await eventAwaiter.connect(this.client);
      const events = eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/test "test"',
        playerId: this.setupData.players[0].id,
      });

      expect((await events).length).to.be.eq(1);
      expect((await events)[0].data.msg).to.be.eq(
        'The value for "test" should be a number. Please correct it and try again.'
      );
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
