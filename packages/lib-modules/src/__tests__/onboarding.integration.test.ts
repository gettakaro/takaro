import { IntegrationTest, expect } from '@takaro/test';
import { GameEvents } from '@takaro/gameserver';
import {
  IModuleTestsSetupData,
  modulesTestSetup,
} from './setupData.integration.test.js';

const group = 'Onboarding';

const tests = [
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'PlayerConnected hook sends a message when a player connects to the server',
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.onboardingModule.id
      );

      await this.client.hook.hookControllerTrigger({
        gameServerId: this.setupData.gameserver.id,
        eventType: GameEvents.PLAYER_CONNECTED,
        player: {
          gameId: '1',
        },
      });
      const events = await this.setupData.waitForEvent(GameEvents.CHAT_MESSAGE);

      expect(events.length).to.be.eq(1);
      expect(events[0].data.msg).to.match(/Welcome .+ to the server!/);
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
