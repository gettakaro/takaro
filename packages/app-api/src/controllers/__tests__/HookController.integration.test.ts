import { IntegrationTest, expect } from '@takaro/test';
import {
  HookOutputDTOAPI,
  HookCreateDTOEventTypeEnum,
} from '@takaro/apiclient';

const group = 'HookController';

const mockHook = (moduleId: string) => ({
  name: 'Test hook',
  regex: '/this (is) a [regex]/g',
  eventType: HookCreateDTOEventTypeEnum.Log,
  moduleId,
});

const tests = [
  new IntegrationTest<HookOutputDTOAPI>({
    group,
    snapshot: true,
    name: 'Get by ID',
    setup: async function () {
      const module = (
        await this.client.module.moduleControllerCreate({
          name: 'Test module',
        })
      ).data.data;
      return (await this.client.hook.hookControllerCreate(mockHook(module.id)))
        .data;
    },
    test: async function () {
      return this.client.hook.hookControllerGetOne(this.setupData.data.id);
    },
    filteredFields: ['moduleId', 'functionId'],
  }),
  new IntegrationTest<void>({
    group,
    snapshot: true,
    name: 'Create',
    test: async function () {
      const module = (
        await this.client.module.moduleControllerCreate({
          name: 'Test module',
        })
      ).data.data;
      return this.client.hook.hookControllerCreate(mockHook(module.id));
    },
    filteredFields: ['moduleId', 'functionId'],
  }),
  new IntegrationTest<HookOutputDTOAPI>({
    group,
    snapshot: true,
    name: 'Update',
    setup: async function () {
      const module = (
        await this.client.module.moduleControllerCreate({
          name: 'Test module',
        })
      ).data.data;
      return (await this.client.hook.hookControllerCreate(mockHook(module.id)))
        .data;
    },
    test: async function () {
      return this.client.hook.hookControllerUpdate(this.setupData.data.id, {
        name: 'Updated hook',
        enabled: false,
        regex: '/new [regex]/g',
      });
    },
    filteredFields: ['moduleId', 'functionId'],
  }),
  new IntegrationTest<HookOutputDTOAPI>({
    group,
    snapshot: true,
    name: 'Delete',
    setup: async function () {
      const module = (
        await this.client.module.moduleControllerCreate({
          name: 'Test module',
        })
      ).data.data;
      return (await this.client.hook.hookControllerCreate(mockHook(module.id)))
        .data;
    },
    test: async function () {
      return this.client.hook.hookControllerRemove(this.setupData.data.id);
    },
  }),
  new IntegrationTest<void>({
    group,
    snapshot: true,
    name: 'Rejects catastrophic exponential-time regexes',
    test: async function () {
      const module = (
        await this.client.module.moduleControllerCreate({
          name: 'Test module',
        })
      ).data.data;
      return this.client.hook.hookControllerCreate({
        ...mockHook(module.id),
        regex: '/(x+x+)+y/',
      });
    },
    expectedStatus: 400,
    filteredFields: ['moduleId'],
  }),
  new IntegrationTest<{ id: string }>({
    group,
    snapshot: true,
    name: 'Does not allow creating 2 hooks with the same name inside the same module',
    setup: async function () {
      const module = (
        await this.client.module.moduleControllerCreate({
          name: 'Test module',
        })
      ).data.data;

      await this.client.hook.hookControllerCreate(mockHook(module.id));

      return module;
    },
    test: async function () {
      // Creating a hook with a new name should be fine
      const hook = (
        await this.client.hook.hookControllerCreate({
          ...mockHook(this.setupData.id),
          name: 'New name',
        })
      ).data.data;

      expect(hook.name).to.be.eq('New name');

      // But using the same name again should fail
      return this.client.hook.hookControllerCreate(mockHook(this.setupData.id));
    },
    expectedStatus: 409,
    filteredFields: ['moduleId'],
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
