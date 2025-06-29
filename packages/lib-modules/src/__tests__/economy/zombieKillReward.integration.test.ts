import { EventsAwaiter, expect, IntegrationTest, IShopSetup, shopSetup } from '@takaro/test';
import { HookEvents } from '../../dto/index.js';
import { Client, PlayerOutputDTO } from '@takaro/apiclient';
import { describe } from 'vitest';

const group = 'EconomyUtils:ZombieKillReward';

async function triggerKills(client: Client, player: PlayerOutputDTO, gameServerId: string, count: number) {
  const events = (await new EventsAwaiter().connect(client)).waitForEvents(HookEvents.ENTITY_KILLED, count);

  if (!player.playerOnGameServers) throw new Error('Player has no pogs');
  const pog = player.playerOnGameServers.find((pog) => pog.gameServerId === gameServerId);
  if (!pog) throw new Error('Player not found on game server');

  await Promise.all(
    Array.from({ length: count }, () => {
      return client.gameserver.gameServerControllerExecuteCommand(gameServerId, {
        command: `triggerKill ${pog.gameId}`,
      });
    }),
  );

  await events;
  return events;
}

const tests = [
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    setup: shopSetup,
    name: 'Simple happy path, killing one zombie gives one currency',
    test: async function () {
      const pogBefore = (
        await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(
          this.setupData.gameserver.id,
          this.setupData.players[0].id,
        )
      ).data.data;

      (
        await this.client.module.moduleInstallationsControllerInstallModule({
          gameServerId: this.setupData.gameserver.id,
          versionId: this.setupData.economyUtilsModule.latestVersion.id,
        })
      ).data.data;
      const zombieKillCronjob = this.setupData.economyUtilsModule.latestVersion.cronJobs.find(
        (cronjob) => cronjob.name === 'zombieKillReward',
      );
      if (!zombieKillCronjob) throw new Error('Cronjob not found');
      await triggerKills(this.client, this.setupData.players[0], this.setupData.gameserver.id, 1);
      await this.client.cronjob.cronJobControllerTrigger({
        gameServerId: this.setupData.gameserver.id,
        moduleId: this.setupData.economyUtilsModule.id,
        cronjobId: zombieKillCronjob.id,
      });

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(HookEvents.CRONJOB_EXECUTED, 1);
      await events;

      const pogAfter = (
        await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(
          this.setupData.gameserver.id,
          this.setupData.players[0].id,
        )
      ).data.data;
      expect(pogAfter.currency).to.equal(pogBefore.currency + 1);
    },
  }),
  /**
   * First kill 3 zombies, then trigger the cronjob
   * Check if the player has 3 currency
   * Then kill 4 zombies
   * Check if the player has 7 currency
   */
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    setup: shopSetup,
    name: 'Killing multiple zombies',
    test: async function () {
      const pogBefore = (
        await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(
          this.setupData.gameserver.id,
          this.setupData.players[0].id,
        )
      ).data.data;

      (
        await this.client.module.moduleInstallationsControllerInstallModule({
          gameServerId: this.setupData.gameserver.id,
          versionId: this.setupData.economyUtilsModule.latestVersion.id,
        })
      ).data.data;
      const zombieKillCronjob = this.setupData.economyUtilsModule.latestVersion.cronJobs.find(
        (cronjob) => cronjob.name === 'zombieKillReward',
      );
      if (!zombieKillCronjob) throw new Error('Cronjob not found');
      await triggerKills(this.client, this.setupData.players[0], this.setupData.gameserver.id, 3);
      await this.client.cronjob.cronJobControllerTrigger({
        gameServerId: this.setupData.gameserver.id,
        moduleId: this.setupData.economyUtilsModule.id,
        cronjobId: zombieKillCronjob.id,
      });

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(HookEvents.CRONJOB_EXECUTED, 1);
      await events;

      let pogAfter = (
        await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(
          this.setupData.gameserver.id,
          this.setupData.players[0].id,
        )
      ).data.data;
      expect(pogAfter.currency).to.equal(pogBefore.currency + 3);

      await triggerKills(this.client, this.setupData.players[0], this.setupData.gameserver.id, 4);
      await this.client.cronjob.cronJobControllerTrigger({
        gameServerId: this.setupData.gameserver.id,
        moduleId: this.setupData.economyUtilsModule.id,
        cronjobId: zombieKillCronjob.id,
      });

      const events2 = (await new EventsAwaiter().connect(this.client)).waitForEvents(HookEvents.CRONJOB_EXECUTED, 1);
      await events2;

      pogAfter = (
        await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(
          this.setupData.gameserver.id,
          this.setupData.players[0].id,
        )
      ).data.data;
      expect(pogAfter.currency).to.equal(pogBefore.currency + 7);
    },
  }),
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    setup: shopSetup,
    name: 'Different players killing zombies assigns the right amount to the right players',
    test: async function () {
      const pogBefore1 = (
        await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(
          this.setupData.gameserver.id,
          this.setupData.players[0].id,
        )
      ).data.data;
      const pogBefore2 = (
        await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(
          this.setupData.gameserver.id,
          this.setupData.players[1].id,
        )
      ).data.data;

      (
        await this.client.module.moduleInstallationsControllerInstallModule({
          gameServerId: this.setupData.gameserver.id,
          versionId: this.setupData.economyUtilsModule.latestVersion.id,
        })
      ).data.data;
      const zombieKillCronjob = this.setupData.economyUtilsModule.latestVersion.cronJobs.find(
        (cronjob) => cronjob.name === 'zombieKillReward',
      );
      if (!zombieKillCronjob) throw new Error('Cronjob not found');
      await triggerKills(this.client, this.setupData.players[0], this.setupData.gameserver.id, 3);
      await triggerKills(this.client, this.setupData.players[1], this.setupData.gameserver.id, 4);
      await this.client.cronjob.cronJobControllerTrigger({
        gameServerId: this.setupData.gameserver.id,
        moduleId: this.setupData.economyUtilsModule.id,
        cronjobId: zombieKillCronjob.id,
      });

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(HookEvents.CRONJOB_EXECUTED, 1);
      await events;

      const pogAfter1 = (
        await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(
          this.setupData.gameserver.id,
          this.setupData.players[0].id,
        )
      ).data.data;
      const pogAfter2 = (
        await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(
          this.setupData.gameserver.id,
          this.setupData.players[1].id,
        )
      ).data.data;
      expect(pogAfter1.currency).to.equal(pogBefore1.currency + 3);
      expect(pogAfter2.currency).to.equal(pogBefore2.currency + 4);
    },
  }),
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    setup: shopSetup,
    name: 'Can configure a custom amount of currency per kill',
    test: async function () {
      const pogBefore = (
        await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(
          this.setupData.gameserver.id,
          this.setupData.players[0].id,
        )
      ).data.data;
      (
        await this.client.module.moduleInstallationsControllerInstallModule({
          gameServerId: this.setupData.gameserver.id,
          versionId: this.setupData.economyUtilsModule.latestVersion.id,
          userConfig: JSON.stringify({ zombieKillReward: 5 }),
        })
      ).data.data;
      const zombieKillCronjob = this.setupData.economyUtilsModule.latestVersion.cronJobs.find(
        (cronjob) => cronjob.name === 'zombieKillReward',
      );
      if (!zombieKillCronjob) throw new Error('Cronjob not found');
      await triggerKills(this.client, this.setupData.players[0], this.setupData.gameserver.id, 1);
      await this.client.cronjob.cronJobControllerTrigger({
        gameServerId: this.setupData.gameserver.id,
        moduleId: this.setupData.economyUtilsModule.id,
        cronjobId: zombieKillCronjob.id,
      });

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(HookEvents.CRONJOB_EXECUTED, 1);
      await events;

      const pogAfter = (
        await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(
          this.setupData.gameserver.id,
          this.setupData.players[0].id,
        )
      ).data.data;
      expect(pogAfter.currency).to.equal(pogBefore.currency + 5);
    },
  }),
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    setup: shopSetup,
    name: 'Can override amount earned per role',
    test: async function () {
      const zombieKillEarnerPermission = await this.client.permissionCodesToInputs(['ZOMBIE_KILL_REWARD_OVERRIDE']);
      await this.client.role.roleControllerUpdate(this.setupData.role.id, {
        permissions: [
          {
            permissionId: zombieKillEarnerPermission[0].permissionId,
            count: 3,
          },
        ],
      });

      const pogBefore = (
        await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(
          this.setupData.gameserver.id,
          this.setupData.players[0].id,
        )
      ).data.data;
      (
        await this.client.module.moduleInstallationsControllerInstallModule({
          gameServerId: this.setupData.gameserver.id,
          versionId: this.setupData.economyUtilsModule.latestVersion.id,
          userConfig: JSON.stringify({ zombieKillReward: 5 }),
        })
      ).data.data;

      const zombieKillCronjob = this.setupData.economyUtilsModule.latestVersion.cronJobs.find(
        (cronjob) => cronjob.name === 'zombieKillReward',
      );
      if (!zombieKillCronjob) throw new Error('Cronjob not found');
      await triggerKills(this.client, this.setupData.players[0], this.setupData.gameserver.id, 1);
      await this.client.cronjob.cronJobControllerTrigger({
        gameServerId: this.setupData.gameserver.id,
        moduleId: this.setupData.economyUtilsModule.id,
        cronjobId: zombieKillCronjob.id,
      });

      const events = (await new EventsAwaiter().connect(this.client)).waitForEvents(HookEvents.CRONJOB_EXECUTED, 1);
      await events;

      const pogAfter = (
        await this.client.playerOnGameserver.playerOnGameServerControllerGetOne(
          this.setupData.gameserver.id,
          this.setupData.players[0].id,
        )
      ).data.data;
      expect(pogAfter.currency).to.equal(pogBefore.currency + 3);
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
