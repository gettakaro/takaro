import { expect, IntegrationTest } from '@takaro/test';
import { ModuleOutputDTO } from '@takaro/apiclient';

const group = 'Builtin Modules';

const tests = [
  new IntegrationTest<ModuleOutputDTO[]>({
    group,
    snapshot: true,
    name: 'Get builtins',
    test: async function () {
      return this.client.module.moduleControllerGetBuiltins();
    },
  }),
  new IntegrationTest<ModuleOutputDTO>({
    group,
    snapshot: true,
    filteredFields: ['moduleId', 'functionId'],
    name: 'Enable a built-in module',
    test: async function () {
      const setRes = await this.client.module.moduleControllerSetBuiltin(
        'ping',
        {
          enabled: true,
          config: {},
        }
      );

      const module = await this.client.module.moduleControllerGetOne(
        setRes.data.data.id
      );

      expect(module.data.data.name).to.equal('ping');
      expect(module.data.data.enabled).to.equal(true);

      expect(module.data.data.commands).to.have.lengthOf(1);
      expect(module.data.data.commands[0].name).to.equal('ping');

      return module;
    },
  }),
  new IntegrationTest<ModuleOutputDTO>({
    group,
    snapshot: true,
    filteredFields: ['moduleId', 'functionId'],
    name: 'Enabling a built-in module with the same name as an existing module should create a new module with a modified name',
    test: async function () {
      await this.client.module.moduleControllerCreate({
        name: 'ping',
        enabled: true,
      });

      const setRes = await this.client.module.moduleControllerSetBuiltin(
        'ping',
        {
          enabled: true,
          config: {},
        }
      );

      const res = await this.client.module.moduleControllerGetOne(
        setRes.data.data.id
      );

      expect(res.data.data.name).to.equal('ping (builtin)');

      return res;
    },
  }),
  new IntegrationTest<ModuleOutputDTO>({
    group,
    snapshot: true,
    filteredFields: ['moduleId', 'functionId'],
    name: 'Allows updating the config of an already enabled module',
    test: async function () {
      const setRes = await this.client.module.moduleControllerSetBuiltin(
        'ping',
        {
          enabled: true,
          config: { foo: 'bar' },
        }
      );

      await this.client.module.moduleControllerSetBuiltin('ping', {
        config: { foo: 'baz' },
        enabled: true,
      });

      const res = await this.client.module.moduleControllerGetOne(
        setRes.data.data.id
      );
      expect(res.data.data.config).to.deep.equal({ foo: 'baz' });

      return res;
    },
  }),
  new IntegrationTest<ModuleOutputDTO>({
    group,
    snapshot: true,
    filteredFields: ['moduleId'],
    name: 'Does not allow updating code of a builtin module',
    expectedStatus: 400,
    test: async function () {
      const setRes = await this.client.module.moduleControllerSetBuiltin(
        'ping',
        {
          enabled: true,
        }
      );

      const module = (
        await this.client.module.moduleControllerGetOne(setRes.data.data.id)
      ).data.data;

      return this.client.function.functionControllerUpdate(
        module.commands[0].function.id,
        {
          code: 'foo',
        }
      );
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
