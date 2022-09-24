import { IntegrationTest } from '@takaro/test';
import { HookOutputDTOAPI, FunctionOutputDTOAPI } from '@takaro/apiclient';

const group = 'HookController';

const mockHook = (moduleId: string) => ({
  name: 'Test hook',
  trigger: '/this (is) a [regex]/g',
  moduleId,
});

interface ISetupHookAndFunction {
  hook: HookOutputDTOAPI;
  fn: FunctionOutputDTOAPI;
}

const tests: IntegrationTest<any>[] = [
  new IntegrationTest<HookOutputDTOAPI>({
    group,
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
    filteredFields: ['moduleId'],
  }),
  new IntegrationTest<void>({
    group,
    name: 'Create',
    test: async function () {
      const module = (
        await this.client.module.moduleControllerCreate({
          name: 'Test module',
        })
      ).data.data;
      return this.client.hook.hookControllerCreate(mockHook(module.id));
    },
    filteredFields: ['moduleId'],
  }),
  new IntegrationTest<HookOutputDTOAPI>({
    group,
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
        trigger: '/new [regex]/g',
      });
    },
    filteredFields: ['moduleId'],
  }),
  new IntegrationTest<HookOutputDTOAPI>({
    group,
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
  new IntegrationTest<ISetupHookAndFunction>({
    group,
    name: 'Can assign a function to a hook',
    setup: async function () {
      const module = (
        await this.client.module.moduleControllerCreate({
          name: 'Test module',
        })
      ).data.data;
      const hook = (
        await this.client.hook.hookControllerCreate(mockHook(module.id))
      ).data;
      const fn = (
        await this.client.function.functionControllerCreate({
          code: 'console.log("Hello world")',
        })
      ).data;
      return {
        hook,
        fn,
      };
    },
    test: async function () {
      return this.client.hook.hookControllerAssignFunction(
        this.setupData.hook.data.id,
        this.setupData.fn.data.id
      );
    },
    filteredFields: ['moduleId'],
  }),
  new IntegrationTest<ISetupHookAndFunction>({
    group,
    name: 'Can unassign a function from a hook',
    setup: async function () {
      const module = (
        await this.client.module.moduleControllerCreate({
          name: 'Test module',
        })
      ).data.data;
      const hook = (
        await this.client.hook.hookControllerCreate(mockHook(module.id))
      ).data;
      const fn = (
        await this.client.function.functionControllerCreate({
          code: 'console.log("Hello world")',
        })
      ).data;
      await this.client.hook.hookControllerAssignFunction(
        hook.data.id,
        fn.data.id
      );
      return {
        hook,
        fn,
      };
    },
    test: async function () {
      return this.client.hook.hookControllerUnassignFunction(
        this.setupData.hook.data.id,
        this.setupData.fn.data.id
      );
    },
    filteredFields: ['moduleId'],
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
