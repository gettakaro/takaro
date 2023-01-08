import { IntegrationTest } from '@takaro/test';
import { CronJobOutputDTOAPI } from '@takaro/apiclient';

const group = 'CronJobController';

const mockCronjob = (moduleId: string) => ({
  name: 'Test cronJob',
  temporalValue: '0 * * * *',
  function: 'console.log("test")',
  moduleId,
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
      return (
        await this.client.cronjob.cronJobControllerCreate(
          mockCronjob(module.id)
        )
      ).data;
    },
    test: async function () {
      return this.client.cronjob.cronJobControllerGetOne(
        this.setupData.data.id
      );
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
      return this.client.cronjob.cronJobControllerCreate(
        mockCronjob(module.id)
      );
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
      return (
        await this.client.cronjob.cronJobControllerCreate(
          mockCronjob(module.id)
        )
      ).data;
    },
    test: async function () {
      return this.client.cronjob.cronJobControllerUpdate(
        this.setupData.data.id,
        {
          name: 'Updated cronJob',
          temporalValue: '0 * * * *',
          enabled: false,
        }
      );
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
      return (
        await this.client.cronjob.cronJobControllerCreate(
          mockCronjob(module.id)
        )
      ).data;
    },
    test: async function () {
      return this.client.cronjob.cronJobControllerRemove(
        this.setupData.data.id
      );
    },
  }),
  new IntegrationTest<CronJobOutputDTOAPI>({
    snapshot: true,
    group,
    name: 'Search',
    setup: async function () {
      const module = (
        await this.client.module.moduleControllerCreate({
          name: 'Test module',
        })
      ).data.data;
      return (
        await this.client.cronjob.cronJobControllerCreate(
          mockCronjob(module.id)
        )
      ).data;
    },
    test: async function () {
      return this.client.cronjob.cronJobControllerSearch({
        filters: { name: mockCronjob(module.id).name },
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
