import { IntegrationTest, expect } from '@takaro/test';
import { IModuleTestsSetupData, modulesTestSetup } from './setupData.integration.test.js';
import { GameEvents } from '../dto/index.js';

const group = 'Economy suite';

const customSetup = async function (this: IntegrationTest<IModuleTestsSetupData>): Promise<IModuleTestsSetupData> {
  const setupData = await modulesTestSetup.bind(this)();
  await this.client.settings.settingsControllerSet('economyEnabled', {
    value: 'true',
    gameServerId: setupData.gameserver.id,
  });
  await this.client.settings.settingsControllerSet('currencyName', {
    gameServerId: setupData.gameserver.id,
    value: 'test coin',
  });

  const giveCurrencies = setupData.players.map(async (player, index) => {
    const playerOnGameServer = (
      await this.client.playerOnGameserver.playerOnGameServerControllerSearch({
        filters: { playerId: [player.id], gameServerId: [setupData.gameserver.id] },
      })
    ).data.data;
    if (playerOnGameServer.length === 0) throw new Error('player not found');
    return this.client.playerOnGameserver.playerOnGameServerControllerSetCurrency(playerOnGameServer[0].id, {
      currency: 1000 * index,
    });
  });
  await Promise.all(giveCurrencies);

  return setupData;
};

const tests = [
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: customSetup,
    name: 'Can get balance',
    test: async function () {
      // install module
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.economyModule.id
      );

      // catch incoming events
      const events = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 2);

      // trigger balance command
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/balance',
        playerId: this.setupData.players[0].id,
      });

      const playerOnGameServer = (
        await this.client.playerOnGameserver.playerOnGameServerControllerSearch({
          filters: { playerId: [this.setupData.players[0].id], gameServerId: [this.setupData.gameserver.id] },
        })
      ).data.data;
      if (playerOnGameServer.length === 0) throw new Error('player not found');
      await this.client.playerOnGameserver.playerOnGameServerControllerSetCurrency(playerOnGameServer[0].id, {
        currency: 1000,
      });

      // trigger balance command
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/balance',
        playerId: this.setupData.players[0].id,
      });

      expect((await events).length).to.be.eq(2);
      expect((await events)[0].data.msg).to.be.eq('balance: 0 test coin');
      expect((await events)[1].data.msg).to.be.eq('balance: 1000 test coin');
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: customSetup,
    name: 'Can show list of top (max 10) players with highest balance',
    test: async function () {
      // install module
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.economyModule.id
      );

      // title message (1) + balance of player messages (5)
      const events = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 6);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/topmoney',
        playerId: this.setupData.players[0].id,
      });

      const messages = (await events).map((e) => e.data.msg as string);
      expect((await events).length).to.be.eq(6);
      for (const message of messages) {
        expect(message).to.match(
          /(Richest players\:|1\. .+ - 4000 test coin|2\. .+ - 3000 test coin|3\. .+ - 2000 test coin|4\. .+ - 1000 test coin|5\. .+ - 0 test coin)/
        );
      }
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
