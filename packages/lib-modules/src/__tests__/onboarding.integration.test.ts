import { IntegrationTest, expect, EventsAwaiter } from '@takaro/test';
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
      const eventAwaiter = new EventsAwaiter();
      await eventAwaiter.connect(this.client);
      const events = eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE);
      await this.client.hook.hookControllerTrigger({
        gameServerId: this.setupData.gameserver.id,
        eventType: GameEvents.PLAYER_CONNECTED,
        player: {
          gameId: '1',
        },
      });

      expect((await events).length).to.be.eq(1);
      expect((await events)[0].data.msg).to.match(/Welcome .+ to the server!/);
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
