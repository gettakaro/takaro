import { IntegrationTest, expect, integrationConfig } from '@takaro/test';
import { ModuleOutputDTO, GameServerOutputDTO, HookCreateDTOEventTypeEnum } from '@takaro/apiclient';

const group = 'Module Assignments';

const mockHook = (moduleId: string) => ({
  name: 'Test hook',
  regex: '/this (is) a [regex]/g',
  eventType: HookCreateDTOEventTypeEnum.Log,
  moduleId,
});

interface ISetupData {
  modules: ModuleOutputDTO[];
  gameserver: GameServerOutputDTO;
  utilsModule: ModuleOutputDTO;
  teleportsModule: ModuleOutputDTO;
}

const defaultSetup = async function (this: IntegrationTest<ISetupData>): Promise<ISetupData> {
  const modules = (await this.client.module.moduleControllerSearch()).data.data;

  const gameserver = await this.client.gameserver.gameServerControllerCreate({
    connectionInfo: JSON.stringify({
      host: integrationConfig.get('mockGameserver.host'),
    }),
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
    filteredFields: ['gameserverId', 'moduleId', 'functionId', 'commandId'],
    test: async function () {
      return this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.utilsModule.id,
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
      );

      return this.client.gameserver.gameServerControllerUninstallModule(
        this.setupData.gameserver.id,
        this.setupData.utilsModule.id,
      );
    },
  }),
  new IntegrationTest<ISetupData>({
    group,
    snapshot: false,
    name: 'Update installation config',
    setup: defaultSetup,
    filteredFields: ['gameserverId', 'moduleId', 'functionId', 'commandId'],
    test: async function () {
      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.teleportsModule.id,
      );

      await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.teleportsModule.id,
        {
          userConfig: JSON.stringify({ timeout: 1337 }),
        },
      );

      const res = await this.client.gameserver.gameServerControllerGetModuleInstallation(
        this.setupData.gameserver.id,
        this.setupData.teleportsModule.id,
      );

      expect(res.data.data.userConfig).to.deep.equal({
        allowPublicTeleports: false,
        timeout: 1337,
      });
    },
  }),
  new IntegrationTest<ISetupData>({
    group,
    snapshot: true,
    setup: defaultSetup,
    name: 'discordChannelId is required when hook event-type is discord-message, throws validation error',
    test: async function () {
      const mod = (
        await this.client.module.moduleControllerCreate({
          name: 'Test module',
        })
      ).data.data;

      await this.client.hook.hookControllerCreate({
        ...mockHook(mod.id),
        eventType: HookCreateDTOEventTypeEnum.DiscordMessage,
      });

      return this.client.gameserver.gameServerControllerInstallModule(this.setupData.gameserver.id, mod.id, {
        userConfig: JSON.stringify({}),
      });
    },
    expectedStatus: 400,
    filteredFields: ['moduleId', 'functionId', 'commandId', 'gameserverId'],
  }),
  new IntegrationTest<ISetupData>({
    group,
    snapshot: true,
    setup: defaultSetup,
    name: 'discordChannelId is required when hook event-type is discord-message, happy path',
    test: async function () {
      const mod = (
        await this.client.module.moduleControllerCreate({
          name: 'Test module',
        })
      ).data.data;

      const createdHookRes = await this.client.hook.hookControllerCreate({
        ...mockHook(mod.id),
        eventType: HookCreateDTOEventTypeEnum.DiscordMessage,
      });

      const hookName = createdHookRes.data.data.name;

      return this.client.gameserver.gameServerControllerInstallModule(this.setupData.gameserver.id, mod.id, {
        userConfig: JSON.stringify({}),
        systemConfig: JSON.stringify({
          hooks: {
            [hookName]: { discordChannelId: '123' },
          },
        }),
      });
    },
    filteredFields: ['moduleId', 'gameserverId', 'functionId'],
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
