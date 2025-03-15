import { IntegrationTest, expect } from '@takaro/test';
import { CronJobOutputDTO, ModuleOutputDTO } from '@takaro/apiclient';
import { describe } from 'node:test';
import { randomUUID } from 'crypto';

const group = 'CronJobController';

const mockCronjob = (versionId: string) => ({
  name: 'Test cronJob',
  description: 'Cool description',
  temporalValue: '0 * * * *',
  function: 'console.log("test")',
  versionId,
});

interface ISetupData {
  module: ModuleOutputDTO;
  cronJob: CronJobOutputDTO;
}

async function setup(this: IntegrationTest<any>): Promise<ISetupData> {
  const module = (
    await this.client.module.moduleControllerCreate({
      name: 'Test module',
    })
  ).data.data;
  const cronJob = (await this.client.cronjob.cronJobControllerCreate(mockCronjob(module.latestVersion.id))).data.data;
  return {
    module,
    cronJob,
  };
}

const tests = [
  new IntegrationTest<ISetupData>({
    snapshot: true,
    group,
    name: 'Get by ID',
    setup,
    test: async function () {
      return this.client.cronjob.cronJobControllerGetOne(this.setupData.cronJob.id);
    },
    filteredFields: ['moduleId', 'functionId'],
  }),
  new IntegrationTest<void>({
    snapshot: true,
    group,
    name: 'Create',
    test: async function () {
      const module = (
        await this.client.module.moduleControllerCreate({
          name: 'Test module',
        })
      ).data.data;
      return this.client.cronjob.cronJobControllerCreate(mockCronjob(module.latestVersion.id));
    },
    filteredFields: ['moduleId', 'functionId'],
  }),
  new IntegrationTest<ISetupData>({
    snapshot: true,
    group,
    name: 'Update',
    setup,
    test: async function () {
      return this.client.cronjob.cronJobControllerUpdate(this.setupData.cronJob.id, {
        name: 'Updated cronJob',
        description: 'Updated description',
        temporalValue: '0 * * * *',
      });
    },
    filteredFields: ['moduleId', 'functionId'],
  }),
  new IntegrationTest<ISetupData>({
    snapshot: true,
    group,
    name: 'Delete',
    setup,
    test: async function () {
      return this.client.cronjob.cronJobControllerRemove(this.setupData.cronJob.id);
    },
  }),
  new IntegrationTest<ISetupData>({
    snapshot: true,
    group,
    name: 'Search',
    setup,
    test: async function () {
      return this.client.cronjob.cronJobControllerSearch({
        filters: { name: [mockCronjob(this.setupData.cronJob.versionId).name] },
      });
    },
    filteredFields: ['moduleId', 'functionId'],
  }),
  new IntegrationTest<ISetupData>({
    group,
    snapshot: true,
    name: 'Can search by moduleId',
    setup,
    test: async function () {
      const versionRes = await this.client.module.moduleVersionControllerGetModuleVersion(
        this.setupData.cronJob.versionId,
      );

      const res = await this.client.cronjob.cronJobControllerSearch({
        filters: {
          moduleId: [versionRes.data.data.moduleId],
        },
      });

      expect(res.data.data).to.have.length(1);

      const badFilterRes = await this.client.cronjob.cronJobControllerSearch({
        filters: {
          moduleId: [randomUUID()],
        },
      });

      expect(badFilterRes.data.data).to.have.length(0);

      return res;
    },
    filteredFields: ['moduleId', 'functionId', 'cronJobId'],
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
