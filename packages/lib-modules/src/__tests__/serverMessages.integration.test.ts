import { IntegrationTest, expect, IModuleTestsSetupData, modulesTestSetup, EventsAwaiter } from '@takaro/test';
import { GameEvents } from '../dto/index.js';
import { describe } from 'vitest';

const group = 'Server messages';

const tests = [
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Default install sends the default message',
    test: async function () {
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.serverMessagesModule.latestVersion.id,
      });

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE);

      await this.client.cronjob.cronJobControllerTrigger({
        cronjobId: this.setupData.serverMessagesModule.latestVersion.cronJobs[0].id,
        gameServerId: this.setupData.gameserver.id,
        moduleId: this.setupData.serverMessagesModule.id,
      });

      expect((await events).length).to.equal(1);
      expect((await events)[0].data.meta.msg).to.equal(
        "This is an automated message, don't forget to read the server rules!",
      );
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Can override default message via userConfig',
    test: async function () {
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.serverMessagesModule.latestVersion.id,
        userConfig: JSON.stringify({
          messages: ['This is a custom message'],
        }),
      });

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE);

      await this.client.cronjob.cronJobControllerTrigger({
        cronjobId: this.setupData.serverMessagesModule.latestVersion.cronJobs[0].id,
        gameServerId: this.setupData.gameserver.id,
        moduleId: this.setupData.serverMessagesModule.id,
      });

      expect((await events).length).to.equal(1);
      expect((await events)[0].data.meta.msg).to.equal('This is a custom message');
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Can override default message via userConfig with multiple messages',
    test: async function () {
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.serverMessagesModule.latestVersion.id,
        userConfig: JSON.stringify({
          messages: ['Test message 1', 'Test message 2'],
        }),
      });

      // We should see each of our test messages at least once

      const firstEvents = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.cronjob.cronJobControllerTrigger({
        cronjobId: this.setupData.serverMessagesModule.latestVersion.cronJobs[0].id,
        gameServerId: this.setupData.gameserver.id,
        moduleId: this.setupData.serverMessagesModule.id,
      });

      expect((await firstEvents).length).to.equal(1);
      expect((await firstEvents)[0].data.meta.msg).to.equal('Test message 1');

      const secondEvents = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.cronjob.cronJobControllerTrigger({
        cronjobId: this.setupData.serverMessagesModule.latestVersion.cronJobs[0].id,
        gameServerId: this.setupData.gameserver.id,
        moduleId: this.setupData.serverMessagesModule.id,
      });

      expect((await secondEvents).length).to.equal(1);
      expect((await secondEvents)[0].data.meta.msg).to.equal('Test message 2');

      // After this, it should loop back to the first message
      const thirdEvents = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.cronjob.cronJobControllerTrigger({
        cronjobId: this.setupData.serverMessagesModule.latestVersion.cronJobs[0].id,
        gameServerId: this.setupData.gameserver.id,
        moduleId: this.setupData.serverMessagesModule.id,
      });

      expect((await thirdEvents).length).to.equal(1);
      expect((await thirdEvents)[0].data.meta.msg).to.equal('Test message 1');
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
