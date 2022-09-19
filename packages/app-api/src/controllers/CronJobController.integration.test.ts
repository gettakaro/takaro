import { IntegrationTest } from '@takaro/test';
import { CronJobOutputDTOAPI, FunctionOutputDTOAPI } from '@takaro/apiclient';

const group = 'CronJobController';

const mockCronjob = {
  name: 'Test cronJob',
  temporalValue: '0 * * * *',
};

interface ISetupCronJobAndFunction {
  cronjob: CronJobOutputDTOAPI;
  fn: FunctionOutputDTOAPI;
}

const tests: IntegrationTest<any>[] = [
  new IntegrationTest<CronJobOutputDTOAPI>({
    group,
    name: 'Get by ID',
    setup: async function () {
      return (await this.client.cronjob.cronJobControllerCreate(mockCronjob))
        .data;
    },
    test: async function () {
      return this.client.cronjob.cronJobControllerGetOne(
        this.setupData.data.id
      );
    },
  }),
  new IntegrationTest<void>({
    group,
    name: 'Create',
    test: async function () {
      return this.client.cronjob.cronJobControllerCreate(mockCronjob);
    },
  }),
  new IntegrationTest<CronJobOutputDTOAPI>({
    group,
    name: 'Update',
    setup: async function () {
      return (await this.client.cronjob.cronJobControllerCreate(mockCronjob))
        .data;
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
  }),
  new IntegrationTest<CronJobOutputDTOAPI>({
    group,
    name: 'Delete',
    setup: async function () {
      return (await this.client.cronjob.cronJobControllerCreate(mockCronjob))
        .data;
    },
    test: async function () {
      return this.client.cronjob.cronJobControllerRemove(
        this.setupData.data.id
      );
    },
  }),
  new IntegrationTest<CronJobOutputDTOAPI>({
    group,
    name: 'Search',
    setup: async function () {
      return (await this.client.cronjob.cronJobControllerCreate(mockCronjob))
        .data;
    },
    test: async function () {
      return this.client.cronjob.cronJobControllerSearch({
        filters: { name: mockCronjob.name },
      });
    },
  }),
  new IntegrationTest<ISetupCronJobAndFunction>({
    group,
    name: 'Can assign a function to a cronjob',
    setup: async function () {
      const cronjob = (
        await this.client.cronjob.cronJobControllerCreate(mockCronjob)
      ).data;

      const fn = (
        await this.client.function.functionControllerCreate({
          code: 'console.log("Hello world")',
        })
      ).data;

      return {
        cronjob,
        fn,
      };
    },
    test: async function () {
      return this.client.cronjob.cronJobControllerAssignFunction(
        this.setupData.cronjob.data.id,
        this.setupData.fn.data.id
      );
    },
  }),
  new IntegrationTest<ISetupCronJobAndFunction>({
    group,
    name: 'Can unassign a function from a cronjob',
    setup: async function () {
      const cronjob = (
        await this.client.cronjob.cronJobControllerCreate(mockCronjob)
      ).data;

      const fn = (
        await this.client.function.functionControllerCreate({
          code: 'console.log("Hello world")',
        })
      ).data;

      await this.client.cronjob.cronJobControllerAssignFunction(
        cronjob.data.id,
        fn.data.id
      );

      return {
        cronjob,
        fn,
      };
    },
    test: async function () {
      return this.client.cronjob.cronJobControllerUnassignFunction(
        this.setupData.cronjob.data.id,
        this.setupData.fn.data.id
      );
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
