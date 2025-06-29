import { IntegrationTest, expect } from '@takaro/test';
import { FunctionOutputDTO, ModuleOutputDTO } from '@takaro/apiclient';
import { describe } from 'vitest';
import { randomUUID } from 'crypto';

const group = 'FunctionController';

const mockFunction = (versionId?: string) => ({
  code: 'console.log("Hello world")',
  description: 'Cool description',
  versionId,
});

interface ISetupData {
  module: ModuleOutputDTO;
  fn: FunctionOutputDTO;
  moduleFn: FunctionOutputDTO;
}

async function setup(this: IntegrationTest<any>): Promise<ISetupData> {
  const module = (
    await this.client.module.moduleControllerCreate({
      name: 'Test module',
    })
  ).data.data;
  return {
    module,
    fn: (await this.client.function.functionControllerCreate(mockFunction())).data.data,
    moduleFn: (await this.client.function.functionControllerCreate(mockFunction(module.latestVersion.id))).data.data,
  };
}

const tests = [
  new IntegrationTest<ISetupData>({
    group,
    snapshot: true,
    name: 'Get by ID',
    setup,
    test: async function () {
      return this.client.function.functionControllerGetOne(this.setupData.fn.id);
    },
  }),
  new IntegrationTest<void>({
    group,
    snapshot: true,
    name: 'Create',
    test: async function () {
      return this.client.function.functionControllerCreate(mockFunction());
    },
  }),
  new IntegrationTest<ISetupData>({
    group,
    snapshot: true,
    name: 'Update',
    setup,
    test: async function () {
      return this.client.function.functionControllerUpdate(this.setupData.fn.id, {
        code: 'console.log("Bye world")',
        name: 'New name',
        description: 'New description',
      });
    },
  }),
  new IntegrationTest<ISetupData>({
    group,
    snapshot: true,
    name: 'Delete',
    setup,
    test: async function () {
      return this.client.function.functionControllerRemove(this.setupData.fn.id);
    },
  }),
  new IntegrationTest<ISetupData>({
    group,
    snapshot: true,
    name: 'Can search by moduleId',
    setup,
    test: async function () {
      if (!this.setupData.moduleFn.versionId) throw new Error('No versionId');
      const versionRes = await this.client.module.moduleVersionControllerGetModuleVersion(
        this.setupData.moduleFn.versionId,
      );

      const res = await this.client.function.functionControllerSearch({
        filters: {
          moduleId: [versionRes.data.data.moduleId],
        },
      });

      expect(res.data.data).to.have.length(1);

      const badFilterRes = await this.client.function.functionControllerSearch({
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

describe(group, () => {
  tests.forEach((test) => {
    test.run();
  });
});
