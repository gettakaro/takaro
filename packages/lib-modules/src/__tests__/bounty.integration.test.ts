import { IntegrationTest, expect } from '@takaro/test';
import { IModuleTestsSetupData, modulesTestSetup } from './setupData.integration.test.js';
import { GameEvents } from '../dto/index.js';
import { HookTriggerDTOEventTypeEnum } from '@takaro/apiclient';

const group = 'Bounty suite';

const customSetup = async function (this: IntegrationTest<IModuleTestsSetupData>): Promise<IModuleTestsSetupData> {
  const setupData = await modulesTestSetup.bind(this)();
  await this.client.settings.settingsControllerSet('economyEnabled', {
    value: 'true',
  });

  await this.client.settings.settingsControllerSet('currencyName', {
    gameServerId: setupData.gameserver.id,
    value: 'test coin',
  });

  // give player currency
  const pog = setupData.players[0].playerOnGameServers?.filter(
    (pog) => pog.gameServerId === setupData.gameserver.id
  )[0];
  if (!pog) throw new Error('pog not found');
  this.client.playerOnGameserver.playerOnGameServerControllerAddCurrency(pog.id, { currency: 1000 });
  return setupData;
};

const tests = [
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: customSetup,
    name: 'Can set a bounty on a player',
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.bountyModule.id
      );

      const target = this.setupData.players[1];
      const events = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);
      const bountyAmount = 500;

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: `/bounty ${target.name} ${bountyAmount}`,
        playerId: this.setupData.players[0].id,
      });

      const messages = (await events).map((e) => e.data.msg);
      expect(messages.length).to.be.eq(1);
      expect(messages[0]).to.be.eq(`set bounty of ${bountyAmount} test coin on ${target.name}`);

      // expect bounty variable to be set
      const bountyVariable = await this.client.variable.variableControllerSearch({
        filters: {
          gameServerId: [this.setupData.gameserver.id],
          key: ['bounty'],
          playerId: [this.setupData.players[0].id],
          moduleId: [this.setupData.bountyModule.id],
        },
      });
      expect(bountyVariable.data.data.length).to.be.eq(1);

      // expect currency to be deducted
      const pog = this.setupData.players[0].playerOnGameServers?.filter(
        (pog) => pog.gameServerId === this.setupData.gameserver.id
      )[0];
      if (!pog) throw new Error('pog not found');
      const updatedPog = (await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(pog.id)).data.data;
      expect(updatedPog.currency).to.be.eq(pog.currency - bountyAmount);
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Cannot set multiple bounties on the same player',
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.bountyModule.id
      );

      const target = this.setupData.players[1];
      const events = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 2);
      const amount = 500;

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: `/bounty ${target.name} ${amount}`,
        playerId: this.setupData.players[0].id,
      });

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: `/bounty ${target.name} ${amount}`,
        playerId: this.setupData.players[0].id,
      });

      const messages = (await events).map((e) => e.data.msg);
      expect(messages.length).to.be.eq(2);
      expect(messages[0]).to.be.eq(`set bounty of ${amount} test coin on ${target.name}`);
      expect(messages[1]).to.be.eq(`You already have a bounty set for ${target.name}`);

      const bountyVariable = await this.client.variable.variableControllerSearch({
        filters: {
          gameServerId: [this.setupData.gameserver.id],
          key: ['bounty'],
          playerId: [this.setupData.players[0].id],
          moduleId: [this.setupData.bountyModule.id],
        },
      });
      expect(bountyVariable.data.data.length).to.be.eq(1);
    },
  }),

  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Can check if a player has a bounty',
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.bountyModule.id
      );

      const target = this.setupData.players[1];
      const amount = 500;

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: `/bounty ${target.name} ${amount}`,
        playerId: this.setupData.players[0].id,
      });

      const events = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: `/getbounty ${target.name}`,
        playerId: this.setupData.players[0].id,
      });

      const messages = (await events).map((e) => e.data.msg);
      expect(messages.length).to.be.eq(1);
      expect(messages[0]).to.be.eq(`${target.name} has a total bounty of ${amount} test coin`);
    },
  }),

  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Can get `no bounty on a player message` if no bounty is set',
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.bountyModule.id
      );

      const target = this.setupData.players[1];
      const amount = 500;
      const events = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: `/getbounty ${target.name}`,
        playerId: this.setupData.players[0].id,
      });

      const messages = (await events).map((e) => e.data.msg);
      expect(messages.length).to.be.eq(1);
      expect(messages[0]).to.be.eq(`${target.name} has a total bounty of ${amount} test coin`);
    },
  }),

  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Can delete a bounty on a player',
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.bountyModule.id
      );

      const target = this.setupData.players[1];
      const bountyAmount = 500;

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: `/bounty ${target.name} ${bountyAmount}`,
        playerId: this.setupData.players[0].id,
      });

      const events = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: `/deletebounty ${target.name}`,
        playerId: this.setupData.players[0].id,
      });

      const messages = (await events).map((e) => e.data.msg);
      expect(messages.length).to.be.eq(1);
      expect(messages[0]).to.be.eq(
        `Bounty on ${target.name} has been removed and you have been refunded ${bountyAmount} test coin`
      );

      // expect there be no bounty variable
      const bountyVariable = await this.client.variable.variableControllerSearch({
        filters: {
          gameServerId: [this.setupData.gameserver.id],
          key: ['bounty'],
          playerId: [this.setupData.players[0].id],
          moduleId: [this.setupData.bountyModule.id],
        },
      });
      expect(bountyVariable.data.data.length).to.be.eq(0);

      // currency should be same as when before the bounty was set
      const pog = this.setupData.players[0].playerOnGameServers?.filter(
        (pog) => pog.gameServerId === this.setupData.gameserver.id
      )[0];
      if (!pog) throw new Error('pog not found');
      const updatedPog = (await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(pog.id)).data.data;
      expect(updatedPog.currency).to.be.eq(pog.currency);
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Should receive bounty when player is killed who has a bounty on them',
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.bountyModule.id
      );

      // set bounty on player
      const target = this.setupData.players[1];
      const targetPog = this.setupData.players[1].playerOnGameServers?.filter(
        (pog) => pog.gameServerId === this.setupData.gameserver.id
      )[0];
      if (!targetPog) throw new Error('pog not found');

      const bountyAmount = 500;
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: `/bounty ${target.name} ${bountyAmount}`,
        playerId: this.setupData.players[0].id,
      });

      // wait until bounty is set
      const setBountyEvents = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);
      const setBountyMessages = (await setBountyEvents).map((e) => e.data.msg);
      expect(setBountyMessages.length).to.be.eq(1);
      expect(setBountyMessages[0]).to.be.eq(`set bounty of ${bountyAmount} test coin on ${target.name}`);

      // trigger hook
      await this.client.hook.hookControllerTrigger({
        eventType: HookTriggerDTOEventTypeEnum.PlayerDeath,
        gameServerId: this.setupData.gameserver.id,
        player: {
          gameId: targetPog.gameId,
        },
      });

      const bountyGrantedEvent = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);
      const bountyGrantedMessages = (await bountyGrantedEvent).map((e) => e.data.msg);
      expect(bountyGrantedMessages.length).to.be.eq(1);
    },
  }),

  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup: modulesTestSetup,
    name: 'Cannot delete a bounty on a player if no bounty is set',
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.bountyModule.id
      );

      const target = this.setupData.players[1];
      const events = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: `/deletebounty ${target.name}`,
        playerId: this.setupData.players[0].id,
      });

      const messages = (await events).map((e) => e.data.msg);
      expect(messages.length).to.be.eq(1);
      expect(messages[0]).to.be.eq(`You do not have a bounty set on ${target.name}`);
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
