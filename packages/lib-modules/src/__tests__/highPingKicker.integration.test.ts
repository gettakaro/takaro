import { IntegrationTest, expect, IModuleTestsSetupData, modulesTestSetup, EventsAwaiter } from '@takaro/test';
import { GameEvents } from '../dto/index.js';
import { describe } from 'vitest';

const group = 'High Ping Kicker';

const tests = [
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Should warn players with high ping using default configuration',
    test: async function () {
      // Install module with default configuration (pingThreshold: 200, warningsBeforeKick: 3)
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.highPingKickerModule.latestVersion.id,
      });

      // Set player ping to be above threshold
      await this.client.gameserver.gameServerControllerExecuteCommand(this.setupData.gameserver.id, {
        command: 'setPlayerData 0 {"ping": 250}',
      });

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE);

      // Trigger the cron job
      await this.client.cronjob.cronJobControllerTrigger({
        cronjobId: this.setupData.highPingKickerModule.latestVersion.cronJobs[0].id,
        gameServerId: this.setupData.gameserver.id,
        moduleId: this.setupData.highPingKickerModule.id,
      });

      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for event processing

      expect((await events).length).to.equal(1);
      expect((await events)[0].data.meta.msg).to.match(/Your ping \(250\) is too high\. Warning 1\/3/);
    },
  }),

  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Should kick player after reaching warning threshold',
    test: async function () {
      // Install module with default configuration
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.highPingKickerModule.latestVersion.id,
      });

      // Set player ping to be above threshold
      await this.client.gameserver.gameServerControllerExecuteCommand(this.setupData.gameserver.id, {
        command: 'setPlayerData 0 {"ping": 300}',
      });

      // First warning
      const events1 = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE);
      await this.client.cronjob.cronJobControllerTrigger({
        cronjobId: this.setupData.highPingKickerModule.latestVersion.cronJobs[0].id,
        gameServerId: this.setupData.gameserver.id,
        moduleId: this.setupData.highPingKickerModule.id,
      });
      expect((await events1).length).to.equal(1);
      expect((await events1)[0].data.meta.msg).to.match(/Your ping \(300\) is too high\. Warning 1\/3/);

      // Second warning
      const events2 = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE);
      await this.client.cronjob.cronJobControllerTrigger({
        cronjobId: this.setupData.highPingKickerModule.latestVersion.cronJobs[0].id,
        gameServerId: this.setupData.gameserver.id,
        moduleId: this.setupData.highPingKickerModule.id,
      });
      expect((await events2).length).to.equal(1);
      expect((await events2)[0].data.meta.msg).to.match(/Your ping \(300\) is too high\. Warning 2\/3/);

      // Third warning should trigger kick
      const kickEvent = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.PLAYER_DISCONNECTED);
      await this.client.cronjob.cronJobControllerTrigger({
        cronjobId: this.setupData.highPingKickerModule.latestVersion.cronJobs[0].id,
        gameServerId: this.setupData.gameserver.id,
        moduleId: this.setupData.highPingKickerModule.id,
      });

      expect((await kickEvent).length).to.equal(1);
    },
  }),

  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Should respect custom configuration values',
    test: async function () {
      // Install module with custom configuration (lower threshold and fewer warnings)
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.highPingKickerModule.latestVersion.id,
        userConfig: JSON.stringify({
          pingThreshold: 100,
          warningsBeforeKick: 2,
        }),
      });

      // Set player ping to be above custom threshold
      await this.client.gameserver.gameServerControllerExecuteCommand(this.setupData.gameserver.id, {
        command: 'setPlayerData 0 {"ping": 150}',
      });

      // First warning
      const events1 = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE);
      await this.client.cronjob.cronJobControllerTrigger({
        cronjobId: this.setupData.highPingKickerModule.latestVersion.cronJobs[0].id,
        gameServerId: this.setupData.gameserver.id,
        moduleId: this.setupData.highPingKickerModule.id,
      });
      expect((await events1).length).to.equal(1);
      expect((await events1)[0].data.meta.msg).to.match(/Your ping \(150\) is too high\. Warning 1\/2/);

      // Second warning should trigger kick
      const kickEvent = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.PLAYER_DISCONNECTED);
      await this.client.cronjob.cronJobControllerTrigger({
        cronjobId: this.setupData.highPingKickerModule.latestVersion.cronJobs[0].id,
        gameServerId: this.setupData.gameserver.id,
        moduleId: this.setupData.highPingKickerModule.id,
      });

      expect((await kickEvent).length).to.equal(1);
    },
  }),

  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Should not warn players with ping below threshold',
    test: async function () {
      // Install module with default configuration
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.highPingKickerModule.latestVersion.id,
      });

      // Set player ping to be below threshold
      await this.client.gameserver.gameServerControllerExecuteCommand(this.setupData.gameserver.id, {
        command: 'setPlayerData 0 {"ping": 50}',
      });

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      // Trigger the cron job
      await this.client.cronjob.cronJobControllerTrigger({
        cronjobId: this.setupData.highPingKickerModule.latestVersion.cronJobs[0].id,
        gameServerId: this.setupData.gameserver.id,
        moduleId: this.setupData.highPingKickerModule.id,
      });

      // Should timeout without receiving any events
      try {
        await events;
        expect.fail('Should not have received any warning messages');
      } catch (error: any) {
        // Expected timeout
        expect(error.message).to.contain('timed out');
      }
    },
  }),

  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Should handle multiple players with different ping values correctly',
    test: async function () {
      // Install module with default configuration
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.highPingKickerModule.latestVersion.id,
      });

      // Set different ping values for different players
      await this.client.gameserver.gameServerControllerExecuteCommand(this.setupData.gameserver.id, {
        command: 'setPlayerData 0 {"ping": 250}',
      });
      await this.client.gameserver.gameServerControllerExecuteCommand(this.setupData.gameserver.id, {
        command: 'setPlayerData 1 {"ping": 50}',
      });
      await this.client.gameserver.gameServerControllerExecuteCommand(this.setupData.gameserver.id, {
        command: 'setPlayerData 2 {"ping": 300}',
      });

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 2);

      // Trigger the cron job
      await this.client.cronjob.cronJobControllerTrigger({
        cronjobId: this.setupData.highPingKickerModule.latestVersion.cronJobs[0].id,
        gameServerId: this.setupData.gameserver.id,
        moduleId: this.setupData.highPingKickerModule.id,
      });

      // Should receive warnings for players 0 and 2, but not player 1
      const receivedEvents = await events;
      expect(receivedEvents.length).to.equal(2);

      const messages = receivedEvents.map((e) => e.data.meta.msg);
      expect(messages).to.satisfy((msgs: string[]) => msgs.some((msg) => msg.includes('Your ping (250) is too high')));
      expect(messages).to.satisfy((msgs: string[]) => msgs.some((msg) => msg.includes('Your ping (300) is too high')));
    },
  }),

  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Should reset warnings after player is kicked',
    test: async function () {
      // Install module with configuration for quick kick (1 warning before kick)
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.highPingKickerModule.latestVersion.id,
        userConfig: JSON.stringify({
          pingThreshold: 200,
          warningsBeforeKick: 1,
        }),
      });

      // Set player ping to be above threshold
      await this.client.gameserver.gameServerControllerExecuteCommand(this.setupData.gameserver.id, {
        command: 'setPlayerData 0 {"ping": 250}',
      });

      // First trigger should kick the player
      const kickEvent = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.PLAYER_DISCONNECTED);
      await this.client.cronjob.cronJobControllerTrigger({
        cronjobId: this.setupData.highPingKickerModule.latestVersion.cronJobs[0].id,
        gameServerId: this.setupData.gameserver.id,
        moduleId: this.setupData.highPingKickerModule.id,
      });
      expect((await kickEvent).length).to.equal(1);

      // Reconnect the player by setting online status
      await this.client.gameserver.gameServerControllerExecuteCommand(this.setupData.gameserver.id, {
        command: 'setPlayerData 0 {"online": true}',
      });

      // Keep high ping
      await this.client.gameserver.gameServerControllerExecuteCommand(this.setupData.gameserver.id, {
        command: 'setPlayerData 0 {"ping": 250}',
      });

      // Next trigger should kick again (warnings were reset)
      const kickEvent2 = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.PLAYER_DISCONNECTED);
      await this.client.cronjob.cronJobControllerTrigger({
        cronjobId: this.setupData.highPingKickerModule.latestVersion.cronJobs[0].id,
        gameServerId: this.setupData.gameserver.id,
        moduleId: this.setupData.highPingKickerModule.id,
      });
      expect((await kickEvent2).length).to.equal(1);
    },
  }),

  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Should handle edge case of zero warnings before kick',
    test: async function () {
      // Install module with configuration for immediate kick (0 warnings)
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.highPingKickerModule.latestVersion.id,
        userConfig: JSON.stringify({
          pingThreshold: 200,
          warningsBeforeKick: 0,
        }),
      });

      // Set player ping to be above threshold
      await this.client.gameserver.gameServerControllerExecuteCommand(this.setupData.gameserver.id, {
        command: 'setPlayerData 0 {"ping": 250}',
      });

      // Should immediately kick without warning
      const kickEvent = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.PLAYER_DISCONNECTED);
      await this.client.cronjob.cronJobControllerTrigger({
        cronjobId: this.setupData.highPingKickerModule.latestVersion.cronJobs[0].id,
        gameServerId: this.setupData.gameserver.id,
        moduleId: this.setupData.highPingKickerModule.id,
      });

      expect((await kickEvent).length).to.equal(1);
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Should handle ping exactly at threshold (boundary condition)',
    test: async function () {
      // Install module with default configuration
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.highPingKickerModule.latestVersion.id,
      });

      // Set player ping exactly at threshold (should not trigger warning)
      await this.client.gameserver.gameServerControllerExecuteCommand(this.setupData.gameserver.id, {
        command: 'setPlayerData 0 {"ping": 200}',
      });

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      // Trigger the cron job
      await this.client.cronjob.cronJobControllerTrigger({
        cronjobId: this.setupData.highPingKickerModule.latestVersion.cronJobs[0].id,
        gameServerId: this.setupData.gameserver.id,
        moduleId: this.setupData.highPingKickerModule.id,
      });

      // Should timeout without receiving any events (ping = threshold should not warn)
      try {
        await events;
        expect.fail('Should not have received any warning messages for ping exactly at threshold');
      } catch (error: any) {
        // Expected timeout
        expect(error.message).to.contain('timed out');
      }
    },
  }),

  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Should warn for ping just above threshold (boundary condition)',
    test: async function () {
      // Install module with default configuration
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.highPingKickerModule.latestVersion.id,
      });

      // Set player ping just above threshold
      await this.client.gameserver.gameServerControllerExecuteCommand(this.setupData.gameserver.id, {
        command: 'setPlayerData 0 {"ping": 201}',
      });

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE);

      // Trigger the cron job
      await this.client.cronjob.cronJobControllerTrigger({
        cronjobId: this.setupData.highPingKickerModule.latestVersion.cronJobs[0].id,
        gameServerId: this.setupData.gameserver.id,
        moduleId: this.setupData.highPingKickerModule.id,
      });

      expect((await events).length).to.equal(1);
      expect((await events)[0].data.meta.msg).to.match(/Your ping \(201\) is too high\. Warning 1\/3/);
    },
  }),

  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Should handle very high ping values correctly',
    test: async function () {
      // Install module with default configuration
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.highPingKickerModule.latestVersion.id,
      });

      // Set extremely high ping
      await this.client.gameserver.gameServerControllerExecuteCommand(this.setupData.gameserver.id, {
        command: 'setPlayerData 0 {"ping": 9999}',
      });

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE);

      // Trigger the cron job
      await this.client.cronjob.cronJobControllerTrigger({
        cronjobId: this.setupData.highPingKickerModule.latestVersion.cronJobs[0].id,
        gameServerId: this.setupData.gameserver.id,
        moduleId: this.setupData.highPingKickerModule.id,
      });

      expect((await events).length).to.equal(1);
      expect((await events)[0].data.meta.msg).to.match(/Your ping \(9999\) is too high\. Warning 1\/3/);
    },
  }),

  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Should handle offline players correctly',
    test: async function () {
      // Install module with default configuration
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.highPingKickerModule.latestVersion.id,
      });

      // Set player offline but with high ping
      await this.client.gameserver.gameServerControllerExecuteCommand(this.setupData.gameserver.id, {
        command: 'setPlayerData 0 {"ping": 300, "online": false}',
      });

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      // Trigger the cron job
      await this.client.cronjob.cronJobControllerTrigger({
        cronjobId: this.setupData.highPingKickerModule.latestVersion.cronJobs[0].id,
        gameServerId: this.setupData.gameserver.id,
        moduleId: this.setupData.highPingKickerModule.id,
      });

      // Should timeout as offline players shouldn't be checked
      try {
        await events;
        expect.fail('Should not have received any warning messages for offline players');
      } catch (error: any) {
        // Expected timeout
        expect(error.message).to.contain('timed out');
      }
    },
  }),

  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Should handle ping fluctuation correctly',
    test: async function () {
      // Install module with default configuration
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.highPingKickerModule.latestVersion.id,
      });

      // Set high ping
      await this.client.gameserver.gameServerControllerExecuteCommand(this.setupData.gameserver.id, {
        command: 'setPlayerData 0 {"ping": 300}',
      });

      // First warning
      const events1 = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE);
      await this.client.cronjob.cronJobControllerTrigger({
        cronjobId: this.setupData.highPingKickerModule.latestVersion.cronJobs[0].id,
        gameServerId: this.setupData.gameserver.id,
        moduleId: this.setupData.highPingKickerModule.id,
      });
      expect((await events1).length).to.equal(1);

      // Lower ping temporarily
      await this.client.gameserver.gameServerControllerExecuteCommand(this.setupData.gameserver.id, {
        command: 'setPlayerData 0 {"ping": 50}',
      });

      // Should not warn or kick
      const events2 = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 1);
      await this.client.cronjob.cronJobControllerTrigger({
        cronjobId: this.setupData.highPingKickerModule.latestVersion.cronJobs[0].id,
        gameServerId: this.setupData.gameserver.id,
        moduleId: this.setupData.highPingKickerModule.id,
      });

      try {
        await events2;
        expect.fail('Should not have received warning for good ping');
      } catch (error: any) {
        expect(error.message).to.contain('timed out');
      }

      // Raise ping again
      await this.client.gameserver.gameServerControllerExecuteCommand(this.setupData.gameserver.id, {
        command: 'setPlayerData 0 {"ping": 350}',
      });

      // Should continue from previous warning count
      const events3 = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE);
      await this.client.cronjob.cronJobControllerTrigger({
        cronjobId: this.setupData.highPingKickerModule.latestVersion.cronJobs[0].id,
        gameServerId: this.setupData.gameserver.id,
        moduleId: this.setupData.highPingKickerModule.id,
      });
      expect((await events3).length).to.equal(1);
      expect((await events3)[0].data.meta.msg).to.match(/Warning 2\/3/);
    },
  }),

  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Should handle extreme configuration values',
    test: async function () {
      // Install module with extreme configuration (very low threshold, high warning count)
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.highPingKickerModule.latestVersion.id,
        userConfig: JSON.stringify({
          pingThreshold: 1,
          warningsBeforeKick: 10,
        }),
      });

      // Set moderate ping that would be above extremely low threshold
      await this.client.gameserver.gameServerControllerExecuteCommand(this.setupData.gameserver.id, {
        command: 'setPlayerData 0 {"ping": 50}',
      });

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE);

      // Trigger the cron job
      await this.client.cronjob.cronJobControllerTrigger({
        cronjobId: this.setupData.highPingKickerModule.latestVersion.cronJobs[0].id,
        gameServerId: this.setupData.gameserver.id,
        moduleId: this.setupData.highPingKickerModule.id,
      });

      expect((await events).length).to.equal(1);
      expect((await events)[0].data.meta.msg).to.match(/Your ping \(50\) is too high\. Warning 1\/10/);
    },
  }),

  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Should handle concurrent ping changes during warning period',
    test: async function () {
      // Install module with custom configuration
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.highPingKickerModule.latestVersion.id,
        userConfig: JSON.stringify({
          pingThreshold: 200,
          warningsBeforeKick: 2,
        }),
      });

      // Set high ping for multiple players simultaneously
      await Promise.all([
        this.client.gameserver.gameServerControllerExecuteCommand(this.setupData.gameserver.id, {
          command: 'setPlayerData 0 {"ping": 250}',
        }),
        this.client.gameserver.gameServerControllerExecuteCommand(this.setupData.gameserver.id, {
          command: 'setPlayerData 1 {"ping": 260}',
        }),
        this.client.gameserver.gameServerControllerExecuteCommand(this.setupData.gameserver.id, {
          command: 'setPlayerData 2 {"ping": 270}',
        }),
      ]);

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 3);

      // Trigger the cron job
      await this.client.cronjob.cronJobControllerTrigger({
        cronjobId: this.setupData.highPingKickerModule.latestVersion.cronJobs[0].id,
        gameServerId: this.setupData.gameserver.id,
        moduleId: this.setupData.highPingKickerModule.id,
      });

      const receivedEvents = await events;
      expect(receivedEvents.length).to.equal(3);

      // All should get warning 1
      receivedEvents.forEach((event) => {
        expect(event.data.meta.msg).to.match(/Warning 1\/2/);
      });
    },
  }),

  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Should handle player with missing ping data gracefully',
    test: async function () {
      // Install module with default configuration
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.highPingKickerModule.latestVersion.id,
      });

      // Don't set any ping data for player 0, but ensure they're online
      await this.client.gameserver.gameServerControllerExecuteCommand(this.setupData.gameserver.id, {
        command: 'setPlayerData 0 {"online": true}',
      });

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      // Trigger the cron job
      await this.client.cronjob.cronJobControllerTrigger({
        cronjobId: this.setupData.highPingKickerModule.latestVersion.cronJobs[0].id,
        gameServerId: this.setupData.gameserver.id,
        moduleId: this.setupData.highPingKickerModule.id,
      });

      // Should timeout as undefined/null ping should not trigger warnings
      try {
        await events;
        expect.fail('Should not have received warning for undefined ping');
      } catch (error: any) {
        expect(error.message).to.contain('timed out');
      }
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
