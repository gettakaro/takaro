import { IntegrationTest, expect } from '@takaro/test';
import { GameServerOutputDTO, isAxiosError, ModuleOutputDTO } from '@takaro/apiclient';
import { describe } from 'node:test';
import { randomUUID } from 'node:crypto';
import { getMockServer } from '@takaro/mock-gameserver';

const group = 'ModuleConfig';

interface ISetupData {
  gameserver: GameServerOutputDTO;
  module: ModuleOutputDTO;
  cronJobsModule: ModuleOutputDTO;
}

const setup = async function (this: IntegrationTest<ISetupData>): Promise<ISetupData> {
  if (!this.domainRegistrationToken) throw new Error('Domain registration token is not set. Invalid setup?');

  const gameServer1IdentityToken = randomUUID();

  await getMockServer({
    mockserver: { registrationToken: this.domainRegistrationToken, identityToken: gameServer1IdentityToken },
  });

  const gameServers = (
    await this.client.gameserver.gameServerControllerSearch({
      filters: { identityToken: [gameServer1IdentityToken] },
    })
  ).data.data;

  if (!gameServers[0]) throw new Error('Game server not found. Did something fail when registering?');

  const moduleRes = await this.client.module.moduleControllerCreate({
    name: 'Test module',
    latestVersion: {
      description: 'Test description',
      configSchema: JSON.stringify({
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          foo: {
            type: 'string',
            minLength: 3,
            maxLength: 10,
          },
        },
        required: ['foo'],
        additionalProperties: false,
      }),
    },
  });

  const cronjobModuleCreateRes = await this.client.module.moduleControllerCreate({
    name: 'Test module cronjobs',
    latestVersion: {
      description: 'Test description',
      configSchema: JSON.stringify({
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {},
        required: [],
        additionalProperties: false,
      }),
    },
  });

  await this.client.cronjob.cronJobControllerCreate({
    versionId: cronjobModuleCreateRes.data.data.latestVersion.id,
    name: 'Test cron job',
    temporalValue: '1 * * * *',
    function: 'test',
  });

  const cronjobModuleRes = await this.client.module.moduleControllerGetOne(cronjobModuleCreateRes.data.data.id);

  return {
    gameserver: gameServers[0],
    module: moduleRes.data.data,
    cronJobsModule: cronjobModuleRes.data.data,
  };
};

const tests = [
  new IntegrationTest<ISetupData>({
    group,
    snapshot: true,
    name: 'Installing a module with correct config',
    setup,
    test: async function () {
      return this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.module.latestVersion.id,
        userConfig: JSON.stringify({ foo: 'bar' }),
      });
    },
    filteredFields: ['gameserverId', 'moduleId'],
  }),
  new IntegrationTest<ISetupData>({
    group,
    snapshot: true,
    name: 'Installing a module with incorrect config (value too short)',
    setup,
    test: async function () {
      return this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.module.latestVersion.id,
        userConfig: JSON.stringify({ foo: 'a' }),
      });
    },
    filteredFields: ['gameserverId', 'moduleId'],
    expectedStatus: 400,
  }),
  new IntegrationTest<ISetupData>({
    group,
    snapshot: true,
    name: 'Installing a module with incorrect config (value too long)',
    setup,
    test: async function () {
      return this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.module.latestVersion.id,

        userConfig: JSON.stringify({ foo: 'a'.repeat(11) }),
      });
    },
    filteredFields: ['gameserverId', 'moduleId'],
    expectedStatus: 400,
  }),
  new IntegrationTest<ISetupData>({
    group,
    snapshot: true,
    name: 'Installing a module with incorrect config (missing property)',
    setup,
    test: async function () {
      return this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.module.latestVersion.id,
      });
    },
    filteredFields: ['gameserverId', 'moduleId'],
    expectedStatus: 400,
  }),
  new IntegrationTest<ISetupData>({
    group,
    snapshot: true,
    name: 'Installing a module with incorrect config (additional property)',
    setup,
    test: async function () {
      return this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.module.latestVersion.id,

        userConfig: JSON.stringify({ foo: 'bar', bar: 'foo' }),
      });
    },
    filteredFields: ['gameserverId', 'moduleId'],
    expectedStatus: 400,
  }),
  new IntegrationTest<ISetupData>({
    group,
    snapshot: true,
    name: 'Installing with invalid system config - not json',
    setup,
    test: async function () {
      return this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.cronJobsModule.latestVersion.id,

        userConfig: JSON.stringify({ foo: 'bar' }),
        systemConfig: 'invalid',
      });
    },
    filteredFields: ['gameServerId', 'moduleId'],
    expectedStatus: 400,
  }),
  new IntegrationTest<ISetupData>({
    group,
    snapshot: false,
    name: 'Installing with invalid system config - wrong property',
    setup,
    test: async function () {
      try {
        await this.client.module.moduleInstallationsControllerInstallModule({
          gameServerId: this.setupData.gameserver.id,
          versionId: this.setupData.cronJobsModule.latestVersion.id,

          userConfig: JSON.stringify({ foo: 'bar' }),
          systemConfig: JSON.stringify({ foo: 'bar' }),
        });
        throw new Error('Should not be able to install module with invalid system config');
      } catch (error) {
        if (!isAxiosError(error)) {
          throw error;
        }

        expect(error.response?.status).to.equal(400);
        expect(error.response?.data.meta.error.message).to.match(/Invalid config: must NOT have additional /);
      }
    },
    filteredFields: ['gameserverId', 'moduleId'],
    expectedStatus: 400,
  }),
  new IntegrationTest<ISetupData>({
    group,
    snapshot: true,
    name: 'Installing with correct system config',
    setup,
    test: async function () {
      return await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.cronJobsModule.latestVersion.id,

        systemConfig: JSON.stringify({
          cronJobs: {
            [this.setupData.cronJobsModule.latestVersion.cronJobs[0].name]: { temporalValue: '5 * * * *' },
          },
        }),
      });
    },
    filteredFields: ['gameserverId', 'moduleId', 'functionId'],
  }),
  new IntegrationTest<ISetupData>({
    group,
    snapshot: false,
    name: 'Installing with correct system config - multiple cron jobs',
    setup,
    test: async function () {
      await this.client.cronjob.cronJobControllerCreate({
        versionId: this.setupData.cronJobsModule.latestVersion.id,
        name: 'Test cron job 2',
        temporalValue: '42 * * * *',
        function: 'test',
      });

      const updatedModuleRes = await this.client.module.moduleControllerGetOne(this.setupData.cronJobsModule.id);

      const res = await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.cronJobsModule.latestVersion.id,

        systemConfig: JSON.stringify({
          cronJobs: {
            [updatedModuleRes.data.data.latestVersion.cronJobs[0].name]: { temporalValue: '5 * * * *' },
            [updatedModuleRes.data.data.latestVersion.cronJobs[1].name]: { temporalValue: '13 * * * *' },
          },
        }),
      });

      const data = res.data.data;
      expect(
        (data.systemConfig as Record<string, any>).cronJobs[updatedModuleRes.data.data.latestVersion.cronJobs[0].name],
      ).to.not.be.undefined;
      expect(
        (data.systemConfig as Record<string, any>).cronJobs[updatedModuleRes.data.data.latestVersion.cronJobs[1].name],
      ).to.not.be.undefined;
    },
    filteredFields: ['gameserverId', 'moduleId', 'functionId'],
  }),
  new IntegrationTest<ISetupData>({
    group,
    snapshot: true,
    name: 'Installing with correct system config - should default cronjob values',
    setup,
    test: async function () {
      const installRes = await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.cronJobsModule.latestVersion.id,
      });

      expect(installRes.data.data.systemConfig).to.deep.equal({
        enabled: true,
        cronJobs: {
          [this.setupData.cronJobsModule.latestVersion.cronJobs[0].name]: {
            enabled: true,
            temporalValue: this.setupData.cronJobsModule.latestVersion.cronJobs[0].temporalValue,
          },
        },
      });

      return installRes;
    },
    filteredFields: ['gameserverId', 'moduleId', 'functionId'],
  }),
  new IntegrationTest<ISetupData>({
    group,
    snapshot: false,
    name: 'Creating a module with bad schema throws a proper error',
    setup,
    test: async function () {
      const goodSchema = `{
                          "$schema": "http://json-schema.org/draft-07/schema",
                          "type": "object",
                          "properties": {
                            "warningMessage": {
                              "type": "string",
                              "title": "Warning message",
                              "description": "Message to send to players before the server shuts down.",
                              "default": "Server is shutting down in 5 minutes!",
                              "minLength": 1,
                              "maxLength": 1024
                            }
                          },
                          "required": [
                            "warningMessage"
                          ]
                        }`;
      // Note the bad 'minLengt' property
      const badSchema = `{
                          "$schema": "http://json-schema.org/draft-07/schema",
                          "type": "object",
                          "properties": {
                            "warningMessage": {
                              "type": "string",
                              "title": "Warning message",
                              "description": "Message to send to players before the server shuts down.",
                              "default": "Server is shutting down in 5 minutes!",
                              "minLengt": 1,
                              "maxLength": 1024
                            }
                          },
                          "required": [
                            "warningMessage"
                          ]
                        }`;

      const mod = (
        await this.client.module.moduleControllerCreate({
          name: 'Cool module',
          latestVersion: {
            description: 'Test description',
            configSchema: goodSchema,
          },
        })
      ).data.data;

      try {
        await this.client.module.moduleControllerUpdate(mod.id, { latestVersion: { configSchema: badSchema } });
        throw new Error('Should not be able to update module with bad schema');
      } catch (error) {
        if (!isAxiosError(error)) {
          throw error;
        }

        expect(error.response?.status).to.equal(400);
        expect(error.response?.data.meta.error.message).to.match(/Invalid config schema/);
      }
    },
  }),
  new IntegrationTest<ISetupData>({
    group,
    snapshot: false,
    name: 'Installing a module takes the defaultSystemConfig into account',
    setup,
    test: async function () {
      await this.client.module.moduleControllerUpdate(this.setupData.cronJobsModule.id, {
        latestVersion: {
          defaultSystemConfig: JSON.stringify({ cronJobs: { 'Test cron job': { temporalValue: '1 1 1 1 1' } } }),
        },
      });

      const installRes = await this.client.module.moduleInstallationsControllerInstallModule({
        gameServerId: this.setupData.gameserver.id,
        versionId: this.setupData.cronJobsModule.latestVersion.id,
      });

      expect((installRes.data.data.systemConfig as any).cronJobs['Test cron job'].temporalValue).to.equal('1 1 1 1 1');
    },
  }),
  new IntegrationTest<ISetupData>({
    group,
    snapshot: true,
    name: 'Setting a default system config runs the validation on it when updating module',
    setup,
    test: async function () {
      return this.client.module.moduleControllerUpdate(this.setupData.cronJobsModule.id, {
        // Enabled should be a boolean ;)
        latestVersion: { defaultSystemConfig: JSON.stringify({ enabled: 'a little bit' }) },
      });
    },
    expectedStatus: 400,
  }),
  new IntegrationTest<ISetupData>({
    group,
    snapshot: true,
    name: 'Setting a default system config runs the validation on it when creating module',
    setup,
    test: async function () {
      return this.client.module.moduleControllerCreate({
        name: 'Test module 2',
        latestVersion: {
          description: 'Test description',
          // Enabled should be a boolean ;)
          defaultSystemConfig: JSON.stringify({ enabled: 'a little bit' }),
        },
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
