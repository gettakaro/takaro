import { IntegrationTest, expect } from '@takaro/test';
import { IModuleTestsSetupData, modulesTestSetup } from './setupData.integration.test.js';
import { GameEvents } from '../dto/index.js';
import { Client } from '@takaro/apiclient';

const group = 'lottery suite';
const ticketCost = 50;
const playerStartBalance = 1000;

async function expectNoTicketVars(client: Client, gameServerId: string, moduleId: string) {
  const ticketVars = await client.variable.variableControllerSearch({
    filters: {
      gameServerId: [gameServerId],
      moduleId: [moduleId],
      key: ['lottery_tickets_bought'],
    },
  });

  expect(ticketVars.data.data.length).to.be.eq(0);
}

const setup = async function (this: IntegrationTest<IModuleTestsSetupData>): Promise<IModuleTestsSetupData> {
  const data = await modulesTestSetup.call(this);

  await this.client.settings.settingsControllerSet('economyEnabled', {
    value: 'true',
    gameServerId: data.gameserver.id,
  });

  await this.client.gameserver.gameServerControllerInstallModule(data.gameserver.id, data.economyModule.id);

  const waitForEvents = data.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, data.players.length);

  const tasks = data.players.map(async (player) => {
    return await this.client.command.commandControllerTrigger(data.gameserver.id, {
      msg: `/grantcurrency ${player.name} ${playerStartBalance}`,
      playerId: player.id,
    });
  });

  await Promise.all(tasks);
  await waitForEvents;

  await this.client.gameserver.gameServerControllerInstallModule(data.gameserver.id, data.lotteryModule.id, {
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
    name: 'can buy lottery ticket',
    test: async function () {
      let events = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE);

      const ticketAmount = 1;
      const ticketPrice = ticketAmount * ticketCost;

      const player = this.setupData.players[0];

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/buyTicket 1',
        playerId: player.id,
      });

      const currencyName = (
        await this.client.settings.settingsControllerGetOne('currencyName', this.setupData.gameserver.id)
      ).data.data;

      expect((await events).length).to.be.eq(1);
      expect((await events)[0].data.msg).to.be.eq(
        `You have successfully bought ${ticketAmount} tickets for ${ticketPrice} ${currencyName}. Good luck!`
      );

      let pog = (
        await this.client.playerOnGameserver.playerOnGameServerControllerSearch({
          filters: {
            playerId: [player.id],
            gameServerId: [this.setupData.gameserver.id],
          },
        })
      ).data.data[0];

      expect(pog.currency).to.be.eq(playerStartBalance - ticketPrice);

      expectNoTicketVars(this.client, this.setupData.gameserver.id, this.setupData.lotteryModule.id);

      events = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/buyTicket 1',
        playerId: player.id,
      });

      expect((await events).length).to.be.eq(1);
      expect((await events)[0].data.msg).to.be.eq(
        `You have successfully bought ${ticketAmount} tickets for ${ticketPrice} ${currencyName}. Good luck!`
      );

      pog = (
        await this.client.playerOnGameserver.playerOnGameServerControllerSearch({
          filters: {
            playerId: [player.id],
            gameServerId: [this.setupData.gameserver.id],
          },
        })
      ).data.data[0];

      expect(pog.currency).to.be.eq(playerStartBalance - 2 * ticketPrice);
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup,
    name: 'can view lottery tickets',
    test: async function () {
      const wantAmount = 10;

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: `/buyTicket ${wantAmount}}`,
        playerId: this.setupData.players[0].id,
      });

      const events = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 2);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/viewTickets',
        playerId: this.setupData.players[0].id,
      });

      expect((await events).length).to.be.eq(2);
      expect((await events)[1].data.msg).to.be.eq(`You have bought ${wantAmount} tickets.`);
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup,
    name: 'can give the lottery winner the prize money',
    test: async function () {
      const currencyName = (
        await this.client.settings.settingsControllerGetOne('currencyName', this.setupData.gameserver.id)
      ).data.data;

      const playerAmount = this.setupData.players.length;
      const ticketEvents = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, playerAmount);

      // let some players buy tickets
      const asyncTasks = this.setupData.players.map(async (player) => {
        return await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
          msg: '/buyTicket 1',
          playerId: player.id,
        });
      });

      await Promise.all(asyncTasks);
      await ticketEvents;

      const lotteryEvents = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 4);

      await this.client.cronjob.cronJobControllerTrigger({
        moduleId: this.setupData.lotteryModule.id,
        cronjobId: this.setupData.lotteryModule.cronJobs[0].id,
        gameServerId: this.setupData.gameserver.id,
      });

      const mod = (
        await this.client.gameserver.gameServerControllerGetModuleInstallation(
          this.setupData.gameserver.id,
          this.setupData.lotteryModule.id
        )
      ).data.data;

      const userConfig: Record<string, any> = mod.userConfig;
      const prize = ticketCost * playerAmount * (1 - userConfig.profitMargin);

      const events = await lotteryEvents;

      expect(events.length).to.be.eq(4);
      expect(events[3].data.msg).to.contain(`${prize} ${currencyName}`);

      const winnerName = events[3].data.msg.split('!')[0];
      const winner = this.setupData.players.find((player) => player.name === winnerName);
      if (!winner) {
        throw new Error('winner name not found in the list of setup players');
      }

      const winnerPog = (
        await this.client.playerOnGameserver.playerOnGameServerControllerSearch({
          filters: {
            playerId: [winner.id],
            gameServerId: [this.setupData.gameserver.id],
          },
        })
      ).data.data[0];

      expect(winnerPog.currency).to.be.eq(playerStartBalance + (prize - ticketCost));
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup,
    name: 'if no players joined, the lottery is cancelled',
    test: async function () {
      const waitForEvents = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 1);

      await this.client.cronjob.cronJobControllerTrigger({
        moduleId: this.setupData.lotteryModule.id,
        cronjobId: this.setupData.lotteryModule.cronJobs[0].id,
        gameServerId: this.setupData.gameserver.id,
      });

      const events = await waitForEvents;

      expect(events.length).to.be.eq(1);
      expect(events[0].data.msg).to.eq('No one has bought any tickets. The lottery has been cancelled.');
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup,
    name: 'if one player joined, the lottery is cancelled and the player gets his money back',
    test: async function () {
      const waitForTicketEvents = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE);

      const player = this.setupData.players[0];
      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/buyTicket 1',
        playerId: player.id,
      });

      await waitForTicketEvents;

      const currencyName = (
        await this.client.settings.settingsControllerGetOne('currencyName', this.setupData.gameserver.id)
      ).data.data;

      const waitForEvents = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, 2);

      await this.client.cronjob.cronJobControllerTrigger({
        moduleId: this.setupData.lotteryModule.id,
        cronjobId: this.setupData.lotteryModule.cronJobs[0].id,
        gameServerId: this.setupData.gameserver.id,
      });

      const events = await waitForEvents;

      expect(events.length).to.be.eq(2);
      expect(events[0].data.msg).to.eq('Only one person has bought a ticket. The lottery has been cancelled.');
      expect(events[1].data.msg).to.eq(
        `You have been refunded ${ticketCost} ${currencyName} because the lottery has been cancelled.`
      );

      const pog = (
        await this.client.playerOnGameserver.playerOnGameServerControllerSearch({
          filters: {
            playerId: [player.id],
            gameServerId: [this.setupData.gameserver.id],
          },
        })
      ).data.data[0];

      expect(pog.currency).to.be.eq(playerStartBalance);

      expectNoTicketVars(this.client, this.setupData.gameserver.id, this.setupData.lotteryModule.id);
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup,
    name: 'can view next lottery draw',
    test: async function () {
      const waitForEvents = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE);

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/nextDraw',
        playerId: this.setupData.players[0].id,
      });

      const events = await waitForEvents;

      expect(events.length).to.be.eq(1);
      expect(events[0].data.msg).to.contain('The next lottery draw is in');
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
