import { IntegrationTest, expect, IModuleTestsSetupData, modulesTestSetup, EventsAwaiter } from '@takaro/test';
import { GameEvents } from '../dto/index.js';
import { sleep } from '@takaro/util';
import { describe } from 'node:test';

const group = 'System config - cost';

const customSetup = async function (this: IntegrationTest<IModuleTestsSetupData>): Promise<IModuleTestsSetupData> {
  const setupData = await modulesTestSetup.bind(this)();
  await this.client.settings.settingsControllerSet('economyEnabled', {
    value: 'true',
    gameServerId: setupData.gameserver.id,
  });

  await this.client.module.moduleInstallationsControllerInstallModule({
    gameServerId: setupData.gameserver.id,
    versionId: setupData.teleportsModule.latestVersion.id,
    userConfig: JSON.stringify({
      timeout: 0,
    }),
    systemConfig: JSON.stringify({
      commands: {
        teleport: {
          delay: 0,
          aliases: [],
          cost: 10,
        },
      },
    }),
  });

  const setEvents = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 1);
  await this.client.command.commandControllerTrigger(setupData.gameserver.id, {
    msg: '/settp test',
    playerId: setupData.players[0].id,
  });

  expect((await setEvents).length).to.be.eq(1);
  expect((await setEvents)[0].data.meta.msg).to.be.eq('Teleport test set.');

  const giveCurrencies = setupData.players.map(async (player) => {
    const playerOnGameServer = (
      await this.client.playerOnGameserver.playerOnGameServerControllerSearch({
        filters: { playerId: [player.id], gameServerId: [setupData.gameserver.id] },
      })
    ).data.data;
    if (playerOnGameServer.length === 0) throw new Error('player not found');
    return this.client.playerOnGameserver.playerOnGameServerControllerSetCurrency(
      playerOnGameServer[0].gameServerId,
      playerOnGameServer[0].playerId,
      {
        currency: 100,
      },
    );
  });
  await Promise.all(giveCurrencies);

  return setupData;
};

const tests = [
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: customSetup,
    name: 'Deducts money when cost is configured',
    test: async function () {
      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents('command-executed', 1);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/tp test',
        playerId: this.setupData.players[0].id,
      });

      expect((await events).length).to.be.eq(1);

      const playerOnGameServerAfter = (
        await this.client.playerOnGameserver.playerOnGameServerControllerSearch({
          filters: { playerId: [this.setupData.players[0].id], gameServerId: [this.setupData.gameserver.id] },
        })
      ).data.data;

      expect(playerOnGameServerAfter[0].currency).to.be.eq(90);
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: customSetup,
    name: 'Handles concurrent commands properly',
    test: async function () {
      const amount = 10;

      const setEvents = (await new EventsAwaiter().connect(this.client)).waitForEvents('command-executed', amount);

      await Promise.all(
        Array.from({ length: amount }).map(async (_, index) => {
          await sleep(10);
          await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
            msg: `/settp test${index}`,
            playerId: this.setupData.players[0].id,
          });
        }),
      );

      expect((await setEvents).length).to.be.eq(amount);

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents('command-executed', amount);
      await Promise.all(
        Array.from({ length: amount }).map(async (_, index) => {
          await sleep(1);
          await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
            msg: `/tp test${index}`,
            playerId: this.setupData.players[0].id,
          });
        }),
      );

      expect((await events).length).to.be.eq(amount);
      for (const event of await events) {
        expect(event.data.meta.result.success).to.be.eq(true);
      }

      const playerOnGameServerAfter = (
        await this.client.playerOnGameserver.playerOnGameServerControllerSearch({
          filters: { playerId: [this.setupData.players[0].id], gameServerId: [this.setupData.gameserver.id] },
        })
      ).data.data;

      expect(playerOnGameServerAfter[0].currency).to.be.eq(0);
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: customSetup,
    name: 'Does not deduct currency when command unsuccessful',
    test: async function () {
      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents('command-executed', 1);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/tp doesntexist',
        playerId: this.setupData.players[0].id,
      });

      expect((await events).length).to.be.eq(1);
      expect((await events)[0].data.meta.result.success).to.be.eq(false);

      const playerOnGameServerAfter = (
        await this.client.playerOnGameserver.playerOnGameServerControllerSearch({
          filters: { playerId: [this.setupData.players[0].id], gameServerId: [this.setupData.gameserver.id] },
        })
      ).data.data;

      expect(playerOnGameServerAfter[0].currency).to.be.eq(100);
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: customSetup,
    name: 'Rejects command if player does not have enough currency',
    test: async function () {
      // set players' currency to 5
      const playerOnGameServer = (
        await this.client.playerOnGameserver.playerOnGameServerControllerSearch({
          filters: { playerId: [this.setupData.players[1].id], gameServerId: [this.setupData.gameserver.id] },
        })
      ).data.data;

      if (playerOnGameServer.length === 0) throw new Error('player not found');
      await this.client.playerOnGameserver.playerOnGameServerControllerSetCurrency(
        playerOnGameServer[0].gameServerId,
        playerOnGameServer[0].playerId,
        {
          currency: 5,
        },
      );

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 1);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/tp test',
        playerId: this.setupData.players[1].id,
      });

      expect((await events).length).to.be.eq(1);
      expect((await events)[0].data.meta.msg).to.be.eq('You do not have enough currency to execute this command.');
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
