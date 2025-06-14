import { IntegrationTest, expect } from '@takaro/test';
import { ModuleOutputDTO, GameServerOutputDTO, HookCreateDTOEventTypeEnum } from '@takaro/apiclient';
import { describe } from 'node:test';
import { randomUUID } from 'node:crypto';
import { getMockServer } from '@takaro/mock-gameserver';

const group = 'Module Assignments';

const mockHook = (versionId: string) => ({
  name: 'Test hook',
  regex: '/this (is) a [regex]/g',
  eventType: HookCreateDTOEventTypeEnum.Log,
  versionId,
});

interface ISetupData {
  modules: ModuleOutputDTO[];
  gameserver: GameServerOutputDTO;
  utilsModule: ModuleOutputDTO;
  teleportsModule: ModuleOutputDTO;
  mockservers: Awaited<ReturnType<typeof getMockServer>>[];
}

const defaultSetup = async function (this: IntegrationTest<ISetupData>): Promise<ISetupData> {
  const modules = (await this.client.module.moduleControllerSearch()).data.data;

  if (!this.domainRegistrationToken) throw new Error('Domain registration token is not set. Invalid setup?');
  const identityToken = randomUUID();
  const mockServer = await getMockServer({
    mockserver: {
      registrationToken: this.domainRegistrationToken,
      identityToken,
    },
  });

  const gameServerRes = (
    await this.client.gameserver.gameServerControllerSearch({
      filters: { identityToken: [identityToken] },
    })
  ).data.data;
  const gameserver = gameServerRes.find((gs) => gs.identityToken === identityToken);
  if (!gameserver) throw new Error('Game server not found. Did something fail when registering?');

  const teleportsModule = modules.find((m) => m.name === 'teleports');

  if (!teleportsModule) throw new Error('teleports module not found');

  const utilsModule = modules.find((m) => m.name === 'utils');

  if (!utilsModule) throw new Error('utils module not found');

  return {
    modules: modules,
    utilsModule,
    teleportsModule,
    gameserver: gameserver,
    mockservers: [mockServer],
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
      return this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.utilsModule.latestVersion.id,
      });
    },
  }),
  new IntegrationTest<ISetupData>({
    group,
    snapshot: true,
    name: 'Uninstall a module',
    setup: defaultSetup,
    filteredFields: ['gameserverId', 'moduleId', 'functionId'],
    test: async function () {
      const installation = (
        await this.client.module.moduleInstallationsControllerInstallModule({
          gameServerId: this.setupData.gameserver.id,
          versionId: this.setupData.utilsModule.latestVersion.id,
        })
      ).data.data;

      return this.client.module.moduleInstallationsControllerUninstallModule(
        installation.moduleId,
        installation.gameserverId,
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
      await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.teleportsModule.latestVersion.id,
      });

      const installation = (
        await this.client.module.moduleInstallationsControllerInstallModule({
          gameServerId: this.setupData.gameserver.id,
          versionId: this.setupData.teleportsModule.latestVersion.id,
          userConfig: JSON.stringify({ timeout: 1337 }),
        })
      ).data.data;

      const res = await this.client.module.moduleInstallationsControllerGetModuleInstallation(
        installation.moduleId,
        installation.gameserverId,
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
        ...mockHook(mod.latestVersion.id),
        eventType: HookCreateDTOEventTypeEnum.DiscordMessage,
      });

      return this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: mod.latestVersion.id,
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
        ...mockHook(mod.latestVersion.id),
        eventType: HookCreateDTOEventTypeEnum.DiscordMessage,
      });

      const hookName = createdHookRes.data.data.name;

      return this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: mod.latestVersion.id,
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
