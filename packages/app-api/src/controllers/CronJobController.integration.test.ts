import { IntegrationTest } from '@takaro/test';
import { CronJobOutputDTO } from '../service/CronJobService';
import { FunctionOutputDTO } from '../service/FunctionService';

const group = 'CronJobController';

const mockCronjob = {
  name: 'Test cronJob',
  temporalValue: '0 * * * *',
};

interface ISetupCronJobAndFunction {
  cronjob: CronJobOutputDTO;
  fn: FunctionOutputDTO;
}

const tests: IntegrationTest<any>[] = [
  new IntegrationTest<CronJobOutputDTO>({
    group,
    name: 'Get by ID',
    setup: async function () {
      return (await this.client.cronjob.cronJobControllerCreate(mockCronjob))
        .data.data;
    },
    test: async function () {
      return this.client.cronjob.cronJobControllerGetOne(this.setupData.id);
    },
  }),
  new IntegrationTest<void>({
    group,
    name: 'Create',
    test: async function () {
      return this.client.cronjob.cronJobControllerCreate(mockCronjob);
    },
  }),
  new IntegrationTest<CronJobOutputDTO>({
    group,
    name: 'Update',
    setup: async function () {
      return (await this.client.cronjob.cronJobControllerCreate(mockCronjob))
        .data.data;
    },
    test: async function () {
      return this.client.cronjob.cronJobControllerUpdate(this.setupData.id, {
        name: 'Updated cronJob',
        temporalValue: '0 * * * *',
        enabled: false,
      });
    },
  }),
  new IntegrationTest<CronJobOutputDTO>({
    group,
    name: 'Delete',
    setup: async function () {
      return (await this.client.cronjob.cronJobControllerCreate(mockCronjob))
        .data.data;
    },
    test: async function () {
      return this.client.cronjob.cronJobControllerRemove(this.setupData.id);
    },
  }),
  new IntegrationTest<CronJobOutputDTO>({
    group,
    name: 'Search',
    setup: async function () {
      return (await this.client.cronjob.cronJobControllerCreate(mockCronjob))
        .data.data;
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
      ).data.data;

      const fn = (
        await this.client.function.functionControllerCreate({
          code: 'console.log("Hello world")',
        })
      ).data.data;

      return {
        cronjob,
        fn,
      };
    },
    test: async function () {
      return this.client.function.functionControllerAssign({
        functionId: this.setupData.fn.id,
        itemId: this.setupData.cronjob.id,
        type: 'cronjob',
      });
    },
  }),
  new IntegrationTest<ISetupCronJobAndFunction>({
    group,
    name: 'Errors when assigning to invalid type',
    setup: async function () {
      const cronjob = (
        await this.client.cronjob.cronJobControllerCreate(mockCronjob)
      ).data.data;

      const fn = (
        await this.client.function.functionControllerCreate({
          code: 'console.log("Hello world")',
        })
      ).data.data;

      return {
        cronjob,
        fn,
      };
    },
    test: async function () {
      // @ts-expect-error The client detects that this is faulty, but I want to see a validation error!
      return this.client.function.functionControllerAssign({
        functionId: this.setupData.fn.id,
        itemId: this.setupData.cronjob.id,
        type: 'not-existing',
      });
    },
    expectedStatus: 400,
    filteredFields: ['functionId', 'itemId'],
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
