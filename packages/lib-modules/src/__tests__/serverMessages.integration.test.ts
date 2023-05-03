import { IntegrationTest, expect, waitForEvents } from '@takaro/test';
import { GameEvents } from '@takaro/gameserver';
import {
  IModuleTestsSetupData,
  modulesTestSetup,
} from './setupData.integration.test.js';

const group = 'Server messages';

const tests = [
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Default install sends the default message',
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.serverMessagesModule.id
      );

      const events = waitForEvents(this.client, GameEvents.CHAT_MESSAGE);

      await this.client.cronjob.cronJobControllerTrigger({
        cronjobId: this.setupData.serverMessagesModule.cronJobs[0].id,
        gameServerId: this.setupData.gameserver.id,
        moduleId: this.setupData.serverMessagesModule.id,
      });

      expect((await events).length).to.be.eq(1);
      expect((await events)[0].data.msg).to.be.eq(
        // eslint-disable-next-line
        "This is an automated message, don't forget to read the server rules!"
      );
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Can override default message via userConfig',
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.serverMessagesModule.id,
        {
          userConfig: JSON.stringify({
            messages: ['This is a custom message'],
          }),
        }
      );

      const events = waitForEvents(this.client, GameEvents.CHAT_MESSAGE);

      await this.client.cronjob.cronJobControllerTrigger({
        cronjobId: this.setupData.serverMessagesModule.cronJobs[0].id,
        gameServerId: this.setupData.gameserver.id,
        moduleId: this.setupData.serverMessagesModule.id,
      });

      expect((await events).length).to.be.eq(1);
      expect((await events)[0].data.msg).to.be.eq('This is a custom message');
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Can override default message via userConfig with multiple messages',
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.serverMessagesModule.id,
        {
          userConfig: JSON.stringify({
            messages: ['Test message 1', 'Test message 2', 'Test message 3'],
          }),
        }
      );

      // We should see each of our test messages at least once
      const events = waitForEvents(this.client, GameEvents.CHAT_MESSAGE, 50);

      // Trigger it 50 times
      await Promise.all(
        Array.from({ length: 50 }).map(() => {
          return this.client.cronjob.cronJobControllerTrigger({
            cronjobId: this.setupData.serverMessagesModule.cronJobs[0].id,
            gameServerId: this.setupData.gameserver.id,
            moduleId: this.setupData.serverMessagesModule.id,
          });
        })
      );

      const messages = (await events).map((e) => e.data.msg);
      expect(messages).to.include('Test message 1');
      expect(messages).to.include('Test message 2');
      expect(messages).to.include('Test message 3');
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
