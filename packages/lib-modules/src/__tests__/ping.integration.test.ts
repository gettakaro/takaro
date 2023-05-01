import { IntegrationTest, expect } from '@takaro/test';
import { GameEvents } from '@takaro/gameserver';
import {
  IModuleTestsSetupData,
  modulesTestSetup,
} from './setupData.integration.test.js';

const group = 'Ping command';

const tests = [
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Ping command replies with pong',
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
          msg: '/ping',
          player: {
            gameId: '1',
          },
        }
      );
      const events = await this.setupData.waitForEvent(GameEvents.CHAT_MESSAGE);

      expect(events.length).to.be.eq(1);
      expect(events[0].data.msg).to.be.eq('Pong!');
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
