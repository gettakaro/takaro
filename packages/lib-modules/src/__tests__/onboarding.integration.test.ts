import { IntegrationTest, expect, IModuleTestsSetupData, modulesTestSetup, EventsAwaiter } from '@takaro/test';
import { GameEvents } from '../dto/gameEvents.js';
import { HookEvents } from '../main.js';
import { faker } from '@faker-js/faker';

const group = 'Onboarding';
const groupStarterkit = 'Onboarding - Starterkit';

const tests = [
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'PlayerConnected hook sends a message when a player connects to the server',
    test: async function () {
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.onboardingModule.latestVersion.id,
      });
      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 5);
      await this.client.gameserver.gameServerControllerExecuteCommand(this.setupData.gameserver.id, {
        command: 'connectAll',
      });

      expect((await events).length).to.be.eq(5);
      // Expect all messages to match
      expect((await events).every((event) => event.data.meta.msg.match(/Welcome .+ to the server!/))).to.be.true;
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group: groupStarterkit,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Starterkit command gives the player items',
    test: async function () {
      const items = (await this.client.item.itemControllerSearch()).data.data;
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.onboardingModule.latestVersion.id,
        userConfig: JSON.stringify({
          starterKitItems: items.map((item) => ({
            item: item.id,
            amount: faker.number.int({ min: 1, max: 6 }),
            quality: faker.number.int({ min: 1, max: 6 }).toString(),
          })),
        }),
      });
      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(HookEvents.COMMAND_EXECUTED);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/starterkit',
        playerId: this.setupData.players[0].id,
      });

      const resultLogs = (await events)[0].data.meta.result.logs;
      expect(resultLogs.some((log: any) => log.msg.match(/giveItem 200 OK/))).to.be.true;
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group: groupStarterkit,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Starterkit command can only be used once',
    test: async function () {
      const items = (await this.client.item.itemControllerSearch()).data.data;
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.onboardingModule.latestVersion.id,
        userConfig: JSON.stringify({
          starterKitItems: items.map((item) => ({
            item: item.id,
            amount: faker.number.int({ min: 1, max: 6 }),
            quality: faker.number.int({ min: 1, max: 6 }).toString(),
          })),
        }),
      });
      const firstEvents = (await new EventsAwaiter().connect(this.client)).waitForEvents(HookEvents.COMMAND_EXECUTED);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/starterkit',
        playerId: this.setupData.players[0].id,
      });

      const resultLogs = (await firstEvents)[0].data.meta.result.logs;
      expect(resultLogs.some((log: any) => log.msg.match(/giveItem 200 OK/))).to.be.true;

      const secondEvents = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 1);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/starterkit',
        playerId: this.setupData.players[0].id,
      });

      expect((await secondEvents).length).to.be.eq(1);
      expect((await secondEvents)[0].data.meta.msg).to.match(/ou already used starterkit on this server/);
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group: groupStarterkit,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Starterkit with nothing configured, shows an error message',
    test: async function () {
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.onboardingModule.latestVersion.id,
      });
      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 1);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/starterkit',
        playerId: this.setupData.players[0].id,
      });

      expect((await events).length).to.be.eq(1);
      expect((await events)[0].data.meta.msg).to.match(/No starter kit items configured/);
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
