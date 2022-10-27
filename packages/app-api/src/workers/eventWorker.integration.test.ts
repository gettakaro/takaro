import { handleHooks } from './eventWorker';
import { IntegrationTest, sandbox, expect } from '@takaro/test';
import {
  HookOutputDTOAPI,
  HookCreateDTOEventTypeEnum,
} from '@takaro/apiclient';
import { GameEvents } from '@takaro/gameserver';
import { QueuesService } from '@takaro/queues';
import { GameServerOutputDTO } from '@takaro/apiclient';

const group = 'Event worker';
const groupHooks = 'Event worker - Hook handling';

interface ISetupHooks {
  hooks: HookOutputDTOAPI[];
  gameserver: GameServerOutputDTO;
}

const tests = [
  new IntegrationTest<ISetupHooks>({
    group: groupHooks,
    name: 'Can handle a simple triggered hook (happy path)',
    snapshot: false,

    setup: async function () {
      const module = (
        await this.client.module.moduleControllerCreate({
          name: 'Test module',
        })
      ).data.data;
      const hook = (
        await this.client.hook.hookControllerCreate({
          name: 'Test hook',
          regex: 'this is',
          eventType: HookCreateDTOEventTypeEnum.Log,
          moduleId: module.id,
        })
      ).data;

      const gameserver = (
        await this.client.gameserver.gameServerControllerCreate({
          name: 'Test gameserver',
          type: 'MOCK',
          connectionInfo: '{}',
        })
      ).data.data;

      return {
        hooks: [hook],
        gameserver,
      };
    },
    test: async function () {
      if (!this.standardDomainId) throw new Error('No standard domain id');

      const queues = QueuesService.getInstance();
      const addStub = sandbox.stub(queues.queues.hooks.queue, 'add');

      await handleHooks({
        type: GameEvents.LOG_LINE,
        domainId: this.standardDomainId,
        gameServerId: this.setupData.gameserver.id,
        data: {
          msg: 'this is a test',
          timestamp: new Date(),
          type: GameEvents.LOG_LINE,
        },
      });

      expect(addStub).to.have.been.calledOnce;
    },
  }),
  new IntegrationTest<ISetupHooks>({
    group: groupHooks,
    name: 'Can handle multiple triggered hooks',
    snapshot: false,
    setup: async function () {
      const module = (
        await this.client.module.moduleControllerCreate({
          name: 'Test module',
        })
      ).data.data;
      const hookOne = (
        await this.client.hook.hookControllerCreate({
          name: 'Test hook',
          regex: 'this is',
          eventType: HookCreateDTOEventTypeEnum.Log,
          moduleId: module.id,
        })
      ).data;
      const hookTwo = (
        await this.client.hook.hookControllerCreate({
          name: 'Test hook 2',
          regex: 'this is',
          eventType: HookCreateDTOEventTypeEnum.Log,
          moduleId: module.id,
        })
      ).data;
      const gameserver = (
        await this.client.gameserver.gameServerControllerCreate({
          name: 'Test gameserver',
          type: 'MOCK',
          connectionInfo: '{}',
        })
      ).data.data;

      return {
        hooks: [hookOne, hookTwo],
        gameserver,
      };
    },
    test: async function () {
      if (!this.standardDomainId) throw new Error('No standard domain id');

      const queues = QueuesService.getInstance();
      const addStub = sandbox.stub(queues.queues.hooks.queue, 'add');

      await handleHooks({
        type: GameEvents.LOG_LINE,
        domainId: this.standardDomainId,
        gameServerId: this.setupData.gameserver.id,
        data: {
          msg: 'this is a test',
          timestamp: new Date(),
          type: GameEvents.LOG_LINE,
        },
      });

      expect(addStub).to.have.been.calledTwice;
    },
  }),
  new IntegrationTest<ISetupHooks>({
    group: groupHooks,
    name: 'Acts correctly when a subset of hooks get triggered',
    snapshot: false,
    setup: async function () {
      const module = (
        await this.client.module.moduleControllerCreate({
          name: 'Test module',
        })
      ).data.data;
      const hookOne = (
        await this.client.hook.hookControllerCreate({
          name: 'Test hook',
          regex: 'this is',
          eventType: HookCreateDTOEventTypeEnum.Log,
          moduleId: module.id,
        })
      ).data;
      const hookTwo = (
        await this.client.hook.hookControllerCreate({
          name: 'Test hook 2',
          regex: 'this is not',
          eventType: HookCreateDTOEventTypeEnum.Log,
          moduleId: module.id,
        })
      ).data;

      const gameserver = (
        await this.client.gameserver.gameServerControllerCreate({
          name: 'Test gameserver',
          type: 'MOCK',
          connectionInfo: '{}',
        })
      ).data.data;

      return {
        hooks: [hookOne, hookTwo],
        gameserver,
      };
    },
    test: async function () {
      if (!this.standardDomainId) throw new Error('No standard domain id');

      const queues = QueuesService.getInstance();

      const addStub = sandbox.stub(queues.queues.hooks.queue, 'add');

      await handleHooks({
        type: GameEvents.LOG_LINE,
        domainId: this.standardDomainId,
        gameServerId: this.setupData.gameserver.id,
        data: {
          msg: 'this is a test',
          timestamp: new Date(),
          type: GameEvents.LOG_LINE,
        },
      });

      expect(addStub).to.have.been.calledOnce;

      const calledItemId = addStub.lastCall.args[0];
      const calledData = addStub.lastCall.args[1];
      expect(calledItemId).to.be.eq(this.setupData.hooks[0].data.id);
      expect(calledData.domainId).to.be.eq(this.standardDomainId);
      expect(calledData.itemId).to.be.eq(this.setupData.hooks[0].data.id);
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
