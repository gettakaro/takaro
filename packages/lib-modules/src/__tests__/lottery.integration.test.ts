import { IntegrationTest, expect, IModuleTestsSetupData, modulesTestSetup, EventsAwaiter } from '@takaro/test';
import { GameEvents } from '../dto/index.js';
import { Client } from '@takaro/apiclient';
import { describe } from 'node:test';

const group = 'lottery suite';
const ticketCost = 50;
const playerStartBalance = 1000;

async function expectTicketAmountLengthToBe(
  client: Client,
  gameServerId: string,
  moduleId: string,
  expectedAmount = 0,
) {
  const ticketVars = await client.variable.variableControllerSearch({
    filters: {
      gameServerId: [gameServerId],
      moduleId: [moduleId],
      key: ['lottery_tickets_bought'],
    },
  });

  const amount = ticketVars.data.data.reduce((acc, variable) => {
    return acc + parseInt(JSON.parse(variable.value).amount, 10);
  }, 0);

  expect(expectedAmount).to.be.eq(amount);
}

const setup = async function (this: IntegrationTest<IModuleTestsSetupData>): Promise<IModuleTestsSetupData> {
  const data = await modulesTestSetup.call(this);

  await this.client.settings.settingsControllerSet('economyEnabled', {
    value: 'true',
    gameServerId: data.gameserver.id,
  });

  await this.client.module.moduleInstallationsControllerInstallModule({
    gameServerId: data.gameserver.id,
    versionId: data.economyUtilsModule.latestVersion.id,
  });

  const pogs = await this.client.playerOnGameserver.playerOnGameServerControllerSearch({
    filters: {
      gameServerId: [data.gameserver.id],
    },
  });

  const tasks = pogs.data.data.map((pog) => {
    return this.client.playerOnGameserver.playerOnGameServerControllerAddCurrency(pog.gameServerId, pog.playerId, {
      currency: playerStartBalance,
    });
  });

  await Promise.allSettled(tasks);

  await this.client.module.moduleInstallationsControllerInstallModule({
    gameServerId: data.gameserver.id,
    versionId: data.lotteryModule.latestVersion.id,
    systemConfig: JSON.stringify({
      commands: {
        buyTicket: {
          cost: ticketCost,
        },
      },
    }),
  });

  const useLotteryRole = await this.client.permissionCodesToInputs(['LOTTERY_BUY']);
  const viewLotteryRole = await this.client.permissionCodesToInputs(['LOTTERY_VIEW_TICKETS']);

  await this.client.role.roleControllerUpdate(data.role.id, {
    permissions: [
      {
        permissionId: useLotteryRole[0].permissionId,
      },
      {
        permissionId: viewLotteryRole[0].permissionId,
      },
    ],
  });

  return data;
};

const tests = [
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup,
    name: 'Cannot buy 0 lottery tickets',
    test: async function () {
      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE);
      const player = this.setupData.players[0];

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/buyTicket 0',
        playerId: player.id,
      });

      expect((await events).length).to.be.eq(1);
      expect((await events)[0].data.meta.msg).to.be.eq('You must buy at least 1 ticket.');
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup,
    name: 'Can buy lottery ticket',
    test: async function () {
      let events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE);

      const ticketAmount = 1;
      const ticketPrice = ticketAmount * ticketCost;

      const player = this.setupData.players[0];

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: `/buyTicket ${ticketAmount}`,
        playerId: player.id,
      });

      const currencyName = (
        await this.client.settings.settingsControllerGetOne('currencyName', this.setupData.gameserver.id)
      ).data.data.value;

      expect((await events).length).to.be.eq(1);
      expect((await events)[0].data.meta.msg).to.be.eq(
        `You have successfully bought ${ticketAmount} tickets for ${ticketPrice} ${currencyName}. Good luck!`,
      );

      let pog = (
        await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(this.setupData.gameserver.id, player.id)
      ).data.data;

      expect(pog.currency).to.be.eq(playerStartBalance - ticketPrice);
      await expectTicketAmountLengthToBe(this.client, this.setupData.gameserver.id, this.setupData.lotteryModule.id, 1);

      events = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: `/buyTicket ${ticketAmount}`,
        playerId: player.id,
      });

      expect((await events).length).to.be.eq(1);
      expect((await events)[0].data.meta.msg).to.be.eq(
        `You have successfully bought ${ticketAmount} tickets for ${ticketPrice} ${currencyName}. Good luck!`,
      );

      pog = (
        await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(this.setupData.gameserver.id, player.id)
      ).data.data;
      expect(pog.currency).to.be.eq(playerStartBalance - 2 * ticketPrice);
      await expectTicketAmountLengthToBe(this.client, this.setupData.gameserver.id, this.setupData.lotteryModule.id, 2);
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup,
    name: 'Can view lottery tickets',
    test: async function () {
      const wantAmount = 10;

      const waitForBuyEvents = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: `/buyTicket ${wantAmount}}`,
        playerId: this.setupData.players[0].id,
      });

      const buyEvents = await waitForBuyEvents;
      expect(buyEvents.length).to.be.eq(1);
      expect(buyEvents[0].data.meta.msg).to.be.eq(
        `You have successfully bought ${wantAmount} tickets for ${wantAmount * ticketCost} Takaro coins. Good luck!`,
      );

      const waitForViewEvent = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/viewTickets',
        playerId: this.setupData.players[0].id,
      });

      const events = await waitForViewEvent;

      expect(events.length).to.be.eq(1);
      expect(events[0].data.meta.msg).to.be.eq(`You have bought ${wantAmount} tickets.`);
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup,
    name: 'Can give the lottery winner the prize money',
    test: async function () {
      const currencyName = (
        await this.client.settings.settingsControllerGetOne('currencyName', this.setupData.gameserver.id)
      ).data.data.value;

      const playerAmount = this.setupData.players.length;
      const ticketEvents = (await new EventsAwaiter().connect(this.client)).waitForEvents(
        GameEvents.CHAT_MESSAGE,
        playerAmount,
      );

      // let some players buy tickets
      const asyncTasks = this.setupData.players.map(async (player) => {
        return await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
          msg: '/buyTicket 1',
          playerId: player.id,
        });
      });

      await Promise.allSettled(asyncTasks);
      await ticketEvents;

      const lotteryEvents = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 4);

      await this.client.cronjob.cronJobControllerTrigger({
        moduleId: this.setupData.lotteryModule.id,
        cronjobId: this.setupData.lotteryModule.latestVersion.cronJobs[0].id,
        gameServerId: this.setupData.gameserver.id,
      });

      const installationsRes = await this.client.module.moduleInstallationsControllerGetInstalledModules({
        filters: { gameserverId: [this.setupData.gameserver.id], moduleId: [this.setupData.lotteryModule.id] },
      });
      const mod = installationsRes.data.data[0];

      const userConfig: Record<string, any> = mod.userConfig;
      const prize = ticketCost * playerAmount * (1 - userConfig.profitMargin);

      const events = await lotteryEvents;

      expect(events.length).to.be.eq(4);
      expect(events[3].data.meta.msg).to.contain(`${prize} ${currencyName}`);

      const winnerName = events[3].data.meta.msg.split('!')[0];
      const winner = this.setupData.players.find((player) => player.name === winnerName);
      if (!winner) {
        throw new Error('winner name not found in the list of setup players');
      }

      const winnerPog = (
        await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(this.setupData.gameserver.id, winner.id)
      ).data.data;
      expect(winnerPog.currency).to.be.eq(playerStartBalance + (prize - ticketCost));
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup,
    name: 'If no players joined, the lottery is cancelled',
    test: async function () {
      const waitForEvents = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.cronjob.cronJobControllerTrigger({
        moduleId: this.setupData.lotteryModule.id,
        cronjobId: this.setupData.lotteryModule.latestVersion.cronJobs[0].id,
        gameServerId: this.setupData.gameserver.id,
      });

      const events = await waitForEvents;

      expect(events.length).to.be.eq(1);
      expect(events[0].data.meta.msg).to.eq('No one has bought any tickets. The lottery has been cancelled.');
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup,
    name: 'If one player joined, the lottery is cancelled and the player gets his money back',
    test: async function () {
      const waitForTicketEvents = (await new EventsAwaiter().connect(this.client)).waitForEvents(
        GameEvents.CHAT_MESSAGE,
      );

      const player = this.setupData.players[0];
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/buyTicket 1',
        playerId: player.id,
      });

      await waitForTicketEvents;

      const currencyName = (
        await this.client.settings.settingsControllerGetOne('currencyName', this.setupData.gameserver.id)
      ).data.data.value;

      const waitForEvents = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE, 2);

      await this.client.cronjob.cronJobControllerTrigger({
        moduleId: this.setupData.lotteryModule.id,
        cronjobId: this.setupData.lotteryModule.latestVersion.cronJobs[0].id,
        gameServerId: this.setupData.gameserver.id,
      });

      const events = await waitForEvents;

      expect(events.length).to.be.eq(2);
      expect(events[0].data.meta.msg).to.eq('Only one person has bought a ticket. The lottery has been cancelled.');
      expect(events[1].data.meta.msg).to.eq(
        `You have been refunded ${ticketCost} ${currencyName} because the lottery has been cancelled.`,
      );

      const pog = (
        await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(this.setupData.gameserver.id, player.id)
      ).data.data;
      expect(pog.currency).to.be.eq(playerStartBalance);

      await expectTicketAmountLengthToBe(this.client, this.setupData.gameserver.id, this.setupData.lotteryModule.id);
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup,
    name: 'Can view next lottery draw',
    test: async function () {
      const waitForEvents = (await new EventsAwaiter().connect(this.client)).waitForEvents(GameEvents.CHAT_MESSAGE);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/nextDraw',
        playerId: this.setupData.players[0].id,
      });

      const events = await waitForEvents;

      expect(events.length).to.be.eq(1);
      expect(events[0].data.meta.msg).to.contain('The next lottery draw is in');
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
