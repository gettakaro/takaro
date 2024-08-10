import { IntegrationTest, expect, IModuleTestsSetupData, modulesTestSetup } from '@takaro/test';
import { EventPlayerConnected, GameEvents } from '../dto/gameEvents.js';
import { HookEvents } from '../main.js';

const group = 'Onboarding';
const groupStarterkit = 'Onboarding - Starterkit';

const _tests = [
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'PlayerConnected hook sends a message when a player connects to the server',
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.onboardingModule.id,
      );
      const events = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE);
      await this.client.hook.hookControllerTrigger({
        gameServerId: this.setupData.gameserver.id,
        playerId: this.setupData.players[0].id,
        eventType: GameEvents.PLAYER_CONNECTED,
        eventMeta: new EventPlayerConnected({
          player: {
            gameId: '1',
          },
          msg: 'Player connected',
        }),
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
        },
      );
      const events = this.setupData.eventAwaiter.waitForEvents(HookEvents.COMMAND_EXECUTED);
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
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.onboardingModule.id,
        {
          userConfig: JSON.stringify({
            starterKitItems: ['cigar'],
          }),
        },
      );
      const firstEvents = this.setupData.eventAwaiter.waitForEvents(HookEvents.COMMAND_EXECUTED);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/starterkit',
        playerId: this.setupData.players[0].id,
      });

      const resultLogs = (await firstEvents)[0].data.meta.result.logs;
      expect(resultLogs.some((log: any) => log.msg.match(/giveItem 200 OK/))).to.be.true;

      const secondEvents = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/starterkit',
        playerId: this.setupData.players[0].id,
      });

      expect((await secondEvents).length).to.be.eq(1);
      expect((await secondEvents)[0].data.msg).to.match(/ou already used starterkit on this server/);
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
        this.setupData.onboardingModule.id,
      );
      const events = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/starterkit',
        playerId: this.setupData.players[0].id,
      });

      expect((await events).length).to.be.eq(1);
      expect((await events)[0].data.msg).to.match(/No starter kit items configured/);
    },
  }),
];

// Temp disabled...
/* describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
}); */
