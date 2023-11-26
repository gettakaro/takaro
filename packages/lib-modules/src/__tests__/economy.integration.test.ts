import { IntegrationTest, expect } from '@takaro/test';
import { IModuleTestsSetupData, modulesTestSetup, sorter } from './setupData.integration.test.js';
import { GameEvents } from '../dto/index.js';

const group = 'Economy suite';

const customSetup = async function (this: IntegrationTest<IModuleTestsSetupData>): Promise<IModuleTestsSetupData> {
  const setupData = await modulesTestSetup.bind(this)();

  await this.client.settings.settingsControllerSet('economyEnabled', {
    value: 'true',
    gameServerId: setupData.gameserver.id,
  });

  await this.client.settings.settingsControllerSet('economyEnabled', {
    value: 'true',
  });
  await this.client.settings.settingsControllerSet('currencyName', {
    gameServerId: setupData.gameserver.id,
    value: 'test coin',
  });
  return setupData;
};

const tests = [
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: customSetup,
    name: 'Can get balance',
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.economyModule.id
      );

      const events = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 2);

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

      const giveCurrencies = this.setupData.players.map(async (player, index) => {
        const playerOnGameServer = (
          await this.client.playerOnGameserver.playerOnGameServerControllerSearch({
            filters: { playerId: [player.id], gameServerId: [this.setupData.gameserver.id] },
          })
        ).data.data;
        if (playerOnGameServer.length === 0) throw new Error('player not found');
        return this.client.playerOnGameserver.playerOnGameServerControllerSetCurrency(playerOnGameServer[0].id, {
          currency: 1000 * index,
        });
      });
      await Promise.all(giveCurrencies);

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
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: customSetup,
    name: 'Can transfer money to another player',
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.economyModule.id
      );

      const transferAmount = 500;

      const sender = this.setupData.players[0];
      const senderPog = sender.playerOnGameServers?.find((pog) => pog.gameServerId === this.setupData.gameserver.id);
      if (!senderPog) throw new Error('Sender playerOnGameServer does not exist');
      await this.client.playerOnGameserver.playerOnGameServerControllerSetCurrency(senderPog.id, {
        currency: transferAmount,
      });

      const receiver = this.setupData.players[1];
      const receiverPog = receiver.playerOnGameServers?.find(
        (pog) => pog.gameServerId === this.setupData.gameserver.id
      );
      if (!receiverPog) throw new Error('Receiver playerOnGameServer does not exist');
      expect(receiverPog.currency).to.be.eq(0);

      const events = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 2);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: `/transfer ${receiver.name} ${transferAmount}`,
        playerId: sender.id,
      });

      const messages = (await events).sort(sorter).map((e) => e.data.msg as string);
      expect((await events).length).to.be.eq(2);

      // check if balances are correct
      const updatedSender = await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(senderPog.id);
      expect(updatedSender.data.data.currency).to.be.eq(0);

      const updatedReceiver = await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(receiverPog.id);
      expect(updatedReceiver.data.data.currency).to.be.eq(transferAmount);

      expect(messages[0]).to.be.eq(`You received ${transferAmount} test coin from ${sender.name}`);
      expect(messages[1]).to.be.eq(`You successfully transferred ${transferAmount} test coin to ${receiver.name}`);
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: customSetup,
    name: 'Should require confirmation when transfer amount is above pendingAmount',
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.economyModule.id,
        {
          userConfig: JSON.stringify({
            pendingAmount: 100,
          }),
        }
      );

      const transferAmount = 500;
      const prefix = (
        await this.client.settings.settingsControllerGetOne('commandPrefix', this.setupData.gameserver.id)
      ).data.data;

      const sender = this.setupData.players[0];
      const senderPog = sender.playerOnGameServers?.find((pog) => pog.gameServerId === this.setupData.gameserver.id);
      if (!senderPog) throw new Error('Sender playerOnGameServer does not exist');
      await this.client.playerOnGameserver.playerOnGameServerControllerSetCurrency(senderPog.id, {
        currency: transferAmount,
      });

      const receiver = this.setupData.players[1];
      const receiverPog = receiver.playerOnGameServers?.find(
        (pog) => pog.gameServerId === this.setupData.gameserver.id
      );
      if (!receiverPog) throw new Error('Receiver playerOnGameServer does not exist');
      expect(receiverPog.currency).to.be.eq(0);

      let events = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: `/transfer ${receiver.name} ${transferAmount}`,
        playerId: sender.id,
      });

      let messages = (await events).sort(sorter).map((e) => e.data.msg as string);

      // check if balances have not changed yet
      expect(
        (await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(senderPog.id)).data.data.currency
      ).to.be.eq(transferAmount);
      expect(
        (await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(receiverPog.id)).data.data.currency
      ).to.be.eq(0);
      expect(messages.length).to.be.eq(1);
      expect(messages[0]).to.be.eq(
        `You are about to send ${transferAmount} test coin to ${receiver.name}. (Please confirm by typing ${prefix}confirmtransfer )`
      );

      // =================================================
      // transfer confirmed
      // =================================================
      events = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 2);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: `/confirmtransfer ${receiver.name} ${transferAmount}`,
        playerId: sender.id,
      });

      messages = (await events).sort(sorter).map((e) => e.data.msg as string);
      expect((await events).length).to.be.eq(2);
      expect(
        (await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(senderPog.id)).data.data.currency
      ).to.be.eq(0);
      expect(
        (await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(receiverPog.id)).data.data.currency
      ).to.be.eq(transferAmount);

      expect(messages[1]).to.be.eq(`You received ${transferAmount} from ${sender.name}`);
      expect(messages[2]).to.be.eq(`You successfully transferred ${transferAmount} to ${receiver.name}`);
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: customSetup,
    name: 'Should require confirmation when transfer amount is above pendingAmount',
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.economyModule.id,
        {
          userConfig: JSON.stringify({
            pendingAmount: 100,
          }),
        }
      );

      const transferAmount = 500;
      const prefix = (
        await this.client.settings.settingsControllerGetOne('commandPrefix', this.setupData.gameserver.id)
      ).data.data;

      const sender = this.setupData.players[0];
      const senderPog = sender.playerOnGameServers?.find((pog) => pog.gameServerId === this.setupData.gameserver.id);
      if (!senderPog) throw new Error('Sender playerOnGameServer does not exist');
      await this.client.playerOnGameserver.playerOnGameServerControllerSetCurrency(senderPog.id, {
        currency: transferAmount,
      });

      const receiver = this.setupData.players[1];
      const receiverPog = receiver.playerOnGameServers?.find(
        (pog) => pog.gameServerId === this.setupData.gameserver.id
      );
      if (!receiverPog) throw new Error('Receiver playerOnGameServer does not exist');
      expect(receiverPog.currency).to.be.eq(0);

      let events = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: `/transfer ${receiver.name} ${transferAmount}`,
        playerId: sender.id,
      });

      let messages = (await events).sort(sorter).map((e) => e.data.msg as string);

      // check if balances have not changed yet
      expect(
        (await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(senderPog.id)).data.data.currency
      ).to.be.eq(transferAmount);
      expect(
        (await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(receiverPog.id)).data.data.currency
      ).to.be.eq(0);
      expect(messages.length).to.be.eq(1);
      expect(messages[0]).to.be.eq(
        `You are about to send ${transferAmount} test coin to ${receiver.name}. (Please confirm by typing ${prefix}confirmtransfer )`
      );

      // =================================================
      // transfer confirmed
      // =================================================
      events = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 2);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: `${prefix}confirmtransfer`,
        playerId: sender.id,
      });

      messages = (await events).sort(sorter).map((e) => e.data.msg as string);
      expect((await events).length).to.be.eq(2);
      expect(
        (await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(senderPog.id)).data.data.currency
      ).to.be.eq(0);
      expect(
        (await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(receiverPog.id)).data.data.currency
      ).to.be.eq(transferAmount);

      expect(messages[1]).to.be.eq(`You received ${transferAmount} from ${sender.name}`);
      expect(messages[2]).to.be.eq(`You successfully transferred ${transferAmount} to ${receiver.name}`);
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: customSetup,
    name: 'Should return no pending transfers when there are none',
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.economyModule.id,
        {
          userConfig: JSON.stringify({
            pendingAmount: 100,
          }),
        }
      );
      const events = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/confirmtransfer',
        playerId: this.setupData.players[0].id,
      });

      const messages = (await events).sort(sorter).map((e) => e.data.msg as string);
      expect(messages[0]).to.be.eq('You have no pending transfer.');
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
