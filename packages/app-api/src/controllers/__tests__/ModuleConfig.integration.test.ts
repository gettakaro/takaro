import { IntegrationTest, expect, integrationConfig } from '@takaro/test';
import { GameServerCreateDTOTypeEnum, GameServerOutputDTO, isAxiosError, ModuleOutputDTO } from '@takaro/apiclient';

const group = 'ModuleConfig';

interface ISetupData {
  gameserver: GameServerOutputDTO;
  module: ModuleOutputDTO;
  cronJobsModule: ModuleOutputDTO;
}

const setup = async function (this: IntegrationTest<ISetupData>): Promise<ISetupData> {
  const gameserverRes = await this.client.gameserver.gameServerControllerCreate({
    name: 'Test gameserver',
    connectionInfo: JSON.stringify({
      host: integrationConfig.get('mockGameserver.host'),
    }),
    type: GameServerCreateDTOTypeEnum.Mock,
  });

  const moduleRes = await this.client.module.moduleControllerCreate({
    name: 'Test module',
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
  });

  const cronjobModuleCreateRes = await this.client.module.moduleControllerCreate({
    name: 'Test module cronjobs',
    description: 'Test description',
    configSchema: JSON.stringify({
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {},
      required: [],
      additionalProperties: false,
    }),
  });

  await this.client.cronjob.cronJobControllerCreate({
    moduleId: cronjobModuleCreateRes.data.data.id,
    name: 'Test cron job',
    temporalValue: '1 * * * *',
    function: 'test',
  });

  const cronjobModuleRes = await this.client.module.moduleControllerGetOne(cronjobModuleCreateRes.data.data.id);

  return {
    gameserver: gameserverRes.data.data,
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
      return this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.module.id,
        { userConfig: JSON.stringify({ foo: 'bar' }) }
      );
    },
    filteredFields: ['gameserverId', 'moduleId'],
  }),
  new IntegrationTest<ISetupData>({
    group,
    snapshot: true,
    name: 'Installing a module with incorrect config (value too short)',
    setup,
    test: async function () {
      return this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.module.id,
        { userConfig: JSON.stringify({ foo: 'a' }) }
      );
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
      return this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.module.id,
        {
          userConfig: JSON.stringify({ foo: 'a'.repeat(11) }),
        }
      );
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
      return this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.module.id
      );
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
      return this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.module.id,
        {
          userConfig: JSON.stringify({ foo: 'bar', bar: 'foo' }),
        }
      );
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
      return this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.cronJobsModule.id,
        {
          userConfig: JSON.stringify({ foo: 'bar' }),
          systemConfig: 'invalid',
        }
      );
    },
    filteredFields: ['gameserverId', 'moduleId'],
    expectedStatus: 400,
  }),
  new IntegrationTest<ISetupData>({
    group,
    snapshot: false,
    name: 'Installing with invalid system config - wrong property',
    setup,
    test: async function () {
      try {
        await this.client.gameserver.gameServerControllerInstallModule(
          this.setupData.gameserver.id,
          this.setupData.cronJobsModule.id,
          {
            userConfig: JSON.stringify({ foo: 'bar' }),
            systemConfig: JSON.stringify({ foo: 'bar' }),
          }
        );
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
      return await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.cronJobsModule.id,
        {
          systemConfig: JSON.stringify({
            cronJobs: {
              [this.setupData.cronJobsModule.cronJobs[0].name]: '5 * * * *',
            },
          }),
        }
      );
    },
    filteredFields: ['gameserverId', 'moduleId'],
  }),
  new IntegrationTest<ISetupData>({
    group,
    snapshot: true,
    name: 'Installing with correct system config - multiple cron jobs',
    setup,
    test: async function () {
      await this.client.cronjob.cronJobControllerCreate({
        moduleId: this.setupData.cronJobsModule.id,
        name: 'Test cron job 2',
        temporalValue: '42 * * * *',
        function: 'test',
      });

      const updatedModuleRes = await this.client.module.moduleControllerGetOne(this.setupData.cronJobsModule.id);

      return await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.cronJobsModule.id,
        {
          systemConfig: JSON.stringify({
            cronJobs: {
              [updatedModuleRes.data.data.cronJobs[0].name]: '5 * * * *',
              [updatedModuleRes.data.data.cronJobs[1].name]: '13 * * * *',
            },
          }),
        }
      );
    },
    filteredFields: ['gameserverId', 'moduleId'],
  }),
  new IntegrationTest<ISetupData>({
    group,
    snapshot: true,
    name: 'Installing with correct system config - should default cronjob values',
    setup,
    test: async function () {
      const installRes = await this.client.gameserver.gameServerControllerInstallModule(
        this.setupData.gameserver.id,
        this.setupData.cronJobsModule.id
      );

      expect(installRes.data.data.systemConfig).to.deep.equal({
        cronJobs: {
          [this.setupData.cronJobsModule.cronJobs[0].name]: this.setupData.cronJobsModule.cronJobs[0].temporalValue,
        },
      });

      return installRes;
    },
    filteredFields: ['gameserverId', 'moduleId'],
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
