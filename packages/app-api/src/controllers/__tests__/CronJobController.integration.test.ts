import { IntegrationTest } from '@takaro/test';
import { CronJobOutputDTOAPI } from '@takaro/apiclient';
import { describe } from 'node:test';

const group = 'CronJobController';

const mockCronjob = (versionId: string) => ({
  name: 'Test cronJob',
  description: 'Cool description',
  temporalValue: '0 * * * *',
  function: 'console.log("test")',
  versionId,
});

const tests = [
  new IntegrationTest<CronJobOutputDTOAPI>({
    snapshot: true,
    group,
    name: 'Get by ID',
    setup: async function () {
      const module = (
        await this.client.module.moduleControllerCreate({
          name: 'Test module',
        })
      ).data.data;
      return (await this.client.cronjob.cronJobControllerCreate(mockCronjob(module.latestVersion.id))).data;
    },
    test: async function () {
      return this.client.cronjob.cronJobControllerGetOne(this.setupData.data.id);
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
  new IntegrationTest<CronJobOutputDTOAPI>({
    snapshot: true,
    group,
    name: 'Update',
    setup: async function () {
      const module = (
        await this.client.module.moduleControllerCreate({
          name: 'Test module',
        })
      ).data.data;
      return (await this.client.cronjob.cronJobControllerCreate(mockCronjob(module.latestVersion.id))).data;
    },
    test: async function () {
      return this.client.cronjob.cronJobControllerUpdate(this.setupData.data.id, {
        name: 'Updated cronJob',
        description: 'Updated description',
        temporalValue: '0 * * * *',
      });
    },
    filteredFields: ['moduleId', 'functionId'],
  }),
  new IntegrationTest<CronJobOutputDTOAPI>({
    snapshot: true,
    group,
    name: 'Delete',
    setup: async function () {
      const module = (
        await this.client.module.moduleControllerCreate({
          name: 'Test module',
        })
      ).data.data;
      return (await this.client.cronjob.cronJobControllerCreate(mockCronjob(module.latestVersion.id))).data;
    },
    test: async function () {
      return this.client.cronjob.cronJobControllerRemove(this.setupData.data.id);
    },
  }),
  new IntegrationTest<CronJobOutputDTOAPI>({
    snapshot: true,
    group,
    name: 'Search',
    setup: async function () {
      const mod = (
        await this.client.module.moduleControllerCreate({
          name: 'Test module',
        })
      ).data.data;
      return (await this.client.cronjob.cronJobControllerCreate(mockCronjob(mod.latestVersion.id))).data;
    },
    test: async function () {
      return this.client.cronjob.cronJobControllerSearch({
        filters: { name: [mockCronjob(this.setupData.data.versionId).name] },
      });
    },
    filteredFields: ['moduleId', 'functionId'],
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
