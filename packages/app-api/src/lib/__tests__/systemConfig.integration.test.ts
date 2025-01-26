import { HookCreateDTOEventTypeEnum, ModuleOutputDTO } from '@takaro/apiclient';
import { IntegrationTest, expect } from '@takaro/test';
import { getModules } from '@takaro/modules';
import { getSystemConfigSchema } from '../systemConfig.js';
import _Ajv from 'ajv';

const Ajv = _Ajv as unknown as typeof _Ajv.default;

const ajv = new Ajv({ useDefaults: true });

const group = 'systemConfig';

const setup = async function (this: IntegrationTest<ModuleOutputDTO>) {
  const moduleRes = await this.client.module.moduleControllerCreate({
    name: 'Test module',
  });

  return moduleRes.data.data;
};

const bultinModules = await getModules();

const testsForBuiltinModules = bultinModules.map((mod) => {
  return new IntegrationTest<void>({
    group: `${group} - builtin modules`,
    snapshot: false,
    name: `Generates a valid schema for ${mod.name}`,
    test: async function () {
      const modRes = await this.client.module.moduleControllerSearch({
        filters: {
          name: [mod.name],
        },
      });

      ajv.compile(JSON.parse(getSystemConfigSchema(modRes.data.data[0].latestVersion)));
    },
  });
});

const tests = [
  ...testsForBuiltinModules,
  new IntegrationTest<ModuleOutputDTO>({
    group,
    snapshot: false,
    name: 'Works without any commands, hooks, or cron jobs',
    setup,
    test: async function () {
      const modRes = await this.client.module.moduleControllerGetOne(this.setupData.id);
      const systemConfigStr = getSystemConfigSchema(modRes.data.data.latestVersion);
      const systemConfig = JSON.parse(systemConfigStr);

      // Should be a valid schema which compiles
      ajv.compile(systemConfig);

      expect(systemConfig.properties).to.be.eql({
        enabled: {
          default: true,
          description: 'Enable/disable the module without having to uninstall it.',
          type: 'boolean',
        },
      });
    },
  }),
  new IntegrationTest<ModuleOutputDTO>({
    group,
    snapshot: false,
    name: 'Works with a simple command',
    setup,
    test: async function () {
      await this.client.command.commandControllerCreate({
        name: 'Test command',
        versionId: this.setupData.latestVersion.id,
        trigger: 'test',
      });

      const modRes = await this.client.module.moduleControllerGetOne(this.setupData.id);
      const systemConfigStr = getSystemConfigSchema(modRes.data.data.latestVersion);
      const systemConfig = JSON.parse(systemConfigStr);

      // Should be a valid schema which compiles
      ajv.compile(systemConfig);
    },
  }),
  new IntegrationTest<ModuleOutputDTO>({
    group,
    snapshot: false,
    name: 'Works with a single cronJob',
    setup,
    test: async function () {
      await this.client.cronjob.cronJobControllerCreate({
        name: 'Test cronJob',
        versionId: this.setupData.latestVersion.id,
        temporalValue: '* * * * *',
      });

      const modRes = await this.client.module.moduleControllerGetOne(this.setupData.id);
      const systemConfigStr = getSystemConfigSchema(modRes.data.data.latestVersion);
      const systemConfig = JSON.parse(systemConfigStr);

      ajv.compile(systemConfig);

      expect(systemConfig.properties.cronJobs).to.not.be.undefined;
    },
  }),
  new IntegrationTest<ModuleOutputDTO>({
    group,
    snapshot: false,
    name: 'Works with multiple cronJobs',
    setup,
    test: async function () {
      await this.client.cronjob.cronJobControllerCreate({
        name: 'Test cronJob 1',
        versionId: this.setupData.latestVersion.id,
        temporalValue: '* * * * *',
      });
      await this.client.cronjob.cronJobControllerCreate({
        name: 'Test cronJob 2',
        versionId: this.setupData.latestVersion.id,
        temporalValue: '* * * * *',
      });

      const modRes = await this.client.module.moduleControllerGetOne(this.setupData.id);
      const systemConfigStr = getSystemConfigSchema(modRes.data.data.latestVersion);
      const systemConfig = JSON.parse(systemConfigStr);

      ajv.compile(systemConfig);

      expect(systemConfig.properties.cronJobs.properties).to.have.property('Test cronJob 1');
      expect(systemConfig.properties.cronJobs.properties).to.have.property('Test cronJob 2');
    },
  }),
  new IntegrationTest<ModuleOutputDTO>({
    group,
    snapshot: false,
    name: 'Works with a single DISCORD_MESSAGE hook',
    setup,
    test: async function () {
      await this.client.hook.hookControllerCreate({
        name: 'Test hook',
        versionId: this.setupData.latestVersion.id,
        eventType: HookCreateDTOEventTypeEnum.DiscordMessage,
        regex: '.*',
      });

      const modRes = await this.client.module.moduleControllerGetOne(this.setupData.id);
      const systemConfigStr = getSystemConfigSchema(modRes.data.data.latestVersion);
      const systemConfig = JSON.parse(systemConfigStr);

      ajv.compile(systemConfig);

      expect(systemConfig.properties.hooks).to.not.be.undefined;
      expect(systemConfig.properties.hooks.properties['Test hook'].properties.discordChannelId).to.not.be.undefined;
    },
  }),
  new IntegrationTest<ModuleOutputDTO>({
    group,
    snapshot: false,
    name: 'Works with multiple DISCORD_MESSAGE hooks',
    setup,
    test: async function () {
      await this.client.hook.hookControllerCreate({
        name: 'Test hook 1',
        versionId: this.setupData.latestVersion.id,
        eventType: HookCreateDTOEventTypeEnum.DiscordMessage,
        regex: '.*',
      });
      await this.client.hook.hookControllerCreate({
        name: 'Test hook 2',
        versionId: this.setupData.latestVersion.id,
        eventType: HookCreateDTOEventTypeEnum.DiscordMessage,
        regex: '.*',
      });

      const modRes = await this.client.module.moduleControllerGetOne(this.setupData.id);
      const systemConfigStr = getSystemConfigSchema(modRes.data.data.latestVersion);
      const systemConfig = JSON.parse(systemConfigStr);

      ajv.compile(systemConfig);

      expect(systemConfig.properties.hooks.properties['Test hook 1'].properties).to.have.property('discordChannelId');
      expect(systemConfig.properties.hooks.properties['Test hook 2'].properties).to.have.property('discordChannelId');
    },
  }),
  new IntegrationTest<ModuleOutputDTO>({
    group,
    snapshot: false,
    name: 'Works with a single hook that is not DISCORD_MESSAGE',
    setup,
    test: async function () {
      await this.client.hook.hookControllerCreate({
        name: 'Test non-discord hook',
        versionId: this.setupData.latestVersion.id,
        eventType: HookCreateDTOEventTypeEnum.ChatMessage,
        regex: '.*',
      });

      const modRes = await this.client.module.moduleControllerGetOne(this.setupData.id);
      const systemConfigStr = getSystemConfigSchema(modRes.data.data.latestVersion);
      const systemConfig = JSON.parse(systemConfigStr);

      ajv.compile(systemConfig);

      expect(systemConfig.properties.hooks.properties['Test non-discord hook'].properties.discordChannelId).to.be
        .undefined;
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
