import { IntegrationTest, SetupGameServerPlayers, expect } from '@takaro/test';
import { isAxiosError } from 'axios';
import { describe } from 'node:test';

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
      // Divide by 2 because we setup 2 test servers
      expect(res.data.data.length).to.be.eq(this.setupData.players.length / 2);
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

      const playerRes = await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(
        player.gameServerId,
        player.playerId,
      );
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
      await this.client.playerOnGameserver.playerOnGameServerControllerSetCurrency(
        player.gameServerId,
        player.playerId,
        {
          currency: 100,
        },
      );
      const playerRes = await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(
        player.gameServerId,
        player.playerId,
      );

      expect(playerRes.data.data.currency).to.be.eq(100);
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Can set currency to zero',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const res = await this.client.playerOnGameserver.playerOnGameServerControllerSearch();

      const player = res.data.data[0];

      await this.client.settings.settingsControllerSet('economyEnabled', {
        gameServerId: player.gameServerId,
        value: 'true',
      });

      // First set currency to some value
      await this.client.playerOnGameserver.playerOnGameServerControllerSetCurrency(
        player.gameServerId,
        player.playerId,
        {
          currency: 100,
        },
      );

      // Now set it to zero
      await this.client.playerOnGameserver.playerOnGameServerControllerSetCurrency(
        player.gameServerId,
        player.playerId,
        {
          currency: 0,
        },
      );

      const playerRes = await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(
        player.gameServerId,
        player.playerId,
      );

      expect(playerRes.data.data.currency).to.be.eq(0);
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
      const rejectedRes = await this.client.playerOnGameserver.playerOnGameServerControllerSetCurrency(
        player.gameServerId,
        player.playerId,
        {
          currency: -100,
        },
      );

      expect(rejectedRes.data.meta.error.message).to.be.eq('Validation error');

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
      const rejectedRes = await this.client.playerOnGameserver.playerOnGameServerControllerSetCurrency(
        player.gameServerId,
        player.playerId,
        {
          currency: -100,
        },
      );

      expect(rejectedRes.data.meta.error.message).to.be.eq('Economy is not enabled');

      return rejectedRes;
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Can send money between two players',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const res = await this.client.playerOnGameserver.playerOnGameServerControllerSearch({
        filters: {
          gameServerId: [this.setupData.gameServer1.id],
        },
      });

      const player1 = res.data.data[0];
      const player2 = res.data.data[1];

      await this.client.settings.settingsControllerSet('economyEnabled', {
        gameServerId: player1.gameServerId,
        value: 'true',
      });
      await this.client.playerOnGameserver.playerOnGameServerControllerSetCurrency(
        player1.gameServerId,
        player1.playerId,
        {
          currency: 100,
        },
      );
      await this.client.playerOnGameserver.playerOnGameServerControllerSetCurrency(
        player2.gameServerId,
        player2.playerId,
        {
          currency: 100,
        },
      );

      await this.client.playerOnGameserver.playerOnGameServerControllerTransactBetweenPlayers(
        player1.gameServerId,
        player1.id,
        player2.id,
        {
          currency: 50,
        },
      );

      const player1Res = await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(
        player1.gameServerId,
        player1.playerId,
      );
      const player2Res = await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(
        player2.gameServerId,
        player2.playerId,
      );

      expect(player1Res.data.data.currency).to.be.eq(50);
      expect(player2Res.data.data.currency).to.be.eq(150);
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Safely aborts transaction when sender does not have enough money',
    setup: SetupGameServerPlayers.setup,
    expectedStatus: 400,
    test: async function () {
      const res = await this.client.playerOnGameserver.playerOnGameServerControllerSearch({
        filters: {
          gameServerId: [this.setupData.gameServer1.id],
        },
      });

      const player1 = res.data.data[0];
      const player2 = res.data.data[1];

      await this.client.settings.settingsControllerSet('economyEnabled', {
        gameServerId: player1.gameServerId,
        value: 'true',
      });
      await this.client.playerOnGameserver.playerOnGameServerControllerSetCurrency(
        player1.gameServerId,
        player1.playerId,
        {
          currency: 100,
        },
      );
      await this.client.playerOnGameserver.playerOnGameServerControllerSetCurrency(
        player2.gameServerId,
        player2.playerId,
        {
          currency: 100,
        },
      );

      try {
        await this.client.playerOnGameserver.playerOnGameServerControllerTransactBetweenPlayers(
          player1.gameServerId,
          player1.id,
          player2.id,
          {
            currency: 150,
          },
        );
      } catch (error) {
        if (!isAxiosError(error)) throw error;
        if (!error.response) throw error;
        expect(error.response.data.meta.error.message).to.be.eq('Insufficient funds');
      }

      const player1Res = await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(
        player1.gameServerId,
        player1.playerId,
      );
      const player2Res = await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(
        player2.gameServerId,
        player2.playerId,
      );

      expect(player1Res.data.data.currency).to.be.eq(100);
      expect(player2Res.data.data.currency).to.be.eq(100);
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Does not allow transacting currency for players on different gameservers',
    setup: SetupGameServerPlayers.setup,
    expectedStatus: 400,
    test: async function () {
      const res1 = await this.client.playerOnGameserver.playerOnGameServerControllerSearch({
        filters: {
          gameServerId: [this.setupData.gameServer1.id],
        },
      });
      const res2 = await this.client.playerOnGameserver.playerOnGameServerControllerSearch({
        filters: {
          gameServerId: [this.setupData.gameServer2.id],
        },
      });

      const player1 = res1.data.data[0];
      const player2 = res2.data.data[0];

      await this.client.settings.settingsControllerSet('economyEnabled', {
        gameServerId: player1.gameServerId,
        value: 'true',
      });

      try {
        await this.client.playerOnGameserver.playerOnGameServerControllerTransactBetweenPlayers(
          player1.gameServerId,
          player1.id,
          player2.id,
          {
            currency: 150,
          },
        );
      } catch (error) {
        if (!isAxiosError(error)) throw error;
        if (!error.response) throw error;
        expect(error.response.data.meta.error.message).to.be.eq('Players are not on the same game server');
      }
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Prevents double-spending or other concurrency-related errors when transacting currency',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const res = await this.client.playerOnGameserver.playerOnGameServerControllerSearch({
        filters: {
          gameServerId: [this.setupData.gameServer1.id],
        },
      });

      const player1 = res.data.data[0];
      const player2 = res.data.data[1];

      await this.client.settings.settingsControllerSet('economyEnabled', {
        gameServerId: player1.gameServerId,
        value: 'true',
      });
      await this.client.playerOnGameserver.playerOnGameServerControllerSetCurrency(
        player1.gameServerId,
        player1.playerId,
        {
          currency: 100,
        },
      );
      await this.client.playerOnGameserver.playerOnGameServerControllerSetCurrency(
        player2.gameServerId,
        player2.playerId,
        {
          currency: 100,
        },
      );

      // Send 10 times 10 from player 1 to player 2
      const transactions = [...Array(10).keys()].map(() =>
        this.client.playerOnGameserver.playerOnGameServerControllerTransactBetweenPlayers(
          player1.gameServerId,
          player1.id,
          player2.id,
          {
            currency: 10,
          },
        ),
      );

      await Promise.all(transactions);

      const player1Res = await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(
        player1.gameServerId,
        player1.playerId,
      );
      const player2Res = await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(
        player2.gameServerId,
        player2.playerId,
      );

      expect(player1Res.data.data.currency).to.be.eq(0);
      expect(player2Res.data.data.currency).to.be.eq(200);
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Add currency for player',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const res = await this.client.playerOnGameserver.playerOnGameServerControllerSearch();

      const player = res.data.data[0];

      await this.client.settings.settingsControllerSet('economyEnabled', {
        gameServerId: player.gameServerId,
        value: 'true',
      });

      // Add 10 times 10 concurrently, to check for concurrency issues
      const adds = [...Array(10).keys()].map(() =>
        this.client.playerOnGameserver.playerOnGameServerControllerAddCurrency(player.gameServerId, player.playerId, {
          currency: 10,
        }),
      );

      await Promise.all(adds);

      const playerRes = await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(
        player.gameServerId,
        player.playerId,
      );

      expect(playerRes.data.data.currency).to.be.eq(100);
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Deduct currency for player',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const res = await this.client.playerOnGameserver.playerOnGameServerControllerSearch();

      const player = res.data.data[0];

      await this.client.settings.settingsControllerSet('economyEnabled', {
        gameServerId: player.gameServerId,
        value: 'true',
      });

      await this.client.playerOnGameserver.playerOnGameServerControllerSetCurrency(
        player.gameServerId,
        player.playerId,
        {
          currency: 100,
        },
      );

      // Deduct 10 times 10 concurrently, to check for concurrency issues
      const deducts = [...Array(10).keys()].map(() =>
        this.client.playerOnGameserver.playerOnGameServerControllerDeductCurrency(
          player.gameServerId,
          player.playerId,
          {
            currency: 10,
          },
        ),
      );

      await Promise.all(deducts);

      const playerRes = await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(
        player.gameServerId,
        player.playerId,
      );

      expect(playerRes.data.data.currency).to.be.eq(0);
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: true,
    name: 'Rejects negative amount for addCurrency',
    setup: SetupGameServerPlayers.setup,
    expectedStatus: 400,
    test: async function () {
      const res = await this.client.playerOnGameserver.playerOnGameServerControllerSearch();
      const player = res.data.data[0];

      await this.client.settings.settingsControllerSet('economyEnabled', {
        gameServerId: player.gameServerId,
        value: 'true',
      });

      const rejectedRes = await this.client.playerOnGameserver.playerOnGameServerControllerAddCurrency(
        player.gameServerId,
        player.playerId,
        {
          currency: -50,
        },
      );

      expect(rejectedRes.data.meta.error.message).to.be.eq('Validation error');
      return rejectedRes;
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: true,
    name: 'Rejects negative amount for deductCurrency',
    setup: SetupGameServerPlayers.setup,
    expectedStatus: 400,
    test: async function () {
      const res = await this.client.playerOnGameserver.playerOnGameServerControllerSearch();
      const player = res.data.data[0];

      await this.client.settings.settingsControllerSet('economyEnabled', {
        gameServerId: player.gameServerId,
        value: 'true',
      });

      const rejectedRes = await this.client.playerOnGameserver.playerOnGameServerControllerDeductCurrency(
        player.gameServerId,
        player.playerId,
        {
          currency: -50,
        },
      );

      expect(rejectedRes.data.meta.error.message).to.be.eq('Validation error');
      return rejectedRes;
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: true,
    name: 'Rejects negative amount for transfer',
    setup: SetupGameServerPlayers.setup,
    expectedStatus: 400,
    test: async function () {
      const res = await this.client.playerOnGameserver.playerOnGameServerControllerSearch();
      const player1 = res.data.data[0];
      const player2 = res.data.data[1];

      await this.client.settings.settingsControllerSet('economyEnabled', {
        gameServerId: player1.gameServerId,
        value: 'true',
      });

      const rejectedRes = await this.client.playerOnGameserver.playerOnGameServerControllerTransactBetweenPlayers(
        player1.gameServerId,
        player1.id,
        player2.id,
        {
          currency: -50,
        },
      );

      expect(rejectedRes.data.meta.error.message).to.be.eq('Validation error');
      return rejectedRes;
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Can delete a POG with proper permissions',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const res = await this.client.playerOnGameserver.playerOnGameServerControllerSearch();
      const pog = res.data.data[0];

      // Verify POG exists
      const pogBefore = await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(
        pog.gameServerId,
        pog.playerId,
      );
      expect(pogBefore.data.data.id).to.be.eq(pog.id);

      // Delete the POG
      await this.client.playerOnGameserver.playerOnGameServerControllerDelete(pog.gameServerId, pog.playerId);

      // Verify POG is deleted
      try {
        await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(pog.gameServerId, pog.playerId);
        throw new Error('Should have thrown 404');
      } catch (error) {
        if (isAxiosError(error)) {
          expect(error.response?.status).to.be.eq(404);
        }
      }

      // Verify player still exists
      const player = await this.client.player.playerControllerGetOne(pog.playerId);
      expect(player.data.data.id).to.be.eq(pog.playerId);
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Cannot delete a POG without MANAGE_PLAYERS permission',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const res = await this.client.playerOnGameserver.playerOnGameServerControllerSearch();
      const pog = res.data.data[0];

      // Create a client without MANAGE_PLAYERS permission
      const { Client } = await import('@takaro/apiclient');
      const { faker } = await import('@faker-js/faker');
      const { PERMISSIONS } = await import('@takaro/auth');

      const permissions = await this.client.permissionCodesToInputs([PERMISSIONS.READ_PLAYERS]);
      const role = await this.client.role.roleControllerCreate({
        name: 'Read only role',
        permissions,
      });

      const userPassword = faker.internet.password();
      const user = await this.client.user.userControllerCreate({
        email: faker.internet.email(),
        password: userPassword,
        name: faker.person.firstName(),
      });

      await this.client.user.userControllerAssignRole(user.data.data.id, role.data.data.id);

      const limitedClient = new Client({
        auth: {
          username: user.data.data.email,
          password: userPassword,
        },
        url: process.env.TAKARO_API_URL || 'http://localhost:13000',
      });
      await limitedClient.login();

      // Try to delete with limited permissions
      try {
        await limitedClient.playerOnGameserver.playerOnGameServerControllerDelete(pog.gameServerId, pog.playerId);
        throw new Error('Should have thrown 403');
      } catch (error) {
        if (isAxiosError(error)) {
          expect(error.response?.status).to.be.eq(403);
        }
      }
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
