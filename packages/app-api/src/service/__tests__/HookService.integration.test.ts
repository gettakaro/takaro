import 'reflect-metadata';

import { EventPlayerConnected, EventChatMessage, HookEvents, ChatChannel } from '@takaro/modules';
import { IntegrationTest, expect, integrationConfig, EventsAwaiter } from '@takaro/test';
import {
  HookOutputDTO,
  GameServerOutputDTO,
  ModuleOutputDTO,
  ModuleInstallationOutputDTO,
  IHookEventTypeEnum,
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
];

describe(group, () => {
  tests.forEach((test) => {
    test.run();
  });
});
