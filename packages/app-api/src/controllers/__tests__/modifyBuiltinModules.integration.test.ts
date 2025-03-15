import { IntegrationTest } from '@takaro/test';
import { Client, ModuleOutputDTO, ModuleVersionOutputDTO } from '@takaro/apiclient';
import { describe } from 'node:test';

const group = 'modifyBuiltinModules';

async function getBuiltinModule(client: Client, type?: keyof ModuleVersionOutputDTO) {
  let condition = (_: ModuleOutputDTO) => true;

  if (type) {
    condition = (m: ModuleOutputDTO) => (m?.latestVersion[type] ?? []).length > 0;
  }

  const builtinModule = (await client.module.moduleControllerSearch()).data.data.find((m) => m.builtin && condition(m));

  if (!builtinModule) {
    throw new Error('No builtin modules found');
  }

  return builtinModule;
}

const tests = [
  new IntegrationTest<ModuleOutputDTO>({
    group,
    snapshot: true,
    name: 'cannot delete command',
    setup: async function () {
      return getBuiltinModule(this.client, 'commands');
    },
    test: async function () {
      return this.client.command.commandControllerRemove(this.setupData.latestVersion.commands[0].id);
    },
    expectedStatus: 400,
  }),
  new IntegrationTest<ModuleOutputDTO>({
    group,
    snapshot: true,
    name: 'cannot update command',
    setup: async function () {
      return getBuiltinModule(this.client, 'commands');
    },
    test: async function () {
      return this.client.command.commandControllerUpdate(this.setupData.latestVersion.commands[0].id, {
        name: 'Updated command',
      });
    },
    expectedStatus: 400,
  }),
  new IntegrationTest<ModuleOutputDTO>({
    group,
    snapshot: true,
    name: 'cannot update command argument',
    setup: async function () {
      return getBuiltinModule(this.client, 'commands');
    },
    test: async function () {
      return this.client.command.commandControllerUpdateArgument(this.setupData.latestVersion.commands[0].id, {
        name: 'Updated argument',
      });
    },
    expectedStatus: 400,
  }),
  new IntegrationTest<ModuleOutputDTO>({
    group,
    snapshot: true,
    name: 'cannot delete command argument',
    setup: async function () {
      return getBuiltinModule(this.client, 'commands');
    },
    test: async function () {
      return this.client.command.commandControllerRemoveArgument(this.setupData.latestVersion.commands[0].id);
    },
    expectedStatus: 400,
  }),
  new IntegrationTest<ModuleOutputDTO>({
    group,
    snapshot: true,
    name: 'cannot update hook',
    setup: async function () {
      return getBuiltinModule(this.client, 'hooks');
    },
    test: async function () {
      return this.client.hook.hookControllerUpdate(this.setupData.latestVersion.hooks[0].id, {
        name: 'Updated hook',
      });
    },
    expectedStatus: 400,
  }),
  new IntegrationTest<ModuleOutputDTO>({
    group,
    snapshot: true,
    name: 'cannot delete hook',
    setup: async function () {
      return getBuiltinModule(this.client, 'hooks');
    },
    test: async function () {
      return this.client.hook.hookControllerRemove(this.setupData.latestVersion.hooks[0].id);
    },
    expectedStatus: 400,
  }),
  new IntegrationTest<ModuleOutputDTO>({
    group,
    snapshot: true,
    name: 'cannot update cronJob',
    setup: async function () {
      return getBuiltinModule(this.client, 'cronJobs');
    },
    test: async function () {
      return this.client.cronjob.cronJobControllerUpdate(this.setupData.latestVersion.cronJobs[0].id, {
        name: 'Updated cronJob',
      });
    },
    expectedStatus: 400,
  }),
  new IntegrationTest<ModuleOutputDTO>({
    group,
    snapshot: true,
    name: 'cannot delete cronJob',
    setup: async function () {
      return getBuiltinModule(this.client, 'cronJobs');
    },
    test: async function () {
      return this.client.cronjob.cronJobControllerRemove(this.setupData.latestVersion.cronJobs[0].id);
    },
    expectedStatus: 400,
  }),
  new IntegrationTest<ModuleOutputDTO>({
    group,
    snapshot: true,
    name: 'cannot delete function',
    setup: async function () {
      return getBuiltinModule(this.client, 'commands');
    },
    test: async function () {
      return this.client.function.functionControllerRemove(this.setupData.latestVersion.commands[0].functionId);
    },
    expectedStatus: 400,
  }),
  new IntegrationTest<ModuleOutputDTO>({
    group,
    snapshot: true,
    name: 'cannot update function',
    setup: async function () {
      return getBuiltinModule(this.client, 'commands');
    },
    test: async function () {
      return this.client.function.functionControllerUpdate(this.setupData.latestVersion.commands[0].functionId, {
        code: 'updated code',
      });
    },
    expectedStatus: 400,
  }),
  new IntegrationTest<ModuleOutputDTO>({
    group,
    snapshot: true,
    name: 'cannot delete module',
    setup: async function () {
      return getBuiltinModule(this.client);
    },
    test: async function () {
      return this.client.module.moduleControllerRemove(this.setupData.id);
    },
    expectedStatus: 400,
  }),
  new IntegrationTest<ModuleOutputDTO>({
    group,
    snapshot: true,
    name: 'cannot update module',
    setup: async function () {
      return getBuiltinModule(this.client);
    },
    test: async function () {
      return this.client.module.moduleControllerUpdate(this.setupData.id, {
        name: 'updated module',
      });
    },
    expectedStatus: 400,
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
