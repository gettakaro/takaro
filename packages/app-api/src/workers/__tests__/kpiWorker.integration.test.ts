import { IntegrationTest } from '@takaro/test';
import { GameServerOutputDTO, ModuleOutputDTO, ModuleInstallationOutputDTO } from '@takaro/apiclient';
import { describe } from 'node:test';
import { randomUUID } from 'crypto';
import { getMockServer } from '@takaro/mock-gameserver';
import { processJob } from '../kpiWorker.js';
import { Job } from 'bullmq';
import { PlayerService } from '../../service/Player/index.js';
import { PlayerOnGameServerService } from '../../service/PlayerOnGameserverService.js';
import { IGamePlayer } from '@takaro/modules';
import { PlayerOnGameServerUpdateDTO } from '../../service/PlayerOnGameserverService.js';

const group = 'KPI Worker';

interface ISetupData {
  gameServers: GameServerOutputDTO[];
  module: ModuleOutputDTO;
  installations: ModuleInstallationOutputDTO[];
  mockServers: Awaited<ReturnType<typeof getMockServer>>[];
}

async function setup(this: IntegrationTest<ISetupData>): Promise<ISetupData> {
  if (!this.domainRegistrationToken) throw new Error('Domain registration token is not set. Invalid setup?');
  if (!this.standardDomainId) throw new Error('No standard domain id set!');

  // Create a test module
  const modCreate = (
    await this.client.module.moduleControllerCreate({
      name: 'Test module for KPI',
    })
  ).data.data;

  const module = (await this.client.module.moduleControllerGetOne(modCreate.id)).data.data;

  // Create multiple game servers
  const gameServers: GameServerOutputDTO[] = [];
  const mockServers: Awaited<ReturnType<typeof getMockServer>>[] = [];
  const installations: ModuleInstallationOutputDTO[] = [];

  for (let i = 0; i < 2; i++) {
    const identityToken = randomUUID();
    const mockServer = await this.createMockServer({
      mockserver: {
        registrationToken: this.domainRegistrationToken,
        identityToken,
      },
    });
    mockServers.push(mockServer);

    const gameServerRes = (
      await this.client.gameserver.gameServerControllerSearch({
        filters: { identityToken: [identityToken] },
      })
    ).data.data;
    const gameserver = gameServerRes.find((gs) => gs.identityToken === identityToken);
    if (!gameserver) throw new Error('Game server not found. Did something fail when registering?');
    gameServers.push(gameserver);

    // Install module on each game server
    const installation = (
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: gameserver.id,
        versionId: module.latestVersion.id,
      })
    ).data.data;
    installations.push(installation);
  }

  // Create some players with different activity levels
  const playerService = new PlayerService(this.standardDomainId);
  const pogService = new PlayerOnGameServerService(this.standardDomainId);

  const now = new Date();
  const oneDayAgo = new Date(now.valueOf() - 1000 * 60 * 60 * 24);
  const oneWeekAgo = new Date(now.valueOf() - 1000 * 60 * 60 * 24 * 7);
  const oneMonthAgo = new Date(now.valueOf() - 1000 * 60 * 60 * 24 * 30);
  const twoMonthsAgo = new Date(now.valueOf() - 1000 * 60 * 60 * 24 * 60);

  // Create players with different last seen times for testing metrics
  const playersData = [
    { name: 'DailyActive1', lastSeen: now },
    { name: 'DailyActive2', lastSeen: now },
    { name: 'WeeklyActive1', lastSeen: oneDayAgo },
    { name: 'WeeklyActive2', lastSeen: new Date(now.valueOf() - 1000 * 60 * 60 * 24 * 3) },
    { name: 'MonthlyActive1', lastSeen: oneWeekAgo },
    { name: 'MonthlyActive2', lastSeen: new Date(now.valueOf() - 1000 * 60 * 60 * 24 * 15) },
    { name: 'Inactive1', lastSeen: oneMonthAgo },
    { name: 'Inactive2', lastSeen: twoMonthsAgo },
  ];

  for (const playerData of playersData) {
    const mockPlayer = new IGamePlayer({
      ip: '169.169.169.80',
      name: playerData.name,
      gameId: randomUUID(),
      steamId: randomUUID().replace(/-/g, '').substring(0, 17),
    });

    // Create player on first game server
    const { pog } = await playerService.resolveRef(mockPlayer, gameServers[0].id);

    // Update last seen time
    await pogService.update(
      pog.id,
      new PlayerOnGameServerUpdateDTO({
        online: false,
      }),
    );

    // Manually update lastSeen in the database (since the service doesn't expose this directly)
    // This is a bit hacky but necessary for testing
    const { getKnex } = await import('@takaro/db');
    const knex = await getKnex();
    await knex.raw('UPDATE "playerOnGameServer" SET "lastSeen" = ? WHERE id = ?', [
      playerData.lastSeen.toISOString(),
      pog.id,
    ]);
  }

  // Create some users with different activity levels
  const usersData = [
    { name: 'UserDaily1', lastSeen: now },
    { name: 'UserWeekly1', lastSeen: oneDayAgo },
    { name: 'UserMonthly1', lastSeen: oneWeekAgo },
    { name: 'UserInactive1', lastSeen: twoMonthsAgo },
  ];

  for (const userData of usersData) {
    // Create user via API
    const userRes = await this.client.user.userControllerCreate({
      name: userData.name,
      email: `${userData.name.toLowerCase()}@test.com`,
      password: 'Password123!',
    });

    // Update last seen time
    const { getKnex } = await import('@takaro/db');
    const knex = await getKnex();
    await knex.raw('UPDATE users SET "lastSeen" = ? WHERE id = ?', [
      userData.lastSeen.toISOString(),
      userRes.data.data.id,
    ]);
  }

  return {
    gameServers,
    module,
    installations,
    mockServers,
  };
}

const tests = [
  new IntegrationTest<ISetupData>({
    group,
    snapshot: false,
    name: 'Processes KPI metrics without errors',
    setup,
    teardown: async function () {
      // Clean up mock servers
      if (this.setupData?.mockServers) {
        await Promise.all(this.setupData.mockServers.map((server) => server.shutdown()));
      }
    },
    test: async function () {
      // Create a mock job object (processJob doesn't actually use it)
      const mockJob = {} as Job<unknown>;

      // Run the KPI worker process
      let error: Error | null = null;
      try {
        await processJob(mockJob);
      } catch (e) {
        error = e as Error;
        console.error('KPI Worker failed with error:', error.message);
        console.error('Stack trace:', error.stack);
      }

      // The main assertion: the function should complete without errors
      if (error) {
        throw error; // Re-throw to see the actual error
      }

      // Optional: We could verify that metrics were set, but that would require
      // accessing the metrics object, which might not be exposed in a testable way
      // For now, just ensuring the function runs without connection pool issues is sufficient

      return;
    },
  }),
  new IntegrationTest<ISetupData>({
    group,
    snapshot: false,
    name: 'Handles empty domains gracefully',
    setup: async function () {
      // Minimal setup - just return empty data
      return {
        gameServers: [],
        module: {} as ModuleOutputDTO,
        installations: [],
        mockServers: [],
      };
    },
    test: async function () {
      const mockJob = {} as Job<unknown>;

      // Should handle case with no game servers gracefully
      let error: Error | null = null;
      try {
        await processJob(mockJob);
      } catch (e) {
        error = e as Error;
        console.error('KPI Worker (empty test) failed with error:', error.message);
        console.error('Stack trace:', error.stack);
      }

      if (error) {
        throw error; // Re-throw to see the actual error
      }
      return;
    },
  }),
];

describe(group, () => {
  tests.forEach((test) => {
    test.run();
  });
});
