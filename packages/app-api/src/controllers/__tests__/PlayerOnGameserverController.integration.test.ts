import { IntegrationTest, SetupGameServerPlayers, expect } from '@takaro/test';

const group = 'PlayerOnGameserverController';

const tests = [
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Get list of players',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const res = await this.client.playerOnGameserver.playerOnGameServerControllerSearch({
        sortBy: 'gameId',
        filters: {
          gameServerId: [this.setupData.gameServer1.id],
        },
      });
      expect(res.data.data.length).to.be.eq(this.setupData.players.length);
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Get one player',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const res = await this.client.playerOnGameserver.playerOnGameServerControllerSearch();

      const player = res.data.data[0];

      const playerRes = await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(player.id);
      expect(playerRes.data.data.id).to.be.eq(player.id);
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Can set currency',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const res = await this.client.playerOnGameserver.playerOnGameServerControllerSearch();

      const player = res.data.data[0];

      await this.client.settings.settingsControllerSet('economyEnabled', {
        gameServerId: player.gameServerId,
        value: 'true',
      });
      await this.client.playerOnGameserver.playerOnGameServerControllerSetCurrency(player.id, {
        currency: 100,
      });
      const playerRes = await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(player.id);

      expect(playerRes.data.data.currency).to.be.eq(100);
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: true,
    name: 'Rejects negative currency',
    setup: SetupGameServerPlayers.setup,
    expectedStatus: 400,
    test: async function () {
      const res = await this.client.playerOnGameserver.playerOnGameServerControllerSearch();

      const player = res.data.data[0];

      await this.client.settings.settingsControllerSet('economyEnabled', {
        gameServerId: player.gameServerId,
        value: 'true',
      });
      const rejectedRes = await this.client.playerOnGameserver.playerOnGameServerControllerSetCurrency(player.id, {
        currency: -100,
      });

      expect(rejectedRes.data.meta.error.message).to.be.eq('Currency must be positive');

      return rejectedRes;
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: true,
    name: 'Bad request when economy is not enabled',
    setup: SetupGameServerPlayers.setup,
    expectedStatus: 400,
    test: async function () {
      const res = await this.client.playerOnGameserver.playerOnGameServerControllerSearch();

      const player = res.data.data[0];

      await this.client.settings.settingsControllerSet('economyEnabled', {
        gameServerId: player.gameServerId,
        value: 'false',
      });
      const rejectedRes = await this.client.playerOnGameserver.playerOnGameServerControllerSetCurrency(player.id, {
        currency: -100,
      });

      expect(rejectedRes.data.meta.error.message).to.be.eq('Economy is not enabled');

      return rejectedRes;
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
