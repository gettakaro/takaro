import { IntegrationTest, SetupGameServerPlayers, expect } from '@takaro/test';
import { queueService } from '@takaro/queues';
import { randomUUID } from 'node:crypto';
import { Client, isAxiosError } from '@takaro/apiclient';
import { describe } from 'node:test';

async function triggerBanSync(domainId: string, gameServerId: string) {
  const job = await queueService.queues.bansSync.queue.add({ domainId, gameServerId, triggerId: randomUUID() });

  if (!job || !job.id) throw new Error('Job ID not found');

  // Poll the job until it's done
  while (true) {
    const jobToAwait = await queueService.queues.bansSync.queue.bullQueue.getJob(job.id);
    if (!jobToAwait) throw new Error('Job not found');
    if (await jobToAwait.isCompleted()) {
      break;
    }
    if (await jobToAwait.isFailed()) {
      throw new Error(`Job failed: ${jobToAwait.failedReason}.`);
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

/**
 * This function aims to simulate when an admin bans someone without using Takaro.
 * So if effect, this creates bans that are not takaroManaged.
 * @param gameServerId
 * @param playerId
 */
async function banPlayerOutOfBand(client: Client, gameServerId: string, playerId: string, reason?: string) {
  await client.gameserver.gameServerControllerExecuteCommand(gameServerId, {
    command: `ban ${playerId} ${reason || 'unknown reason'}`,
  });
}

async function unbanPlayerOutOfBand(client: Client, gameServerId: string, playerId: string) {
  await client.gameserver.gameServerControllerExecuteCommand(gameServerId, {
    command: `unban ${playerId}`,
  });
}

const group = 'BanService';

const tests = [
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Can sync game bans into database',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      if (!this.standardDomainId) throw new Error('Standard domain ID not found');
      await banPlayerOutOfBand(this.client, this.setupData.gameServer1.id, this.setupData.pogs1[0].gameId);
      await triggerBanSync(this.standardDomainId, this.setupData.gameServer1.id);
      const bans = await this.client.player.banControllerSearch({
        filters: { gameServerId: [this.setupData.gameServer1.id] },
      });
      expect(bans.data.data.length).to.equal(1);
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Ban player, sync -> exists. Unban, sync -> not exists',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      if (!this.standardDomainId) throw new Error('Standard domain ID not found');
      // Step 1: Ban the player
      await banPlayerOutOfBand(this.client, this.setupData.gameServer1.id, this.setupData.pogs1[0].gameId);

      // Step 2: Trigger ban sync
      await triggerBanSync(this.standardDomainId, this.setupData.gameServer1.id);
      // Step 3: Verify that the player is banned
      let bans = await this.client.player.banControllerSearch({
        filters: { gameServerId: [this.setupData.gameServer1.id] },
      });
      expect(bans.data.data.length).to.equal(1);
      // Step 4: Unban the player
      await unbanPlayerOutOfBand(this.client, this.setupData.gameServer1.id, this.setupData.pogs1[0].gameId);
      // Step 5: Trigger ban sync again after unban
      await triggerBanSync(this.standardDomainId, this.setupData.gameServer1.id);
      // Step 6: Verify that the player is no longer banned
      bans = await this.client.player.banControllerSearch({
        filters: { gameServerId: [this.setupData.gameServer1.id] },
      });
      expect(bans.data.data.length).to.equal(0);
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Ban player, sync -> exists. Ban again, sync -> exists',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      if (!this.standardDomainId) throw new Error('Standard domain ID not found');
      // Step 1: Ban the player for the first time
      await banPlayerOutOfBand(this.client, this.setupData.gameServer1.id, this.setupData.pogs1[0].gameId);
      // Step 2: Trigger ban sync
      await triggerBanSync(this.standardDomainId, this.setupData.gameServer1.id);
      // Step 3: Verify that the player is banned
      let bans = await this.client.player.banControllerSearch({
        filters: { gameServerId: [this.setupData.gameServer1.id] },
      });
      expect(bans.data.data.length).to.equal(1);
      // Step 4: Ban the player again (same player, same game server)
      await banPlayerOutOfBand(this.client, this.setupData.gameServer1.id, this.setupData.pogs1[0].gameId);
      // Step 5: Trigger ban sync again after second ban
      await triggerBanSync(this.standardDomainId, this.setupData.gameServer1.id);
      // Step 6: Verify that the player is still banned
      bans = await this.client.player.banControllerSearch({
        filters: { gameServerId: [this.setupData.gameServer1.id] },
      });
      expect(bans.data.data.length).to.equal(1);
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Ban player, sync -> exists. Ban again with different reason, sync -> exists with new reason',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      if (!this.standardDomainId) throw new Error('Standard domain ID not found');
      // Step 1: Ban the player for the first time with reason1
      await banPlayerOutOfBand(this.client, this.setupData.gameServer1.id, this.setupData.pogs1[0].gameId, 'reason1');
      // Step 2: Trigger ban sync
      await triggerBanSync(this.standardDomainId, this.setupData.gameServer1.id);
      // Step 3: Verify that the player is banned with reason1
      let bans = await this.client.player.banControllerSearch({
        filters: { gameServerId: [this.setupData.gameServer1.id] },
      });
      expect(bans.data.data.length).to.equal(1);
      expect(bans.data.data[0].reason).to.equal('reason1');
      // Step 4: Ban the player again with reason2
      await banPlayerOutOfBand(this.client, this.setupData.gameServer1.id, this.setupData.pogs1[0].gameId, 'reason2');
      // Step 5: Trigger ban sync again after second ban with a new reason
      await triggerBanSync(this.standardDomainId, this.setupData.gameServer1.id);
      // Step 6: Verify that the player's ban exists with the new reason
      bans = await this.client.player.banControllerSearch({
        filters: { gameServerId: [this.setupData.gameServer1.id] },
      });
      expect(bans.data.data.length).to.equal(1);
      expect(bans.data.data[0].reason).to.equal('reason2');
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'ban player1 and player2, sync -> exists for both. Unban player1, sync -> exists for player2',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      if (!this.standardDomainId) throw new Error('Standard domain ID not found');
      // Step 1: Ban player1 and player2
      await banPlayerOutOfBand(this.client, this.setupData.gameServer1.id, this.setupData.pogs1[0].gameId);
      await banPlayerOutOfBand(this.client, this.setupData.gameServer1.id, this.setupData.pogs1[1].gameId);
      // Step 2: Trigger ban sync
      await triggerBanSync(this.standardDomainId, this.setupData.gameServer1.id);
      // Step 3: Verify that both players are banned
      let bans = await this.client.player.banControllerSearch({
        filters: { gameServerId: [this.setupData.gameServer1.id] },
      });
      expect(bans.data.data.length).to.equal(2);
      // Step 4: Unban player1
      await unbanPlayerOutOfBand(this.client, this.setupData.gameServer1.id, this.setupData.pogs1[0].gameId);
      // Step 5: Trigger ban sync again after unban
      await triggerBanSync(this.standardDomainId, this.setupData.gameServer1.id);
      // Step 6: Verify that player1 is no longer banned, but player2 is still banned
      bans = await this.client.player.banControllerSearch({
        filters: { gameServerId: [this.setupData.gameServer1.id] },
      });
      expect(bans.data.data.length).to.equal(1);
      expect(bans.data.data[0].playerId).to.equal(this.setupData.pogs1[1].playerId);
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Ban player with takaroManaged, remove ban from the game server directly, sync -> ban is reapplied.',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      if (!this.standardDomainId) throw new Error('Standard domain ID not found');
      await this.client.player.banControllerCreate({
        gameServerId: this.setupData.gameServer1.id,
        playerId: this.setupData.pogs1[0].playerId,
        reason: 'reason',
        isGlobal: false,
      });

      await this.client.gameserver.gameServerControllerExecuteCommand(this.setupData.gameServer1.id, {
        command: `unban ${this.setupData.pogs1[0].gameId}`,
      });

      await triggerBanSync(this.standardDomainId, this.setupData.gameServer1.id);

      const bans = await this.client.player.banControllerSearch({
        filters: { gameServerId: [this.setupData.gameServer1.id] },
      });

      expect(bans.data.data.length).to.equal(1);
      expect(bans.data.data[0].playerId).to.equal(this.setupData.pogs1[0].playerId);
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Apply global ban, sync -> player is banned on all servers.',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      if (!this.standardDomainId) throw new Error('Standard domain ID not found');
      await this.client.player.banControllerCreate({
        playerId: this.setupData.pogs1[0].playerId,
        reason: 'reason',
        isGlobal: true,
      });

      await this.client.gameserver.gameServerControllerExecuteCommand(this.setupData.gameServer1.id, {
        command: `unban ${this.setupData.pogs1[0].gameId}`,
      });

      await triggerBanSync(this.standardDomainId, this.setupData.gameServer1.id);

      const bans = await this.client.player.banControllerSearch({
        filters: { gameServerId: [this.setupData.gameServer1.id] },
      });

      expect(bans.data.data.length).to.equal(1);
    },
  }),

  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Global ban player, sync -> exists on all servers. Delete ban, sync -> player is unbanned on all servers.',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      if (!this.standardDomainId) throw new Error('Standard domain ID not found');
      const createRes = await this.client.player.banControllerCreate({
        playerId: this.setupData.pogs1[0].playerId,
        reason: 'reason',
        isGlobal: true,
      });

      await triggerBanSync(this.standardDomainId, this.setupData.gameServer1.id);

      let bans = await this.client.player.banControllerSearch({
        filters: { gameServerId: [this.setupData.gameServer1.id] },
      });

      expect(bans.data.data.length).to.equal(1);

      await this.client.player.banControllerDelete(createRes.data.data.id);

      await triggerBanSync(this.standardDomainId, this.setupData.gameServer1.id);

      bans = await this.client.player.banControllerSearch({
        filters: { gameServerId: [this.setupData.gameServer1.id] },
      });

      expect(bans.data.data.length).to.equal(0);
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: true,
    name: 'Creating a global ban and passing a gameserver ID errors',
    setup: SetupGameServerPlayers.setup,
    expectedStatus: 400,
    test: async function () {
      if (!this.standardDomainId) throw new Error('Standard domain ID not found');
      try {
        await this.client.player.banControllerCreate({
          playerId: this.setupData.pogs1[0].playerId,
          reason: 'reason',
          isGlobal: true,
          gameServerId: this.setupData.gameServer1.id,
        });
      } catch (error) {
        if (!isAxiosError(error)) throw error;
        expect(error.response?.status).to.equal(400);
        expect(error.response?.data.meta.error.message).to.equal(
          'When creating a global ban, gameServerId must be null. When creating a non-global ban, gameServerId must be set.',
        );
        return error.response;
      }
    },
  }),

  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: true,
    name: 'Creating a non-global ban and not passing a gameserver ID errors',
    setup: SetupGameServerPlayers.setup,
    expectedStatus: 400,
    test: async function () {
      if (!this.standardDomainId) throw new Error('Standard domain ID not found');
      try {
        await this.client.player.banControllerCreate({
          playerId: this.setupData.pogs1[0].playerId,
          reason: 'reason',
          isGlobal: false,
        });
      } catch (error) {
        if (!isAxiosError(error)) throw error;
        expect(error.response?.status).to.equal(400);
        expect(error.response?.data.meta.error.message).to.equal(
          'When creating a global ban, gameServerId must be null. When creating a non-global ban, gameServerId must be set.',
        );
        return error.response;
      }
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
