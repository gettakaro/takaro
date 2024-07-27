import { IntegrationTest, expect, integrationConfig } from '@takaro/test';
import {
  GameServerOutputDTO,
  GameServerCreateDTOTypeEnum,
  SettingsOutputDTOKeyEnum,
  SettingsOutputDTOTypeEnum,
} from '@takaro/apiclient';
const group = 'SettingsController';

const mockGameServer = {
  name: 'Test gameserver',
  connectionInfo: JSON.stringify({
    host: integrationConfig.get('mockGameserver.host'),
  }),
  type: GameServerCreateDTOTypeEnum.Mock,
};

const tests = [
  new IntegrationTest<void>({
    group,
    snapshot: true,
    name: 'Get a value',
    test: async function () {
      const res = await this.client.settings.settingsControllerGetOne(SettingsOutputDTOKeyEnum.CommandPrefix);
      expect(res.data.data.value).to.be.eq('/');
      return res;
    },
  }),
  new IntegrationTest<void>({
    group,
    snapshot: true,
    name: 'Set a value',
    test: async function () {
      await this.client.settings.settingsControllerSet(SettingsOutputDTOKeyEnum.CommandPrefix, {
        value: '!',
      });
      const res = await this.client.settings.settingsControllerGetOne(SettingsOutputDTOKeyEnum.CommandPrefix);
      expect(res.data.data.value).to.be.eq('!');
      return res;
    },
  }),
  new IntegrationTest<void>({
    group,
    snapshot: true,
    name: 'Get a value with invalid key',
    test: async function () {
      const res = await this.client.settings.settingsControllerGetOne('invalidKey');
      expect(res.data.data).to.be.eq(undefined);
      return res;
    },
    expectedStatus: 400,
  }),
  new IntegrationTest<void>({
    group,
    snapshot: true,
    name: 'Set a value with invalid key',
    test: async function () {
      const res = await this.client.settings.settingsControllerSet('invalidKey', {
        value: '!',
      });
      return res;
    },
    expectedStatus: 400,
  }),
  new IntegrationTest<void>({
    group,
    snapshot: true,
    name: 'Can get all settings',
    test: async function () {
      const res = await this.client.settings.settingsControllerGet();
      return res;
    },
  }),
  new IntegrationTest<void>({
    group,
    snapshot: true,
    name: 'Can get all settings with a filter',
    test: async function () {
      const res = await this.client.settings.settingsControllerGet([SettingsOutputDTOKeyEnum.CommandPrefix]);
      return res;
    },
  }),
  new IntegrationTest<GameServerOutputDTO>({
    group,
    snapshot: true,
    name: 'Gameservers can overwrite global settings',
    setup: async function () {
      return (await this.client.gameserver.gameServerControllerCreate(mockGameServer)).data.data;
    },
    test: async function () {
      await this.client.settings.settingsControllerSet(SettingsOutputDTOKeyEnum.CommandPrefix, {
        value: '!',
        gameServerId: this.setupData.id,
      });
      const resGlobal = await this.client.settings.settingsControllerGetOne(SettingsOutputDTOKeyEnum.CommandPrefix);
      expect(resGlobal.data.data.value).to.be.eq('/');
      expect(resGlobal.data.data.type).to.be.eq(SettingsOutputDTOTypeEnum.Default);

      const resGameServer = await this.client.settings.settingsControllerGetOne(
        SettingsOutputDTOKeyEnum.CommandPrefix,
        this.setupData.id,
      );
      expect(resGameServer.data.data.value).to.be.eq('!');
      expect(resGameServer.data.data.type).to.be.eq(SettingsOutputDTOTypeEnum.Override);

      return resGameServer;
    },
  }),
  new IntegrationTest<GameServerOutputDTO>({
    group,
    snapshot: true,
    name: 'Requesting game server settings merges with global settings',
    setup: async function () {
      return (await this.client.gameserver.gameServerControllerCreate(mockGameServer)).data.data;
    },
    test: async function () {
      await this.client.settings.settingsControllerSet(SettingsOutputDTOKeyEnum.CommandPrefix, {
        value: '!',
        gameServerId: this.setupData.id,
      });
      const res = await this.client.settings.settingsControllerGet(undefined, this.setupData.id);
      expect(res.data.data.find((k) => k.key === SettingsOutputDTOKeyEnum.CommandPrefix)?.value).to.be.eq('!');
      expect(res.data.data.find((k) => k.key === SettingsOutputDTOKeyEnum.CommandPrefix)?.type).to.be.eq(
        SettingsOutputDTOTypeEnum.Override,
      );
      expect(res.data.data.find((k) => k.key === SettingsOutputDTOKeyEnum.ServerChatName)?.value).to.be.eq('Takaro');
      expect(res.data.data.find((k) => k.key === SettingsOutputDTOKeyEnum.ServerChatName)?.type).to.be.eq(
        SettingsOutputDTOTypeEnum.Default,
      );

      const globalRes = await this.client.settings.settingsControllerGet();
      expect(globalRes.data.data.find((k) => k.key === SettingsOutputDTOKeyEnum.CommandPrefix)?.value).to.be.eq('/');
      expect(globalRes.data.data.find((k) => k.key === SettingsOutputDTOKeyEnum.CommandPrefix)?.type).to.be.eq(
        SettingsOutputDTOTypeEnum.Default,
      );
      expect(globalRes.data.data.find((k) => k.key === SettingsOutputDTOKeyEnum.ServerChatName)?.value).to.be.eq(
        'Takaro',
      );
      expect(globalRes.data.data.find((k) => k.key === SettingsOutputDTOKeyEnum.ServerChatName)?.type).to.be.eq(
        SettingsOutputDTOTypeEnum.Default,
      );

      return res;
    },
  }),
  new IntegrationTest<GameServerOutputDTO>({
    group,
    snapshot: true,
    name: 'Can unset gameserver setting, system goes back to global then',
    setup: async function () {
      return (await this.client.gameserver.gameServerControllerCreate(mockGameServer)).data.data;
    },
    test: async function () {
      await this.client.settings.settingsControllerSet(SettingsOutputDTOKeyEnum.CommandPrefix, {
        value: 'global!',
      });

      await this.client.settings.settingsControllerSet(SettingsOutputDTOKeyEnum.CommandPrefix, {
        value: 'server!',
        gameServerId: this.setupData.id,
      });

      const res = await this.client.settings.settingsControllerGet(
        [SettingsOutputDTOKeyEnum.CommandPrefix],
        this.setupData.id,
      );
      expect(res.data.data.find((k) => k.key === SettingsOutputDTOKeyEnum.CommandPrefix)?.value).to.be.eq('server!');
      expect(res.data.data.find((k) => k.key === SettingsOutputDTOKeyEnum.CommandPrefix)?.type).to.be.eq(
        SettingsOutputDTOTypeEnum.Override,
      );

      await this.client.settings.settingsControllerDelete(SettingsOutputDTOKeyEnum.CommandPrefix, this.setupData.id);

      const res2 = await this.client.settings.settingsControllerGet(
        [SettingsOutputDTOKeyEnum.CommandPrefix],
        this.setupData.id,
      );
      expect(res2.data.data.find((k) => k.key === SettingsOutputDTOKeyEnum.CommandPrefix)?.value).to.be.eq('global!');
      expect(res2.data.data.find((k) => k.key === SettingsOutputDTOKeyEnum.CommandPrefix)?.type).to.be.eq(
        SettingsOutputDTOTypeEnum.Inherit,
      );

      return res2;
    },
  }),
  new IntegrationTest<GameServerOutputDTO>({
    group,
    snapshot: true,
    name: 'Correctly handles global settings and the delete',
    setup: async function () {
      return (await this.client.gameserver.gameServerControllerCreate(mockGameServer)).data.data;
    },
    test: async function () {
      await this.client.settings.settingsControllerSet(SettingsOutputDTOKeyEnum.CommandPrefix, {
        value: 'global!',
      });

      const res = await this.client.settings.settingsControllerGet([SettingsOutputDTOKeyEnum.CommandPrefix]);
      expect(res.data.data.find((k) => k.key === SettingsOutputDTOKeyEnum.CommandPrefix)?.value).to.be.eq('global!');
      expect(res.data.data.find((k) => k.key === SettingsOutputDTOKeyEnum.CommandPrefix)?.type).to.be.eq(
        SettingsOutputDTOTypeEnum.Global,
      );

      await this.client.settings.settingsControllerDelete(SettingsOutputDTOKeyEnum.CommandPrefix);

      const res2 = await this.client.settings.settingsControllerGet([SettingsOutputDTOKeyEnum.CommandPrefix]);
      expect(res2.data.data.find((k) => k.key === SettingsOutputDTOKeyEnum.CommandPrefix)?.value).to.be.eq('/');
      expect(res2.data.data.find((k) => k.key === SettingsOutputDTOKeyEnum.CommandPrefix)?.type).to.be.eq(
        SettingsOutputDTOTypeEnum.Default,
      );

      return res2;
    },
  }),
  new IntegrationTest<GameServerOutputDTO>({
    group,
    snapshot: true,
    name: 'Setting for gameserver multiple times overwrites properly',
    setup: async function () {
      return (await this.client.gameserver.gameServerControllerCreate(mockGameServer)).data.data;
    },
    test: async function () {
      await this.client.settings.settingsControllerSet(SettingsOutputDTOKeyEnum.CommandPrefix, {
        value: '$',
        gameServerId: this.setupData.id,
      });
      await this.client.settings.settingsControllerSet(SettingsOutputDTOKeyEnum.CommandPrefix, {
        value: '!',
        gameServerId: this.setupData.id,
      });

      const res = await this.client.settings.settingsControllerGet(undefined, this.setupData.id);
      expect(res.data.data.find((k) => k.key === SettingsOutputDTOKeyEnum.CommandPrefix)?.value).to.be.eq('!');
      expect(res.data.data.find((k) => k.key === SettingsOutputDTOKeyEnum.CommandPrefix)?.type).to.be.eq(
        SettingsOutputDTOTypeEnum.Override,
      );
      expect(res.data.data.find((k) => k.key === SettingsOutputDTOKeyEnum.ServerChatName)?.value).to.be.eq('Takaro');
      expect(res.data.data.find((k) => k.key === SettingsOutputDTOKeyEnum.ServerChatName)?.type).to.be.eq(
        SettingsOutputDTOTypeEnum.Default,
      );

      const globalRes = await this.client.settings.settingsControllerGet();
      expect(globalRes.data.data.find((k) => k.key === SettingsOutputDTOKeyEnum.CommandPrefix)?.value).to.be.eq('/');
      expect(globalRes.data.data.find((k) => k.key === SettingsOutputDTOKeyEnum.CommandPrefix)?.type).to.be.eq(
        SettingsOutputDTOTypeEnum.Default,
      );
      expect(globalRes.data.data.find((k) => k.key === SettingsOutputDTOKeyEnum.ServerChatName)?.value).to.be.eq(
        'Takaro',
      );
      expect(globalRes.data.data.find((k) => k.key === SettingsOutputDTOKeyEnum.ServerChatName)?.type).to.be.eq(
        SettingsOutputDTOTypeEnum.Default,
      );

      return res;
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
