import { IntegrationTest } from '@takaro/test';
import { FunctionOutputDTO } from '@takaro/apiclient';
import { describe } from 'node:test';

const group = 'FunctionController';

const mockFunction = {
  code: 'console.log("Hello world")',
};

const tests = [
  new IntegrationTest<FunctionOutputDTO>({
    group,
    snapshot: true,
    name: 'Get by ID',
    setup: async function () {
      return (await this.client.function.functionControllerCreate(mockFunction)).data.data;
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
      return (await this.client.function.functionControllerCreate(mockFunction)).data.data;
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
      return (await this.client.function.functionControllerCreate(mockFunction)).data.data;
    },
    test: async function () {
      return this.client.function.functionControllerRemove(this.setupData.id);
    },
  }),
];

describe(group, () => {
  tests.forEach((test) => {
    test.run();
  });
});
