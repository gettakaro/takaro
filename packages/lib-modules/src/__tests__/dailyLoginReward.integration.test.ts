import { IntegrationTest } from '@takaro/test';
import { IModuleTestsSetupData, modulesTestSetup } from './setupData.integration.test.js';
import { GameEvents } from '../dto/index.js';

const group = 'Daily login reward suite';

const tests = [
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Should reward player on first login',
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.dailyLoginRewardModule.id
      );
      // const events = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 2);
      await this.client.hook.hookControllerTrigger({
        gameServerId: this.setupData.gameserver.id,
        eventType: GameEvents.PLAYER_CONNECTED,
        player: {
          gameId: '1',
        },
      });
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Should increase reward on consecutive logins',
    test: async function () {
      console.log('placeholder');
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Should cap reward at max reward',
    test: async function () {
      console.log('placeholder');
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Should receive reward twice if player logs in before midnight and after midnight using cron job',
    test: async function () {
      console.log('placeholder');
    },
  }),

  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Should reset reward on Non-consecutive logins',
    test: async function () {
      console.log('placeholder');
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Should not receive reward multiple times in a day',
    test: async function () {
      console.log('placeholder');
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Should announce streak milestone in chat',
    test: async function () {
      console.log('placeholder');
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: '',
    test: async function () {
      console.log('placeholder');
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
