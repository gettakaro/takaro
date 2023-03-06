import { HookService } from '../HookService.js';
import { QueuesService } from '@takaro/queues';
import { EventPlayerConnected, EventChatMessage } from '@takaro/gameserver';
import { IntegrationTest, sandbox, expect } from '@takaro/test';
import {
  HookOutputDTO,
  GameServerOutputDTO,
  ModuleOutputDTO,
  ModuleInstallDTO,
} from '@takaro/apiclient';
import { SinonStub } from 'sinon';
const group = 'HookService';

interface IStandardSetupData {
  normalHook: HookOutputDTO;
  service: HookService;
  gameserver: GameServerOutputDTO;
  mod: ModuleOutputDTO;
  assignment: ModuleInstallDTO;
  queueAddStub: SinonStub;
}

async function setup(
  this: IntegrationTest<IStandardSetupData>
): Promise<IStandardSetupData> {
  const mod = (
    await this.client.module.moduleControllerCreate({
      name: 'Test module',
    })
  ).data.data;
  const normalHook = (
    await this.client.hook.hookControllerCreate({
      name: 'Test hook',
      moduleId: mod.id,
      regex: '.*',
      eventType: 'player-connected',
    })
  ).data.data;

  const gameserver = (
    await this.client.gameserver.gameServerControllerCreate({
      name: 'Test gameserver',
      type: 'MOCK',
      connectionInfo: '{}',
    })
  ).data.data;

  const assignment = (
    await this.client.gameserver.gameServerControllerInstallModule(
      gameserver.id,
      mod.id,
      { config: '{}' }
    )
  ).data.data;

  const queues = QueuesService.getInstance();
  const queueAddStub = sandbox.stub(queues.queues.hooks.queue, 'add');

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
      await this.setupData.service.handleEvent(
        await new EventPlayerConnected().construct({
          msg: 'foo connected',
        }),
        this.setupData.gameserver.id
      );

      expect(this.setupData.queueAddStub).to.have.been.calledOnce;
    },
  }),
  new IntegrationTest<IStandardSetupData>({
    group,
    snapshot: false,
    name: 'Does not trigger for different event type',
    setup,
    test: async function () {
      await this.setupData.service.handleEvent(
        await new EventChatMessage().construct({
          msg: 'chat message',
        }),
        this.setupData.gameserver.id
      );

      expect(this.setupData.queueAddStub).to.not.have.been.called;

      // But a different event type should trigger
      await this.setupData.service.handleEvent(
        await new EventPlayerConnected().construct({
          msg: 'foo connected',
        }),
        this.setupData.gameserver.id
      );

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
        moduleId: this.setupData.mod.id,
        regex: 'bar',
        eventType: 'player-connected',
      });

      await this.setupData.service.handleEvent(
        await new EventPlayerConnected().construct({
          msg: 'foo connected',
        }),
        this.setupData.gameserver.id
      );

      expect(this.setupData.queueAddStub).to.have.been.calledOnce;

      await this.setupData.service.handleEvent(
        await new EventPlayerConnected().construct({
          msg: 'bar connected',
        }),
        this.setupData.gameserver.id
      );

      expect(this.setupData.queueAddStub).to.have.been.calledThrice;
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
