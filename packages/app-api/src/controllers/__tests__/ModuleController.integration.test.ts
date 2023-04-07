import { IntegrationTest } from '@takaro/test';
import { ModuleOutputDTO } from '@takaro/apiclient';

const group = 'ModuleController';

const tests = [
  new IntegrationTest<ModuleOutputDTO>({
    group,
    snapshot: true,
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
    snapshot: true,
    name: 'Create',
    test: async function () {
      return this.client.module.moduleControllerCreate({
        name: 'Test module',
      });
    },
  }),
  new IntegrationTest<ModuleOutputDTO>({
    group,
    snapshot: true,
    name: 'Update',
    setup: async function () {
      return (
        await this.client.module.moduleControllerCreate({
          name: 'Test module',
          description: 'bla bla',
        })
      ).data.data;
    },
    test: async function () {
      return this.client.module.moduleControllerUpdate(this.setupData.id, {
        name: 'Updated module',
        description: 'Updated description',
      });
    },
  }),
  new IntegrationTest<ModuleOutputDTO>({
    group,
    snapshot: true,
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
