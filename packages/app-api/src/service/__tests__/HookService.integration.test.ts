import 'reflect-metadata';

import { EventPlayerConnected, EventChatMessage, HookEvents, ChatChannel } from '@takaro/modules';
import { IntegrationTest, expect, integrationConfig, EventsAwaiter, SetupGameServerPlayers } from '@takaro/test';
import {
  HookOutputDTO,
  GameServerOutputDTO,
  ModuleOutputDTO,
  ModuleInstallationOutputDTO,
  IHookEventTypeEnum,
  isAxiosError,
  PlayerOnGameserverOutputDTO,
} from '@takaro/apiclient';
import { describe } from 'node:test';

const group = 'HookService';

interface IStandardSetupData {
  normalHook: HookOutputDTO;
  gameserver: GameServerOutputDTO;
  mod: ModuleOutputDTO;
  assignment: ModuleInstallationOutputDTO;
}

async function setup(this: IntegrationTest<IStandardSetupData>): Promise<IStandardSetupData> {
  const mod = (
    await this.client.module.moduleControllerCreate({
      name: 'Test module',
    })
  ).data.data;
  const normalHook = (
    await this.client.hook.hookControllerCreate({
      name: 'Test hook',
      versionId: mod.latestVersion.id,
      regex: '.*',
      eventType: 'player-connected',
    })
  ).data.data;

  const gameserver = (
    await this.client.gameserver.gameServerControllerCreate({
      name: 'Test gameserver',
      type: 'MOCK',
      connectionInfo: JSON.stringify({
        host: integrationConfig.get('mockGameserver.host'),
      }),
    })
  ).data.data;

  const assignment = (
    await this.client.module.moduleInstallationsControllerInstallModule({
      gameServerId: gameserver.id,
      versionId: mod.latestVersion.id,
    })
  ).data.data;

  if (!this.standardDomainId) throw new Error('No standard domain id set');

  return {
    normalHook,
    mod,
    gameserver,
    assignment,
  };
}

const tests = [
  new IntegrationTest<IStandardSetupData>({
    group,
    snapshot: false,
    name: 'Basic hook trigger',
    setup,
    test: async function () {
      // Set up an events awaiter
      const eventsAwaiter = new EventsAwaiter();
      await eventsAwaiter.connect(this.client);
      const _hookExecutedEvents = eventsAwaiter.waitForEvents(IHookEventTypeEnum.HookExecuted, 1);

      // Trigger the hook
      await this.client.hook.hookControllerTrigger({
        gameServerId: this.setupData.gameserver.id,
        moduleId: this.setupData.mod.id,
        eventType: HookEvents.PLAYER_CONNECTED,
        eventMeta: new EventPlayerConnected({
          msg: 'foo connected',
        }),
      });

      // Then, check that the hook was triggered
      const hookExecutedEvents = await _hookExecutedEvents;
      expect(hookExecutedEvents).to.have.length(1);
    },
  }),
  new IntegrationTest<IStandardSetupData>({
    group,
    snapshot: false,
    name: 'Does not trigger for different event type',
    setup,
    test: async function () {
      // Set up events awaiter
      const eventsAwaiter = new EventsAwaiter();
      await eventsAwaiter.connect(this.client);
      const _hookExecutedEvents = eventsAwaiter.waitForEvents(IHookEventTypeEnum.HookExecuted, 1);

      // Trigger with chat message (should not trigger hook)
      await this.client.hook.hookControllerTrigger({
        gameServerId: this.setupData.gameserver.id,
        moduleId: this.setupData.mod.id,
        eventType: HookEvents.CHAT_MESSAGE,
        eventMeta: new EventChatMessage({
          msg: 'chat message',
          channel: ChatChannel.GLOBAL,
        }),
      });

      // Trigger with player connected (should trigger hook)
      await this.client.hook.hookControllerTrigger({
        gameServerId: this.setupData.gameserver.id,
        moduleId: this.setupData.mod.id,
        eventType: HookEvents.PLAYER_CONNECTED,
        eventMeta: new EventPlayerConnected({
          msg: 'foo connected',
        }),
      });

      const hookExecutedEvents = await _hookExecutedEvents;
      expect(hookExecutedEvents).to.have.length(1);
    },
  }),
  new IntegrationTest<IStandardSetupData>({
    group,
    snapshot: false,
    name: 'Regex filtering works',
    setup,
    test: async function () {
      // Set up events awaiter
      const eventsAwaiter = new EventsAwaiter();
      await eventsAwaiter.connect(this.client);

      // Create a new hook that only matches on "bar"
      await this.client.hook.hookControllerCreate({
        name: 'Test hook with regex',
        versionId: this.setupData.mod.latestVersion.id,
        regex: 'bar',
        eventType: 'player-connected',
      });

      const _hookExecutedEvents = eventsAwaiter.waitForEvents(IHookEventTypeEnum.HookExecuted, 3);

      // Trigger with "foo" (should trigger only the first hook)
      await this.client.hook.hookControllerTrigger({
        gameServerId: this.setupData.gameserver.id,
        moduleId: this.setupData.mod.id,
        eventType: HookEvents.PLAYER_CONNECTED,
        eventMeta: new EventPlayerConnected({
          msg: 'foo connected',
        }),
      });

      // Trigger with "bar" (should trigger both hooks)
      await this.client.hook.hookControllerTrigger({
        gameServerId: this.setupData.gameserver.id,
        moduleId: this.setupData.mod.id,
        eventType: HookEvents.PLAYER_CONNECTED,
        eventMeta: new EventPlayerConnected({
          msg: 'bar connected',
        }),
      });

      const hookExecutedEvents = await _hookExecutedEvents;
      expect(hookExecutedEvents).to.have.length(3); // 1 from first trigger + 2 from second trigger
    },
  }),
  new IntegrationTest<IStandardSetupData>({
    group,
    snapshot: false,
    name: 'Delays have a max value',
    setup,
    test: async function () {
      try {
        await this.client.module.moduleInstallationsControllerInstallModule({
          gameServerId: this.setupData.gameserver.id,
          versionId: this.setupData.mod.latestVersion.id,
          systemConfig: JSON.stringify({
            hooks: {
              [this.setupData.normalHook.name]: {
                delay: 10000000000,
              },
            },
          }),
        });
        throw new Error('Should have thrown');
      } catch (error) {
        if (!isAxiosError(error)) throw error;
        expect(error.response?.status).to.equal(400);
        expect(error.response?.data.meta.error.message).to.be.eq(
          `Invalid config: /hooks/${this.setupData.normalHook.name}/delay must be <= 86400`,
        );
      }
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Hooks can have a global-scoped cooldown',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const eventsAwaiter = new EventsAwaiter();
      await eventsAwaiter.connect(this.client);
      const executedEvents = eventsAwaiter.waitForEvents(IHookEventTypeEnum.HookExecuted, 1);
      const mod = (
        await this.client.module.moduleControllerCreate({
          name: 'Module',
        })
      ).data.data;
      const hook = (
        await this.client.hook.hookControllerCreate({
          name: 'Test hook',
          versionId: mod.latestVersion.id,
          regex: '.*',
          eventType: HookEvents.PLAYER_CONNECTED,
        })
      ).data.data;
      // Install with a cooldown
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameServer1.id,
        versionId: mod.latestVersion.id,
        systemConfig: JSON.stringify({
          hooks: {
            [hook.name]: {
              cooldown: 100,
              cooldownType: 'player',
            },
          },
        }),
      });

      // Trigger it twice in quick succession
      const triggerHook = async (gameServerId: string, pog: PlayerOnGameserverOutputDTO) =>
        this.client.hook.hookControllerTrigger({
          gameServerId: gameServerId,
          moduleId: mod.id,
          eventType: HookEvents.PLAYER_CONNECTED,
          eventMeta: new EventPlayerConnected({
            player: { gameId: pog.gameId, name: pog.id },
            msg: 'foo connected',
          }),
        });
      await triggerHook(this.setupData.gameServer1.id, this.setupData.pogs1[0]);
      await triggerHook(this.setupData.gameServer2.id, this.setupData.pogs2[0]);
      await executedEvents;
      // Only one should have triggered
      const hookExecutedEvents = await this.client.event.eventControllerSearch({
        filters: { eventName: [IHookEventTypeEnum.HookExecuted] },
      });
      expect(hookExecutedEvents.data.data).to.have.length(1);
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Hooks can have a player-scoped cooldown',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const eventsAwaiter = new EventsAwaiter();
      await eventsAwaiter.connect(this.client);
      const executedEvents = eventsAwaiter.waitForEvents(IHookEventTypeEnum.HookExecuted, 2);
      const mod = (
        await this.client.module.moduleControllerCreate({
          name: 'Module',
        })
      ).data.data;
      const hook = (
        await this.client.hook.hookControllerCreate({
          name: 'Test hook',
          versionId: mod.latestVersion.id,
          regex: '.*',
          eventType: HookEvents.PLAYER_CONNECTED,
        })
      ).data.data;
      // Install with a cooldown
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameServer1.id,
        versionId: mod.latestVersion.id,
        systemConfig: JSON.stringify({
          hooks: {
            [hook.name]: {
              cooldown: 100,
              cooldownType: 'player',
            },
          },
        }),
      });

      const triggerHook = async (gameServerId: string, pog: PlayerOnGameserverOutputDTO) =>
        this.client.hook.hookControllerTrigger({
          gameServerId: gameServerId,
          moduleId: mod.id,
          playerId: pog.playerId,
          eventType: HookEvents.PLAYER_CONNECTED,
          eventMeta: new EventPlayerConnected({
            player: { gameId: pog.gameId, name: pog.id },
            msg: 'foo connected',
          }),
        });
      await triggerHook(this.setupData.gameServer1.id, this.setupData.pogs1[0]);
      // This should be on cooldown
      await triggerHook(this.setupData.gameServer1.id, this.setupData.pogs1[0]);
      // Different player should not be on cooldown
      await triggerHook(this.setupData.gameServer1.id, this.setupData.pogs1[1]);
      await executedEvents;
      // Two should have triggered
      const hookExecutedEvents = await this.client.event.eventControllerSearch({
        filters: { eventName: [IHookEventTypeEnum.HookExecuted] },
      });
      expect(hookExecutedEvents.data.data).to.have.length(2);
    },
  }),
  new IntegrationTest<SetupGameServerPlayers.ISetupData>({
    group,
    snapshot: false,
    name: 'Hooks can have a server-scoped cooldown',
    setup: SetupGameServerPlayers.setup,
    test: async function () {
      const eventsAwaiter = new EventsAwaiter();
      await eventsAwaiter.connect(this.client);
      const executedEvents = eventsAwaiter.waitForEvents(IHookEventTypeEnum.HookExecuted, 2);
      const mod = (
        await this.client.module.moduleControllerCreate({
          name: 'Module',
        })
      ).data.data;
      const hook = (
        await this.client.hook.hookControllerCreate({
          name: 'Test hook',
          versionId: mod.latestVersion.id,
          regex: '.*',
          eventType: HookEvents.PLAYER_CONNECTED,
        })
      ).data.data;
      // Install with a cooldown
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameServer1.id,
        versionId: mod.latestVersion.id,
        systemConfig: JSON.stringify({
          hooks: {
            [hook.name]: {
              cooldown: 100,
              cooldownType: 'server',
            },
          },
        }),
      });
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameServer2.id,
        versionId: mod.latestVersion.id,
        systemConfig: JSON.stringify({
          hooks: {
            [hook.name]: {
              cooldown: 100,
              cooldownType: 'server',
            },
          },
        }),
      });

      const triggerHook = async (gameServerId: string) =>
        this.client.hook.hookControllerTrigger({
          gameServerId: gameServerId,
          moduleId: mod.id,
          eventType: HookEvents.PLAYER_CONNECTED,
          eventMeta: new EventPlayerConnected({
            msg: 'foo connected',
          }),
        });
      await triggerHook(this.setupData.gameServer1.id);
      // This should be on cooldown
      await triggerHook(this.setupData.gameServer1.id);
      // Different server should not be on cooldown
      await triggerHook(this.setupData.gameServer2.id);
      await executedEvents;
      // Two should have triggered
      const hookExecutedEvents = await this.client.event.eventControllerSearch({
        filters: { eventName: [IHookEventTypeEnum.HookExecuted] },
      });
      expect(hookExecutedEvents.data.data).to.have.length(2);
    },
  }),
];

describe(group, () => {
  tests.forEach((test) => {
    test.run();
  });
});
