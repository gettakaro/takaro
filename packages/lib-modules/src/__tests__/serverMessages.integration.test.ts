import { IntegrationTest, expect, EventsAwaiter } from '@takaro/test';
import { IModuleTestsSetupData, modulesTestSetup } from './setupData.integration.test.js';
import { GameEvents } from '../dto/index.js';

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

      const eventAwaiter = new EventsAwaiter();
      await eventAwaiter.connect(this.client);
      const events = eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE);

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

      const eventAwaiter = new EventsAwaiter();
      await eventAwaiter.connect(this.client);
      const events = eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE);

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
            messages: ['Test message 1', 'Test message 2'],
          }),
        }
      );

      // We should see each of our test messages at least once
      const eventAwaiter = new EventsAwaiter();
      await eventAwaiter.connect(this.client);

      const numberOfEvents = 5;
      const events = eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, numberOfEvents);

      // Trigger it multiple times
      await Promise.all(
        Array.from({ length: numberOfEvents }).map(() => {
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
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
