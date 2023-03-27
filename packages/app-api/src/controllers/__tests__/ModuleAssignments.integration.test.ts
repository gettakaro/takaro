import { IntegrationTest, expect } from '@takaro/test';
import { ModuleOutputDTO, GameServerOutputDTO } from '@takaro/apiclient';

const group = 'Module Assignments';

const defaultSetup = async function () {
  const modules = await this.client.module.moduleControllerSearch();

  const gameserver = await this.client.gameserver.gameServerControllerCreate({
    connectionInfo: '{}',
    type: 'MOCK',
    name: 'Test gameserver',
  });

  return {
    modules: modules.data.data,
    gameserver: gameserver.data.data,
  };
};

const tests = [
  new IntegrationTest<{
    modules: ModuleOutputDTO[];
    gameserver: GameServerOutputDTO;
  }>({
    group,
    snapshot: true,
    name: 'Install a built-in module',
    setup: defaultSetup,
    test: async function () {
      return this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.modules[0].id,
        {
          config: '{}',
        }
      );
    },
  }),
  new IntegrationTest<{
    modules: ModuleOutputDTO[];
    gameserver: GameServerOutputDTO;
  }>({
    group,
    snapshot: true,
    name: 'Uninstall a module',
    setup: defaultSetup,
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.modules[0].id,
        {
          config: '{}',
        }
      );

      return this.client.gameserver.gameServerControllerUninstallModule(
        this.setupData.gameserver.id,
        this.setupData.modules[0].id
      );
    },
  }),
  new IntegrationTest<{
    modules: ModuleOutputDTO[];
    gameserver: GameServerOutputDTO;
  }>({
    group,
    snapshot: true,
    name: 'Update installation config',
    setup: defaultSetup,
    filteredFields: ['gameserverId', 'moduleId'],
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.modules[0].id,
        {
          config: '{}',
        }
      );

      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.modules[0].id,
        {
          config: JSON.stringify({ foo: 'bar' }),
        }
      );

      const res =
        await this.client.gameserver.gameServerControllerGetModuleInstallation(
          this.setupData.gameserver.id,
          this.setupData.modules[0].id
        );

      expect(res.data.data.config).to.deep.equal({ foo: 'bar' });

      return res;
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
