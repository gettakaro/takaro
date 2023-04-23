import { IntegrationTest, expect } from '@takaro/test';
import { ModuleOutputDTO, GameServerOutputDTO } from '@takaro/apiclient';

const group = 'Module Assignments';

interface ISetupData {
  modules: ModuleOutputDTO[];
  gameserver: GameServerOutputDTO;
  utilsModule: ModuleOutputDTO;
  teleportsModule: ModuleOutputDTO;
}

const defaultSetup = async function (
  this: IntegrationTest<ISetupData>
): Promise<ISetupData> {
  const modules = (await this.client.module.moduleControllerSearch()).data.data;

  const gameserver = await this.client.gameserver.gameServerControllerCreate({
    connectionInfo: '{}',
    type: 'MOCK',
    name: 'Test gameserver',
  });

  const teleportsModule = modules.find((m) => m.name === 'teleports');

  if (!teleportsModule) throw new Error('teleports module not found');

  const utilsModule = modules.find((m) => m.name === 'utils');

  if (!utilsModule) throw new Error('utils module not found');

  return {
    modules: modules,
    utilsModule,
    teleportsModule,
    gameserver: gameserver.data.data,
  };
};

const tests = [
  new IntegrationTest<ISetupData>({
    group,
    snapshot: true,
    name: 'Install a built-in module',
    setup: defaultSetup,
    filteredFields: ['gameserverId', 'moduleId'],
    test: async function () {
      return this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.utilsModule.id,
        {
          userConfig: '{}',
          systemConfig: '{}',
        }
      );
    },
  }),
  new IntegrationTest<ISetupData>({
    group,
    snapshot: true,
    name: 'Uninstall a module',
    setup: defaultSetup,
    filteredFields: ['gameserverId', 'moduleId'],
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.utilsModule.id,
        {
          userConfig: '{}',
          systemConfig: '{}',
        }
      );

      return this.client.gameserver.gameServerControllerUninstallModule(
        this.setupData.gameserver.id,
        this.setupData.utilsModule.id
      );
    },
  }),
  new IntegrationTest<ISetupData>({
    group,
    snapshot: true,
    name: 'Update installation config',
    setup: defaultSetup,
    filteredFields: ['gameserverId', 'moduleId'],
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.teleportsModule.id,
        {
          userConfig: '{}',
          systemConfig: '{}',
        }
      );

      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.teleportsModule.id,
        {
          userConfig: JSON.stringify({ maxTeleports: 42 }),
          systemConfig: '{}',
        }
      );

      const res =
        await this.client.gameserver.gameServerControllerGetModuleInstallation(
          this.setupData.gameserver.id,
          this.setupData.teleportsModule.id
        );

      expect(res.data.data.userConfig).to.deep.equal({ maxTeleports: 42 });

      return res;
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
