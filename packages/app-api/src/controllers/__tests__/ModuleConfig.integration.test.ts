import { IntegrationTest } from '@takaro/test';
import {
  GameServerCreateDTOTypeEnum,
  GameServerOutputDTO,
  ModuleOutputDTO,
} from '@takaro/apiclient';

const group = 'ModuleConfig';

interface ISetupData {
  gameserver: GameServerOutputDTO;
  module: ModuleOutputDTO;
}

const setup = async function (
  this: IntegrationTest<ISetupData>
): Promise<ISetupData> {
  const gameserverRes = await this.client.gameserver.gameServerControllerCreate(
    {
      name: 'Test gameserver',
      connectionInfo: '{}',
      type: GameServerCreateDTOTypeEnum.Mock,
    }
  );

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

  return {
    gameserver: gameserverRes.data.data,
    module: moduleRes.data.data,
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
        { config: JSON.stringify({ foo: 'bar' }) }
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
        { config: JSON.stringify({ foo: 'a' }) }
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
        { config: JSON.stringify({ foo: 'a'.repeat(11) }) }
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
        this.setupData.module.id,
        { config: JSON.stringify({}) }
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
        { config: JSON.stringify({ foo: 'bar', bar: 'foo' }) }
      );
    },
    filteredFields: ['gameserverId', 'moduleId'],
    expectedStatus: 400,
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
