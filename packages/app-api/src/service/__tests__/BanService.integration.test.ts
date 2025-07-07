import { IntegrationTest, SetupGameServerPlayers, expect } from '@takaro/test';
import { Client, isAxiosError } from '@takaro/apiclient';
import { describe } from 'node:test';
import { TakaroEvents } from '@takaro/modules';

async function triggerBanSync(client: Client, domainId: string, gameServerId: string) {
  const triggeredJobRes = await client.gameserver.gameServerControllerTriggerJob('syncBans', gameServerId);
  const triggeredJob = triggeredJobRes.data.data;
  if (!triggeredJob || !triggeredJob.id) throw new Error('Triggered job ID not found');

  // Poll the job until it's done
  while (true) {
    const jobToAwait = await (
      await client.gameserver.gameServerControllerGetJob('syncBans', triggeredJob.id)
    ).data.data;
    if (!jobToAwait) throw new Error('Job not found');
    if (jobToAwait.status === 'completed') {
      break;
    }
    if (jobToAwait.status === 'failed') {
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
      await triggerBanSync(this.client, this.standardDomainId, this.setupData.gameServer1.id);
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
      await triggerBanSync(this.client, this.standardDomainId, this.setupData.gameServer1.id);
      // Step 3: Verify that the player is banned
      let bans = await this.client.player.banControllerSearch({
        filters: { gameServerId: [this.setupData.gameServer1.id] },
      });
      expect(bans.data.data.length).to.equal(1);
      // Step 4: Unban the player
      await unbanPlayerOutOfBand(this.client, this.setupData.gameServer1.id, this.setupData.pogs1[0].gameId);
      // Step 5: Trigger ban sync again after unban
      await triggerBanSync(this.client, this.standardDomainId, this.setupData.gameServer1.id);
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
      await triggerBanSync(this.client, this.standardDomainId, this.setupData.gameServer1.id);
      // Step 3: Verify that the player is banned
      let bans = await this.client.player.banControllerSearch({
        filters: { gameServerId: [this.setupData.gameServer1.id] },
      });
      expect(bans.data.data.length).to.equal(1);
      // Step 4: Ban the player again (same player, same game server)
      await banPlayerOutOfBand(this.client, this.setupData.gameServer1.id, this.setupData.pogs1[0].gameId);
      // Step 5: Trigger ban sync again after second ban
      await triggerBanSync(this.client, this.standardDomainId, this.setupData.gameServer1.id);
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
      await triggerBanSync(this.client, this.standardDomainId, this.setupData.gameServer1.id);
      // Step 3: Verify that the player is banned with reason1
      let bans = await this.client.player.banControllerSearch({
        filters: { gameServerId: [this.setupData.gameServer1.id] },
      });
      expect(bans.data.data.length).to.equal(1);
      expect(bans.data.data[0].reason).to.equal('reason1');
      // Step 4: Ban the player again with reason2
      await banPlayerOutOfBand(this.client, this.setupData.gameServer1.id, this.setupData.pogs1[0].gameId, 'reason2');
      // Step 5: Trigger ban sync again after second ban with a new reason
      await triggerBanSync(this.client, this.standardDomainId, this.setupData.gameServer1.id);
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
      await triggerBanSync(this.client, this.standardDomainId, this.setupData.gameServer1.id);
      // Step 3: Verify that both players are banned
      let bans = await this.client.player.banControllerSearch({
        filters: { gameServerId: [this.setupData.gameServer1.id] },
      });
      expect(bans.data.data.length).to.equal(2);
      // Step 4: Unban player1
      await unbanPlayerOutOfBand(this.client, this.setupData.gameServer1.id, this.setupData.pogs1[0].gameId);
      // Step 5: Trigger ban sync again after unban
      await triggerBanSync(this.client, this.standardDomainId, this.setupData.gameServer1.id);
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

      // Check that PLAYER_BANNED event was created
      const events = await this.client.event.eventControllerSearch({
        filters: {
          playerId: [this.setupData.pogs1[0].playerId],
          eventName: [TakaroEvents.PLAYER_BANNED],
        },
        sortBy: 'createdAt',
        sortDirection: 'desc',
        limit: 10,
      });

      expect(events.data.data.length).to.be.greaterThan(
        0,
        'Expected at least one PLAYER_BANNED event to be created after ban creation',
      );
      const banEvent = events.data.data[0];
      expect(banEvent.eventName).to.equal(TakaroEvents.PLAYER_BANNED, 'Event should be PLAYER_BANNED');
      expect(banEvent.playerId).to.equal(
        this.setupData.pogs1[0].playerId,
        'Event playerId should match the banned player',
      );
      expect(banEvent.gameserverId).to.equal(
        this.setupData.gameServer1.id,
        'Event gameserverId should match the server where ban was applied',
      );

      const meta = banEvent.meta as any;
      expect(meta.reason).to.equal('reason', 'Event metadata should contain the ban reason');
      expect(meta.isGlobal).to.equal(false, 'Event metadata should indicate this is not a global ban');
      expect(meta.takaroManaged).to.equal(true, 'Event metadata should indicate this is a Takaro-managed ban');

      await this.client.gameserver.gameServerControllerExecuteCommand(this.setupData.gameServer1.id, {
        command: `unban ${this.setupData.pogs1[0].gameId}`,
      });

      await triggerBanSync(this.client, this.standardDomainId, this.setupData.gameServer1.id);

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

      // Check that PLAYER_BANNED event was created for global ban
      const events = await this.client.event.eventControllerSearch({
        filters: {
          playerId: [this.setupData.pogs1[0].playerId],
          eventName: [TakaroEvents.PLAYER_BANNED],
        },
        sortBy: 'createdAt',
        sortDirection: 'desc',
        limit: 10,
      });

      expect(events.data.data.length).to.be.greaterThan(
        0,
        'Expected at least one PLAYER_BANNED event to be created for global ban',
      );
      const banEvent = events.data.data[0];
      expect(banEvent.eventName).to.equal(TakaroEvents.PLAYER_BANNED, 'Event should be PLAYER_BANNED');
      expect(banEvent.playerId).to.equal(
        this.setupData.pogs1[0].playerId,
        'Event playerId should match the banned player',
      );
      expect(banEvent.gameserverId).to.be.null; // Global ban events should not have a gameServerId

      const meta = banEvent.meta as any;
      expect(meta.reason).to.equal('reason', 'Event metadata should contain the ban reason');
      expect(meta.isGlobal).to.equal(true, 'Event metadata should indicate this is a global ban');
      expect(meta.takaroManaged).to.equal(true, 'Event metadata should indicate this is a Takaro-managed ban');

      await this.client.gameserver.gameServerControllerExecuteCommand(this.setupData.gameServer1.id, {
        command: `unban ${this.setupData.pogs1[0].gameId}`,
      });

      await triggerBanSync(this.client, this.standardDomainId, this.setupData.gameServer1.id);

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

      // Check that PLAYER_BANNED event was created
      const banEvents = await this.client.event.eventControllerSearch({
        filters: {
          playerId: [this.setupData.pogs1[0].playerId],
          eventName: [TakaroEvents.PLAYER_BANNED],
        },
        sortBy: 'createdAt',
        sortDirection: 'desc',
        limit: 10,
      });

      expect(banEvents.data.data.length).to.be.greaterThan(
        0,
        'Expected at least one PLAYER_BANNED event after global ban creation',
      );
      const banEvent = banEvents.data.data[0];
      expect(banEvent.eventName).to.equal(TakaroEvents.PLAYER_BANNED, 'Ban event should be PLAYER_BANNED');
      expect(banEvent.playerId).to.equal(
        this.setupData.pogs1[0].playerId,
        'Ban event playerId should match the banned player',
      );
      expect(banEvent.gameserverId).to.be.null; // Global ban event should not have a gameServerId

      const banMeta = banEvent.meta as any;
      expect(banMeta.reason).to.equal('reason', 'Ban event metadata should contain the ban reason');
      expect(banMeta.isGlobal).to.equal(true, 'Ban event metadata should indicate this is a global ban');
      expect(banMeta.takaroManaged).to.equal(true, 'Ban event metadata should indicate this is a Takaro-managed ban');

      await triggerBanSync(this.client, this.standardDomainId, this.setupData.gameServer1.id);

      let bans = await this.client.player.banControllerSearch({
        filters: { gameServerId: [this.setupData.gameServer1.id] },
      });

      expect(bans.data.data.length).to.equal(1);

      await this.client.player.banControllerDelete(createRes.data.data.id);

      // Check that PLAYER_UNBANNED event was created
      const unbanEvents = await this.client.event.eventControllerSearch({
        filters: {
          playerId: [this.setupData.pogs1[0].playerId],
          eventName: [TakaroEvents.PLAYER_UNBANNED],
        },
        sortBy: 'createdAt',
        sortDirection: 'desc',
        limit: 10,
      });

      expect(unbanEvents.data.data.length).to.be.greaterThan(
        0,
        'Expected at least one PLAYER_UNBANNED event after ban deletion',
      );

      // Find the global unban event (with null gameserverId)
      const globalUnbanEvent = unbanEvents.data.data.find((event) => event.gameserverId === null);
      expect(globalUnbanEvent, 'Expected to find a global PLAYER_UNBANNED event with null gameserverId').to.not.be
        .undefined;

      expect(globalUnbanEvent!.eventName).to.equal(
        TakaroEvents.PLAYER_UNBANNED,
        'Unban event should be PLAYER_UNBANNED',
      );
      expect(globalUnbanEvent!.playerId).to.equal(
        this.setupData.pogs1[0].playerId,
        'Unban event playerId should match the unbanned player',
      );
      expect(globalUnbanEvent!.gameserverId).to.be.null; // Global unban event should not have a gameServerId

      const unbanMeta = globalUnbanEvent!.meta as any;
      expect(unbanMeta.isGlobal).to.equal(true, 'Unban event metadata should indicate this was a global ban');
      expect(unbanMeta.takaroManaged).to.equal(
        true,
        'Unban event metadata should indicate this was a Takaro-managed ban',
      );

      await triggerBanSync(this.client, this.standardDomainId, this.setupData.gameServer1.id);

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
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Can handle bans with a very long reason',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      if (!this.standardDomainId) throw new Error('Standard domain ID not found');
      const longReason = 'a'.repeat(1000);
      await this.client.player.banControllerCreate({
        gameServerId: this.setupData.gameServer1.id,
        playerId: this.setupData.pogs1[0].playerId,
        reason: longReason,
        isGlobal: false,
      });

      // Check that PLAYER_BANNED event was created with long reason
      const events = await this.client.event.eventControllerSearch({
        filters: {
          playerId: [this.setupData.pogs1[0].playerId],
          eventName: [TakaroEvents.PLAYER_BANNED],
        },
        sortBy: 'createdAt',
        sortDirection: 'desc',
        limit: 10,
      });

      expect(events.data.data.length).to.be.greaterThan(
        0,
        'Expected at least one PLAYER_BANNED event for ban with long reason (1000 chars)',
      );
      const banEvent = events.data.data[0];
      expect(banEvent.eventName).to.equal(TakaroEvents.PLAYER_BANNED, 'Event should be PLAYER_BANNED');

      const meta = banEvent.meta as any;
      expect(meta.reason).to.equal(longReason, 'Event metadata should contain the full 1000-character ban reason');
      expect(meta.isGlobal).to.equal(false, 'Event metadata should indicate this is not a global ban');
      expect(meta.takaroManaged).to.equal(true, 'Event metadata should indicate this is a Takaro-managed ban');

      await triggerBanSync(this.client, this.standardDomainId, this.setupData.gameServer1.id);

      const bans = await this.client.player.banControllerSearch({
        filters: { gameServerId: [this.setupData.gameServer1.id] },
      });

      expect(bans.data.data.length).to.equal(1);
      expect(bans.data.data[0].reason).to.equal(longReason);
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Bans with reason longer than 10,000 characters are truncated',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      if (!this.standardDomainId) throw new Error('Standard domain ID not found');
      const longReason = 'a'.repeat(15000);
      await this.client.player.banControllerCreate({
        gameServerId: this.setupData.gameServer1.id,
        playerId: this.setupData.pogs1[0].playerId,
        reason: longReason,
        isGlobal: false,
      });

      // Check that PLAYER_BANNED event was created with truncated reason
      const events = await this.client.event.eventControllerSearch({
        filters: {
          playerId: [this.setupData.pogs1[0].playerId],
          eventName: [TakaroEvents.PLAYER_BANNED],
        },
        sortBy: 'createdAt',
        sortDirection: 'desc',
        limit: 10,
      });

      expect(events.data.data.length).to.be.greaterThan(
        0,
        'Expected at least one PLAYER_BANNED event for ban with very long reason (15000 chars)',
      );
      const banEvent = events.data.data[0];
      expect(banEvent.eventName).to.equal(TakaroEvents.PLAYER_BANNED, 'Event should be PLAYER_BANNED');

      const meta = banEvent.meta as any;
      // The event reason should also be truncated to 10,000 characters
      expect(meta.reason.length).to.equal(10000, 'Event metadata reason should be truncated to 10,000 characters');
      expect(meta.reason).to.equal(
        longReason.substring(0, 10000),
        'Event metadata should contain the ban reason truncated to 10,000 characters',
      );
      expect(meta.isGlobal).to.equal(false, 'Event metadata should indicate this is not a global ban');
      expect(meta.takaroManaged).to.equal(true, 'Event metadata should indicate this is a Takaro-managed ban');

      await triggerBanSync(this.client, this.standardDomainId, this.setupData.gameServer1.id);

      const bans = await this.client.player.banControllerSearch({
        filters: { gameServerId: [this.setupData.gameServer1.id] },
      });

      expect(bans.data.data.length).to.equal(1);
      expect(bans.data.data[0].reason?.length).to.be.at.most(10000); // Ensure the reason is truncated to 10,000 characters
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
