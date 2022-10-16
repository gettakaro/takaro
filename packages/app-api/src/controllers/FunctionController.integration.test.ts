import { IntegrationTest } from '@takaro/test';
import { CronJobOutputDTO, FunctionOutputDTO } from '@takaro/apiclient';

const group = 'FunctionController';

const mockFunction = {
  code: 'console.log("Hello world")',
};

interface ISetupCronJobAndFunction {
  cronjobs: CronJobOutputDTO[];
  fns: FunctionOutputDTO[];
}

const tests = [
  new IntegrationTest<FunctionOutputDTO>({
    group,
    snapshot: true,
    name: 'Get by ID',
    setup: async function () {
      return (await this.client.function.functionControllerCreate(mockFunction))
        .data.data;
    },
    test: async function () {
      return this.client.function.functionControllerGetOne(this.setupData.id);
    },
  }),
  new IntegrationTest<void>({
    group,
    snapshot: true,
    name: 'Create',
    test: async function () {
      return this.client.function.functionControllerCreate(mockFunction);
    },
  }),
  new IntegrationTest<FunctionOutputDTO>({
    group,
    snapshot: true,
    name: 'Update',
    setup: async function () {
      return (await this.client.function.functionControllerCreate(mockFunction))
        .data.data;
    },
    test: async function () {
      return this.client.function.functionControllerUpdate(this.setupData.id, {
        code: 'console.log("Bye world")',
      });
    },
  }),
  new IntegrationTest<FunctionOutputDTO>({
    group,
    snapshot: true,
    name: 'Delete',
    setup: async function () {
      return (await this.client.function.functionControllerCreate(mockFunction))
        .data.data;
    },
    test: async function () {
      return this.client.function.functionControllerRemove(this.setupData.id);
    },
  }),
  new IntegrationTest<ISetupCronJobAndFunction>({
    group,
    snapshot: true,
    name: 'Get related',
    setup: async function () {
      const module = (
        await this.client.module.moduleControllerCreate({
          name: 'Test module',
        })
      ).data.data;

      const cronjobs = [];
      const fns = [];
      for (let i = 0; i < 3; i++) {
        const cronjob = (
          await this.client.cronjob.cronJobControllerCreate({
            name: `Test cronJob ${i}`,
            temporalValue: '0 * * * *',
            moduleId: module.id,
          })
        ).data.data;
        cronjobs.push(cronjob);
        const fn = (
          await this.client.function.functionControllerCreate({
            code: `console.log("Hello world ${i}")`,
          })
        ).data.data;
        fns.push(fn);
      }

      await this.client.cronjob.cronJobControllerAssignFunction(
        cronjobs[0].id,
        fns[0].id
      );
      await this.client.cronjob.cronJobControllerAssignFunction(
        cronjobs[0].id,
        fns[1].id
      );

      return { cronjobs, fns };
    },
    test: async function () {
      const { cronjobs } = this.setupData;
      return this.client.function.functionControllerGetRelated(cronjobs[0].id);
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
