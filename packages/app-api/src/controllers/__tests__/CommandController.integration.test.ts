import { IntegrationTest, expect } from '@takaro/test';
import { CommandOutputDTOAPI, CommandCreateDTO, CommandArgumentCreateDTO } from '@takaro/apiclient';

const group = 'CommandController';

const mockCommand = (versionId: string, name = 'Test command'): CommandCreateDTO => ({
  name,
  trigger: 'test',
  versionId,
});

const mockArgument = (commandId: string, name = 'Test argument'): CommandArgumentCreateDTO => ({
  name,
  type: 'string',
  commandId,
  position: 0,
});

async function setupModuleAndCommand(this: IntegrationTest<any>): Promise<CommandOutputDTOAPI> {
  const mod = (
    await this.client.module.moduleControllerCreate({
      name: 'Test module',
    })
  ).data.data;

  return (await this.client.command.commandControllerCreate(mockCommand(mod.latestVersion.id))).data;
}

const tests = [
  new IntegrationTest<CommandOutputDTOAPI>({
    group,
    snapshot: true,
    name: 'Get by ID',
    setup: setupModuleAndCommand,
    test: async function () {
      return this.client.command.commandControllerGetOne(this.setupData.data.id);
    },
    filteredFields: ['moduleId', 'functionId'],
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
      return this.client.command.commandControllerCreate(mockCommand(module.id));
    },
    filteredFields: ['moduleId', 'functionId'],
  }),
  new IntegrationTest<CommandOutputDTOAPI>({
    group,
    snapshot: true,
    name: 'Update',
    setup: setupModuleAndCommand,
    test: async function () {
      return this.client.command.commandControllerUpdate(this.setupData.data.id, {
        name: 'Updated command',
      });
    },
    filteredFields: ['moduleId', 'functionId'],
  }),
  new IntegrationTest<CommandOutputDTOAPI>({
    group,
    snapshot: true,
    name: 'Delete',
    setup: setupModuleAndCommand,
    test: async function () {
      return this.client.command.commandControllerRemove(this.setupData.data.id);
    },
  }),
  new IntegrationTest<CommandOutputDTOAPI>({
    group,
    snapshot: true,
    name: 'Create command argument',
    setup: setupModuleAndCommand,
    test: async function () {
      return this.client.command.commandControllerCreateArgument(mockArgument(this.setupData.data.id));
    },
    filteredFields: ['moduleId', 'functionId', 'commandId'],
  }),
  new IntegrationTest<CommandOutputDTOAPI>({
    group,
    snapshot: true,
    name: 'Update command argument',
    setup: setupModuleAndCommand,
    test: async function () {
      const arg = (await this.client.command.commandControllerCreateArgument(mockArgument(this.setupData.data.id))).data
        .data;
      return this.client.command.commandControllerUpdateArgument(arg.id, {
        name: 'Updated argument',
      });
    },
    filteredFields: ['moduleId', 'functionId', 'commandId'],
  }),
  new IntegrationTest<CommandOutputDTOAPI>({
    group,
    snapshot: true,
    name: 'Delete command argument',
    setup: setupModuleAndCommand,
    test: async function () {
      const arg = (await this.client.command.commandControllerCreateArgument(mockArgument(this.setupData.data.id))).data
        .data;
      return this.client.command.commandControllerRemoveArgument(arg.id);
    },
  }),
  new IntegrationTest<CommandOutputDTOAPI>({
    group,
    snapshot: true,
    name: 'Cannot create arguments with the same name in the same command',
    setup: setupModuleAndCommand,
    test: async function () {
      const ARG_NAME = 'Test argument';
      await this.client.command.commandControllerCreateArgument(mockArgument(this.setupData.data.id, ARG_NAME));

      // Creating an argument with the same name in a different command should work
      const newCommand = await this.client.command.commandControllerCreate(
        mockCommand(this.setupData.data.versionId, 'command 2'),
      );

      const arg2res = await this.client.command.commandControllerCreateArgument(
        mockArgument(newCommand.data.data.id, ARG_NAME),
      );

      expect(arg2res.data.data.name).to.be.eq(ARG_NAME);

      // Creating an argument with the same name in the same command should fail
      return this.client.command.commandControllerCreateArgument(mockArgument(this.setupData.data.id, ARG_NAME));
    },
    filteredFields: ['moduleId', 'functionId', 'commandId'],
    expectedStatus: 409,
  }),
];

describe(group, function () {
  tests.forEach((test) => {
    test.run();
  });
});
