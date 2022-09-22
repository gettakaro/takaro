import { IntegrationTest } from '@takaro/test';
import { ModuleOutputDTO } from '@takaro/apiclient';

const group = 'ModuleController';

const tests: IntegrationTest<any>[] = [
  new IntegrationTest<ModuleOutputDTO>({
    group,
    name: 'Get by ID',
    setup: async function () {
      return (
        await this.client.module.moduleControllerCreate({
          name: 'Test module',
        })
      ).data.data;
    },
    test: async function () {
      return this.client.module.moduleControllerGetOne(this.setupData.id);
    },
  }),
  new IntegrationTest<void>({
    group,
    name: 'Create',
    test: async function () {
      return this.client.module.moduleControllerCreate({
        name: 'Test module',
      });
    },
  }),
  new IntegrationTest<ModuleOutputDTO>({
    group,
    name: 'Update',
    setup: async function () {
      return (
        await this.client.module.moduleControllerCreate({
          name: 'Test module',
        })
      ).data.data;
    },
    test: async function () {
      return this.client.module.moduleControllerUpdate(this.setupData.id, {
        name: 'Updated module',
        enabled: false,
      });
    },
  }),
  new IntegrationTest<ModuleOutputDTO>({
    group,
    name: 'Delete',
    setup: async function () {
      return (
        await this.client.module.moduleControllerCreate({
          name: 'Test module',
        })
      ).data.data;
    },
    test: async function () {
      return this.client.module.moduleControllerRemove(this.setupData.id);
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
