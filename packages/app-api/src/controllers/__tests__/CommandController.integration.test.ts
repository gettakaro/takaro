import { IntegrationTest } from '@takaro/test';
import { CommandOutputDTOAPI, CommandCreateDTO } from '@takaro/apiclient';

const group = 'CommandController';

const mockCommand = (moduleId: string): CommandCreateDTO => ({
  name: 'Test command',
  enabled: true,
  moduleId,
});

const tests = [
  new IntegrationTest<CommandOutputDTOAPI>({
    group,
    snapshot: true,
    name: 'Get by ID',
    setup: async function () {
      const module = (
        await this.client.module.moduleControllerCreate({
          name: 'Test module',
        })
      ).data.data;
      return (
        await this.client.command.commandControllerCreate(
          mockCommand(module.id)
        )
      ).data;
    },
    test: async function () {
      return this.client.command.commandControllerGetOne(
        this.setupData.data.id
      );
    },
    filteredFields: ['moduleId'],
  }),
  new IntegrationTest<void>({
    group,
    snapshot: true,
    name: 'Create',
    test: async function () {
      const module = (
        await this.client.module.moduleControllerCreate({
          name: 'Test module',
        })
      ).data.data;
      return this.client.command.commandControllerCreate(
        mockCommand(module.id)
      );
    },
    filteredFields: ['moduleId'],
  }),
  new IntegrationTest<CommandOutputDTOAPI>({
    group,
    snapshot: true,
    name: 'Update',
    setup: async function () {
      const module = (
        await this.client.module.moduleControllerCreate({
          name: 'Test module',
        })
      ).data.data;
      return (
        await this.client.command.commandControllerCreate(
          mockCommand(module.id)
        )
      ).data;
    },
    test: async function () {
      return this.client.command.commandControllerUpdate(
        this.setupData.data.id,
        {
          name: 'Updated hook',
        }
      );
    },
    filteredFields: ['moduleId'],
  }),
  new IntegrationTest<CommandOutputDTOAPI>({
    group,
    snapshot: true,
    name: 'Delete',
    setup: async function () {
      const module = (
        await this.client.module.moduleControllerCreate({
          name: 'Test module',
        })
      ).data.data;
      return (
        await this.client.command.commandControllerCreate(
          mockCommand(module.id)
        )
      ).data;
    },
    test: async function () {
      return this.client.command.commandControllerRemove(
        this.setupData.data.id
      );
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
