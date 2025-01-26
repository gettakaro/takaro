import {
  IntegrationTest,
  expect,
  IModuleTestsSetupData,
  modulesTestSetup,
  chatMessageSorter,
  EventsAwaiter,
} from '@takaro/test';
import { GameEvents } from '../../dto/index.js';

const group = 'EconomyUtils';

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
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.economyUtilsModule.latestVersion.id,
      });

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 2);

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
      await this.client.playerOnGameserver.playerOnGameServerControllerSetCurrency(
        playerOnGameServer[0].gameServerId,
        playerOnGameServer[0].playerId,
        {
          currency: 1000,
        },
      );

      // trigger balance command
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/balance',
        playerId: this.setupData.players[0].id,
      });

      expect((await events).length).to.be.eq(2);
      expect((await events)[0].data.meta.msg).to.be.eq('balance: 0 test coin');
      expect((await events)[1].data.meta.msg).to.be.eq('balance: 1000 test coin');
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: customSetup,
    name: 'Can show list of top (max 10) players with highest balance',
    test: async function () {
      // install module
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.economyUtilsModule.latestVersion.id,
      });

      const giveCurrencies = this.setupData.players.map(async (player, index) => {
        const playerOnGameServer = (
          await this.client.playerOnGameserver.playerOnGameServerControllerSearch({
            filters: { playerId: [player.id], gameServerId: [this.setupData.gameserver.id] },
          })
        ).data.data;
        if (playerOnGameServer.length === 0) throw new Error('player not found');
        return this.client.playerOnGameserver.playerOnGameServerControllerSetCurrency(
          playerOnGameServer[0].gameServerId,
          playerOnGameServer[0].playerId,
          {
            currency: 1000 * index,
          },
        );
      });
      await Promise.all(giveCurrencies);

      // title message (1) + balance of player messages (5)
      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 6);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/topcurrency',
        playerId: this.setupData.players[0].id,
      });

      const messages = (await events).map((e) => e.data.meta.msg as string);
      expect((await events).length).to.be.eq(6);
      for (const message of messages) {
        expect(message).to.match(
          /(Richest players\:|1\. .+ - 4000 test coin|2\. .+ - 3000 test coin|3\. .+ - 2000 test coin|4\. .+ - 1000 test coin|5\. .+ - 0 test coin)/,
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
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.economyUtilsModule.latestVersion.id,
      });

      const transferAmount = 500;

      const sender = this.setupData.players[0];
      const senderPog = sender.playerOnGameServers?.find((pog) => pog.gameServerId === this.setupData.gameserver.id);
      if (!senderPog) throw new Error('Sender playerOnGameServer does not exist');
      await this.client.playerOnGameserver.playerOnGameServerControllerSetCurrency(
        senderPog.gameServerId,
        senderPog.playerId,
        {
          currency: transferAmount,
        },
      );

      const receiver = this.setupData.players[1];
      const receiverPog = receiver.playerOnGameServers?.find(
        (pog) => pog.gameServerId === this.setupData.gameserver.id,
      );
      if (!receiverPog) throw new Error('Receiver playerOnGameServer does not exist');
      expect(receiverPog.currency).to.be.eq(0);

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 2);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: `/transfer ${receiver.name} ${transferAmount}`,
        playerId: sender.id,
      });

      const messages = (await events).sort(chatMessageSorter).map((e) => e.data.meta.msg as string);
      expect((await events).length).to.be.eq(2);

      // check if balances are correct
      const updatedSender = await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(
        senderPog.gameServerId,
        senderPog.playerId,
      );
      expect(updatedSender.data.data.currency).to.be.eq(0);

      const updatedReceiver = await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(
        receiverPog.gameServerId,
        receiverPog.playerId,
      );
      expect(updatedReceiver.data.data.currency).to.be.eq(transferAmount);

      expect(messages[0]).to.be.eq(`You received ${transferAmount} test coin from ${sender.name}`);
      expect(messages[1]).to.be.eq(`You successfully transferred ${transferAmount} test coin to ${receiver.name}`);
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: customSetup,
    name: 'Should return friendly user error when not enough currency',
    test: async function () {
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.economyUtilsModule.latestVersion.id,
      });

      const sender = this.setupData.players[0];
      const receiver = this.setupData.players[1];
      const transferAmount = 500;

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: `/transfer ${receiver.name} ${transferAmount}`,
        playerId: sender.id,
      });

      const messages = (await events).sort(chatMessageSorter).map((e) => e.data.meta.msg as string);
      expect((await events).length).to.be.eq(1);
      expect(messages[0]).to.be.eq(
        `Failed to transfer ${transferAmount} test coin to ${receiver.name}. Are you sure you have enough balance?`,
      );
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: customSetup,
    name: 'Should require confirmation when transfer amount is above pendingAmount',
    test: async function () {
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.economyUtilsModule.latestVersion.id,
        userConfig: JSON.stringify({
          pendingAmount: 100,
        }),
      });

      const transferAmount = 500;
      const prefix = (
        await this.client.settings.settingsControllerGetOne('commandPrefix', this.setupData.gameserver.id)
      ).data.data.value;

      const sender = this.setupData.players[0];
      const senderPog = sender.playerOnGameServers?.find((pog) => pog.gameServerId === this.setupData.gameserver.id);
      if (!senderPog) throw new Error('Sender playerOnGameServer does not exist');
      await this.client.playerOnGameserver.playerOnGameServerControllerSetCurrency(
        senderPog.gameServerId,
        senderPog.playerId,
        {
          currency: transferAmount,
        },
      );

      const receiver = this.setupData.players[1];
      const receiverPog = receiver.playerOnGameServers?.find(
        (pog) => pog.gameServerId === this.setupData.gameserver.id,
      );
      if (!receiverPog) throw new Error('Receiver playerOnGameServer does not exist');
      expect(receiverPog.currency).to.be.eq(0);

      let events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: `/transfer ${receiver.name} ${transferAmount}`,
        playerId: sender.id,
      });

      let messages = (await events).sort(chatMessageSorter).map((e) => e.data.meta.msg as string);

      // check if balances have not changed yet
      expect(
        (
          await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(
            senderPog.gameServerId,
            senderPog.playerId,
          )
        ).data.data.currency,
      ).to.be.eq(transferAmount);
      expect(
        (
          await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(
            receiverPog.gameServerId,
            receiverPog.playerId,
          )
        ).data.data.currency,
      ).to.be.eq(0);
      expect(messages.length).to.be.eq(1);
      expect(messages[0]).to.be.eq(
        `You are about to send ${transferAmount} test coin to ${receiver.name}. (Please confirm by typing ${prefix}confirmtransfer)`,
      );

      // =================================================
      // transfer confirmed
      // =================================================
      events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 2);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: `${prefix}confirmtransfer`,
        playerId: sender.id,
      });

      messages = (await events).sort(chatMessageSorter).map((e) => e.data.meta.msg as string);
      expect((await events).length).to.be.eq(2);
      expect(
        (
          await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(
            senderPog.gameServerId,
            senderPog.playerId,
          )
        ).data.data.currency,
      ).to.be.eq(0);
      expect(
        (
          await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(
            receiverPog.gameServerId,
            receiverPog.playerId,
          )
        ).data.data.currency,
      ).to.be.eq(transferAmount);

      expect(messages[0]).to.be.eq(`You received ${transferAmount} test coin from ${sender.name}`);
      expect(messages[1]).to.be.eq(`You successfully transferred ${transferAmount} test coin to ${receiver.name}`);
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: customSetup,
    name: 'Should return no pending transfers when there are none',
    test: async function () {
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.economyUtilsModule.latestVersion.id,
        userConfig: JSON.stringify({
          pendingAmount: 100,
        }),
      });
      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 1);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/confirmtransfer',
        playerId: this.setupData.players[0].id,
      });

      const messages = (await events).sort(chatMessageSorter).map((e) => e.data.meta.msg as string);
      expect(messages[0]).to.be.eq('You have no pending transfer.');
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: customSetup,
    name: 'Can grant currency to a player',
    test: async function () {
      const granter = this.setupData.players[0];
      const receiver = this.setupData.players[1];
      const grantAmount = 500;

      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.economyUtilsModule.latestVersion.id,
      });

      // Change permissions of role to only have manageCurrency permission
      const manageCurrencyPermission = await this.client.permissionCodesToInputs(['ECONOMY_UTILS_MANAGE_CURRENCY']);
      await this.client.role.roleControllerUpdate(this.setupData.role.id, {
        permissions: [
          {
            permissionId: manageCurrencyPermission[0].permissionId,
          },
        ],
      });

      const receiverPog = receiver.playerOnGameServers?.find(
        (pog) => pog.gameServerId === this.setupData.gameserver.id,
      );
      if (!receiverPog) throw new Error('Receiver playerOnGameServer does not exist');
      expect(receiverPog.currency).to.be.eq(0);

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 2);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: `/grantcurrency ${receiver.name} ${grantAmount}`,
        playerId: granter.id,
      });

      const messages = (await events).sort(chatMessageSorter).map((e) => e.data.meta.msg as string);
      expect(
        (
          await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(
            receiverPog.gameServerId,
            receiverPog.playerId,
          )
        ).data.data.currency,
      ).to.be.eq(grantAmount);
      expect(messages[0]).to.be.eq(`Granted ${grantAmount} test coin by ${granter.name}`);
      expect(messages[1]).to.be.eq(`You successfully granted ${grantAmount} test coin to ${receiver.name}`);
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: customSetup,
    name: 'Can revoke currency from a player',
    test: async function () {
      const revoker = this.setupData.players[0];
      const receiver = this.setupData.players[1];
      const revokeAmount = 500;

      // make sure receiver has enough currency
      const receiverPog = receiver.playerOnGameServers?.find(
        (pog) => pog.gameServerId === this.setupData.gameserver.id,
      );
      if (!receiverPog) throw new Error('Receiver playerOnGameServer does not exist');
      await this.client.playerOnGameserver.playerOnGameServerControllerSetCurrency(
        receiverPog.gameServerId,
        receiverPog.playerId,
        {
          currency: revokeAmount,
        },
      );

      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.economyUtilsModule.latestVersion.id,
      });

      // Change permissions of role to only have manageCurrency permission
      const manageCurrencyPermission = await this.client.permissionCodesToInputs(['ECONOMY_UTILS_MANAGE_CURRENCY']);
      await this.client.role.roleControllerUpdate(this.setupData.role.id, {
        permissions: [
          {
            permissionId: manageCurrencyPermission[0].permissionId,
          },
        ],
      });

      // currency before revoke
      expect(
        receiver.playerOnGameServers?.find((pog) => pog.gameServerId === this.setupData.gameserver.id)?.currency,
      ).to.be.eq(0);

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 2);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: `/revokecurrency ${receiver.name} ${revokeAmount}`,
        playerId: revoker.id,
      });

      const messages = (await events).sort(chatMessageSorter).map((e) => e.data.meta.msg as string);
      expect(
        (
          await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(
            receiverPog.gameServerId,
            receiverPog.playerId,
          )
        ).data.data.currency,
      ).to.be.eq(0);
      expect(messages[0]).to.be.eq(`${revokeAmount} test coin were revoked by ${revoker.name}`);
      expect(messages[1]).to.be.eq(`You successfully revoked ${revokeAmount} test coin of ${receiver.name}'s balance`);
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: customSetup,
    name: 'Cannot use commands that require manageCurrency permission without it',
    test: async function () {
      const sender = this.setupData.players[0];
      const receiver = this.setupData.players[1];
      const amount = 500;

      // by default all users get root permission => remove all permissions
      await this.client.role.roleControllerUpdate(this.setupData.role.id, {
        permissions: [],
      });

      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.economyUtilsModule.latestVersion.id,
      });

      // currency before revoke
      expect(
        receiver.playerOnGameServers?.find((pog) => pog.gameServerId === this.setupData.gameserver.id)?.currency,
      ).to.be.eq(0);

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 2);
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: `/grantcurrency ${receiver.name} ${amount}`,
        playerId: sender.id,
      });

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: `/revokecurrency ${receiver.name} ${amount}`,
        playerId: sender.id,
      });

      const messages = (await events).sort(chatMessageSorter).map((e) => e.data.meta.msg as string);
      expect(messages[0]).to.be.eq('You do not have permission to use grant currency command.');
      expect(messages[1]).to.be.eq('You do not have permission to use revoke currency command.');
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
