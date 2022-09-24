import { handleHooks } from './eventWorker';
import { IntegrationTest, sandbox, expect } from '@takaro/test';
import {
  HookOutputDTOAPI,
  HookCreateDTOEventTypeEnum,
} from '@takaro/apiclient';
import { GameEvents } from '@takaro/gameserver';
import { QueuesService } from '@takaro/queues';

const group = 'Event worker';
const groupHooks = 'Event worker - Hook handling';

interface ISetupHooks {
  hooks: HookOutputDTOAPI[];
}

const tests: IntegrationTest<any>[] = [
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
      return {
        hooks: [hook],
      };
    },
    test: async function () {
      if (!this.standardDomainId) throw new Error('No standard domain id');

      const queues = QueuesService.getInstance();
      const addStub = sandbox.stub(queues.queues.hooks.queue, 'add');

      await handleHooks({
        type: GameEvents.LOG_LINE,
        domainId: this.standardDomainId,
        data: {
          msg: 'this is a test',
          timestamp: new Date(),
          type: GameEvents.LOG_LINE,
        },
      });

      expect(addStub).to.have.been.calledOnce;

      return addStub;
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

      return {
        hooks: [hookOne, hookTwo],
      };
    },
    test: async function () {
      if (!this.standardDomainId) throw new Error('No standard domain id');

      const queues = QueuesService.getInstance();
      const addStub = sandbox.stub(queues.queues.hooks.queue, 'add');

      await handleHooks({
        type: GameEvents.LOG_LINE,
        domainId: this.standardDomainId,
        data: {
          msg: 'this is a test',
          timestamp: new Date(),
          type: GameEvents.LOG_LINE,
        },
      });

      expect(addStub).to.have.been.calledTwice;

      return addStub;
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

      return {
        hooks: [hookOne, hookTwo],
      };
    },
    test: async function () {
      if (!this.standardDomainId) throw new Error('No standard domain id');

      const queues = QueuesService.getInstance();

      const addStub = sandbox.stub(queues.queues.hooks.queue, 'add');

      await handleHooks({
        type: GameEvents.LOG_LINE,
        domainId: this.standardDomainId,
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

      return addStub;
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
