import { IntegrationTest, expect } from '@takaro/test';
import { IModuleTestsSetupData, modulesTestSetup } from './setupData.integration.test.js';
import { GameEvents } from '../dto/index.js';

const group = 'lottery suite';
const ticketCost = 50;

const setup = async function (this: IntegrationTest<IModuleTestsSetupData>): Promise<IModuleTestsSetupData> {
  const data = await modulesTestSetup.call(this);

  await this.client.gameserver.gameServerControllerInstallModule(data.gameserver.id, data.lotteryModule.id, {
    systemConfig: JSON.stringify({
      commands: {
        buyTicket: {
          cost: ticketCost,
        },
      },
    }),
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
      const events = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE);

      const ticketAmount = 1;
      const ticketPrice = ticketAmount * ticketCost;

      const useLotteryRole = await this.client.permissionCodesToInputs(['LOTTERY_BUY']);

      await this.client.role.roleControllerUpdate(this.setupData.role.id, {
        permissions: [
          {
            permissionId: useLotteryRole[0].permissionId,
          },
        ],
      });

      await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
        msg: '/buyTicket 1',
        playerId: this.setupData.players[0].id,
      });

      const currencyName = (
        await this.client.settings.settingsControllerGetOne('currencyName', this.setupData.gameserver.id)
      ).data.data;

      expect((await events).length).to.be.eq(1);
      expect((await events)[0].data.msg).to.be.eq(
        `You have successfully bought ${ticketAmount} tickets for ${ticketPrice} ${currencyName}. Good luck!`
      );
    },
  }),
  new IntegrationTest<IModuleTestsSetupData>({
    group,
    snapshot: false,
    setup,
    name: 'can view lottery tickets',
    test: async function () {
      const useLotteryRole = await this.client.permissionCodesToInputs(['LOTTERY_BUY']);
      const viewLotteryRole = await this.client.permissionCodesToInputs(['LOTTERY_VIEW_TICKETS']);

      await this.client.role.roleControllerUpdate(this.setupData.role.id, {
        permissions: [
          {
            permissionId: useLotteryRole[0].permissionId,
          },
          {
            permissionId: viewLotteryRole[0].permissionId,
          },
        ],
      });

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
      const playerAmount = this.setupData.players.length;
      const ticketEvents = this.setupData.eventAwaiter.waitForEvents(GameEvents.CHAT_MESSAGE, playerAmount);

      // let some players buy tickets
      const asyncTasks = this.setupData.players.map(async (player) => {
        await this.client.command.commandControllerTrigger(this.setupData.gameserver.id, {
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
      const currencyName = (
        await this.client.settings.settingsControllerGetOne('currencyName', this.setupData.gameserver.id)
      ).data.data;

      const events = await lotteryEvents;
      expect(events.length).to.be.eq(4);
      expect(events[3].data.msg).to.contain(`${prize} ${currencyName}`);
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
