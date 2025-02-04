import 'reflect-metadata';

import { queueService } from '@takaro/queues';
import { EventPlayerConnected, EventChatMessage, HookEvents, ChatChannel } from '@takaro/modules';
import { IntegrationTest, sandbox, expect, integrationConfig, EventsAwaiter } from '@takaro/test';
import { HookOutputDTO, GameServerOutputDTO, ModuleOutputDTO, ModuleInstallationOutputDTO } from '@takaro/apiclient';
import { SinonStub } from 'sinon';
import { describe } from 'node:test';
import { HookService } from '../HookService.js';
import { EVENT_TYPES } from '../EventService.js';

const group = 'HookService';

interface IStandardSetupData {
  normalHook: HookOutputDTO;
  service: HookService;
  gameserver: GameServerOutputDTO;
  mod: ModuleOutputDTO;
  assignment: ModuleInstallationOutputDTO;
  queueAddStub: SinonStub;
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

  const queueAddStub = sandbox.stub(queueService.queues.hooks.queue, 'add');

  if (!this.standardDomainId) throw new Error('No standard domain id set');

  return {
    service: new HookService(this.standardDomainId),
    normalHook,
    mod,
    gameserver,
    assignment,
    queueAddStub,
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
      const _hookExecutedEvents = eventsAwaiter.waitForEvents(EVENT_TYPES.HOOK_EXECUTED, 20);

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
      await this.setupData.service.handleEvent({
        eventData: new EventChatMessage({
          msg: 'chat message',
          channel: ChatChannel.GLOBAL,
        }),
        eventType: HookEvents.CHAT_MESSAGE,
        gameServerId: this.setupData.gameserver.id,
      });

      expect(this.setupData.queueAddStub).to.not.have.been.called;

      // But a different event type should trigger
      await this.setupData.service.handleEvent({
        eventData: new EventPlayerConnected({
          msg: 'foo connected',
        }),
        eventType: HookEvents.PLAYER_CONNECTED,
        gameServerId: this.setupData.gameserver.id,
      });

      expect(this.setupData.queueAddStub).to.have.been.calledOnce;
    },
  }),
  new IntegrationTest<IStandardSetupData>({
    group,
    snapshot: false,
    name: 'Regex filtering works',
    setup,
    test: async function () {
      // Create a new hook that only matches on "bar"
      await this.client.hook.hookControllerCreate({
        name: 'Test hook with regex',
        versionId: this.setupData.mod.latestVersion.id,
        regex: 'bar',
        eventType: 'player-connected',
      });

      await this.setupData.service.handleEvent({
        eventData: new EventPlayerConnected({
          msg: 'foo connected',
        }),
        eventType: HookEvents.PLAYER_CONNECTED,
        gameServerId: this.setupData.gameserver.id,
      });

      expect(this.setupData.queueAddStub).to.have.been.calledOnce;

      await this.setupData.service.handleEvent({
        eventData: new EventPlayerConnected({
          msg: 'bar connected',
        }),
        eventType: HookEvents.PLAYER_CONNECTED,
        gameServerId: this.setupData.gameserver.id,
      });

      expect(this.setupData.queueAddStub).to.have.been.calledThrice;
    },
  }),
];

describe(group, () => {
  tests.forEach((test) => {
    test.run();
  });
});
