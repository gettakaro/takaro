import { IntegrationTest, expect } from '@takaro/test';
import { HookCreateDTOEventTypeEnum, ModuleOutputDTO, HookOutputDTO } from '@takaro/apiclient';
import { describe } from 'node:test';
import { randomUUID } from 'crypto';

const group = 'HookController';

const mockHook = (versionId: string) => ({
  name: 'Test hook',
  description: 'Cool description',
  regex: '/this (is) a [regex]/g',
  eventType: HookCreateDTOEventTypeEnum.Log,
  versionId,
});

interface ISetupData {
  module: ModuleOutputDTO;
  hook: HookOutputDTO;
}

async function setup(this: IntegrationTest<any>): Promise<ISetupData> {
  const module = (
    await this.client.module.moduleControllerCreate({
      name: 'Test module',
    })
  ).data.data;
  return {
    module,
    hook: (await this.client.hook.hookControllerCreate(mockHook(module.latestVersion.id))).data.data,
  };
}

const tests = [
  new IntegrationTest<ISetupData>({
    group,
    snapshot: true,
    name: 'Get by ID',
    setup,
    test: async function () {
      return this.client.hook.hookControllerGetOne(this.setupData.hook.id);
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
      return this.client.hook.hookControllerCreate(mockHook(module.latestVersion.id));
    },
    filteredFields: ['moduleId', 'functionId'],
  }),
  new IntegrationTest<ISetupData>({
    group,
    snapshot: true,
    name: 'Update',
    setup,
    test: async function () {
      return this.client.hook.hookControllerUpdate(this.setupData.hook.id, {
        name: 'Updated hook',
        description: 'Updated description',
        regex: '/new [regex]/g',
      });
    },
    filteredFields: ['moduleId', 'functionId'],
  }),
  new IntegrationTest<ISetupData>({
    group,
    snapshot: true,
    name: 'Delete',
    setup,
    test: async function () {
      return this.client.hook.hookControllerRemove(this.setupData.hook.id);
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
        ...mockHook(module.latestVersion.id),
        regex: '/(x+x+)+y/',
      });
    },
    expectedStatus: 400,
    filteredFields: ['moduleId'],
  }),
  new IntegrationTest<ISetupData>({
    group,
    snapshot: true,
    name: 'Does not allow creating 2 hooks with the same name inside the same module',
    setup,
    test: async function () {
      // Creating a hook with a new name should be fine
      const hook = (
        await this.client.hook.hookControllerCreate({
          ...mockHook(this.setupData.module.latestVersion.id),
          name: 'New name',
        })
      ).data.data;

      expect(hook.name).to.be.eq('New name');

      // But using the same name again should fail
      return this.client.hook.hookControllerCreate(mockHook(this.setupData.module.latestVersion.id));
    },
    expectedStatus: 409,
    filteredFields: ['moduleId'],
  }),
  new IntegrationTest<ISetupData>({
    group,
    snapshot: true,
    name: 'Can search by moduleId',
    setup,
    test: async function () {
      const versionRes = await this.client.module.moduleVersionControllerGetModuleVersion(
        this.setupData.hook.versionId,
      );

      const res = await this.client.hook.hookControllerSearch({
        filters: {
          moduleId: [versionRes.data.data.moduleId],
        },
      });

      expect(res.data.data).to.have.length(1);

      const badFilterRes = await this.client.hook.hookControllerSearch({
        filters: {
          moduleId: [randomUUID()],
        },
      });

      expect(badFilterRes.data.data).to.have.length(0);

      return res;
    },
    filteredFields: ['moduleId', 'functionId', 'hookId'],
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
