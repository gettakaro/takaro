import { IntegrationTest, expect, EventsAwaiter } from '@takaro/test';
import {
  IModuleTestsSetupData,
  modulesTestSetup,
} from './setupData.integration.test.js';
import { GameEvents } from '../dto/gameEvents.js';

const group = 'Onboarding';
const groupStarterkit = 'Onboarding - Starterkit';

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
  new IntegrationTest<IModuleTestsSetupData>({
    group: groupStarterkit,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Starterkit command gives the player items',
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.onboardingModule.id,
        {
          userConfig: JSON.stringify({
            starterKitItems: ['cigar'],
          }),
        }
      );
      const eventAwaiter = new EventsAwaiter();
      await eventAwaiter.connect(this.client);
      const events = eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 2);
      await this.client.command.commandControllerTrigger(
        this.setupData.gameserver.id,
        {
          msg: '/starterkit',
          player: {
            gameId: '1',
          },
        }
      );

      expect((await events).length).to.be.eq(2);
      expect((await events)[0].data.msg).to.match(
        /You are about to receive your starter kit/
      );
      expect((await events)[1].data.msg).to.match(/Gave \d items, enjoy!/);
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group: groupStarterkit,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Starterkit command can only be used once',
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.onboardingModule.id,
        {
          userConfig: JSON.stringify({
            starterKitItems: ['cigar'],
          }),
        }
      );
      const eventAwaiter = new EventsAwaiter();
      await eventAwaiter.connect(this.client);
      const firstEvents = eventAwaiter.waitForEvents(
        GameEvents.CHAT_MESSAGE,
        2
      );
      await this.client.command.commandControllerTrigger(
        this.setupData.gameserver.id,
        {
          msg: '/starterkit',
          player: {
            gameId: '1',
          },
        }
      );

      expect((await firstEvents).length).to.be.eq(2);
      expect((await firstEvents)[0].data.msg).to.match(
        /You are about to receive your starter kit/
      );
      expect((await firstEvents)[1].data.msg).to.match(/Gave \d items, enjoy!/);

      const secondEvents = eventAwaiter.waitForEvents(
        GameEvents.CHAT_MESSAGE,
        1
      );
      await this.client.command.commandControllerTrigger(
        this.setupData.gameserver.id,
        {
          msg: '/starterkit',
          player: {
            gameId: '1',
          },
        }
      );

      expect((await secondEvents).length).to.be.eq(1);
      expect((await secondEvents)[0].data.msg).to.match(
        /ou already used starterkit on this server/
      );
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group: groupStarterkit,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Starterkit with nothing configured, shows an error message',
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.onboardingModule.id
      );
      const eventAwaiter = new EventsAwaiter();
      await eventAwaiter.connect(this.client);
      const events = eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);
      await this.client.command.commandControllerTrigger(
        this.setupData.gameserver.id,
        {
          msg: '/starterkit',
          player: {
            gameId: '1',
          },
        }
      );

      expect((await events).length).to.be.eq(1);
      expect((await events)[0].data.msg).to.match(
        /No starter kit items configured/
      );
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
