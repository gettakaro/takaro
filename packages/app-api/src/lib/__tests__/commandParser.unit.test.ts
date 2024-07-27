import { expect } from '@takaro/test';
import { randomUUID } from 'crypto';
import { CommandArgumentOutputDTO, CommandOutputDTO } from '../../service/CommandService.js';
import { parseCommand } from '../commandParser.js';

const MockArgument_name = new CommandArgumentOutputDTO({
  name: 'name',
  position: 0,
  type: 'string',
  helpText: 'The name of the teleport location',
  id: randomUUID(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  domain: 'mock domain',
});

const MockArgument_public = new CommandArgumentOutputDTO({
  name: 'public',
  defaultValue: 'false',
  position: 1,
  type: 'boolean',
  helpText: 'Whether the teleport location is public',
  id: randomUUID(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  domain: 'mock domain',
});

const MockArgument_number = new CommandArgumentOutputDTO({
  name: 'number',
  defaultValue: '42',
  position: 2,
  type: 'number',
  helpText: 'A number',
  id: randomUUID(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  domain: 'mock domain',
});

const MockTeleportCommand = new CommandOutputDTO({
  id: randomUUID(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  functionId: randomUUID(),
  moduleId: randomUUID(),
  domain: 'mock domain',
  name: 'settele',
  trigger: 'settele',
  helpText: 'Set a teleport location',
  arguments: [MockArgument_name, MockArgument_public, MockArgument_number],
});

const mockGameServerId = randomUUID();

describe('commandParser', () => {
  before(async () => {
    // Ensure the Mock objects are valid, don't want mocks to drift from reality
    await MockTeleportCommand.validate();
  });

  it('Can parse a basic command', async () => {
    const parsed = await parseCommand('/settele test', MockTeleportCommand, mockGameServerId);
    expect(parsed.command).to.equal('settele');
    expect(parsed.arguments.name).to.equal('test');
  });

  it('Respects default values', async () => {
    const parsed = await parseCommand('/settele test', MockTeleportCommand, mockGameServerId);
    expect(parsed.command).to.equal('settele');
    expect(parsed.arguments.name).to.equal('test');
    expect(parsed.arguments.public).to.equal(false);
    expect(parsed.arguments.number).to.equal(42);
  });

  it('Can parse a command with a boolean argument', async () => {
    const parsed = await parseCommand('/settele test true', MockTeleportCommand, mockGameServerId);
    expect(parsed.command).to.equal('settele');
    expect(parsed.arguments.name).to.equal('test');
    expect(parsed.arguments.public).to.equal(true);
  });

  it('Can handle arguments with spaces', async () => {
    const parsed = await parseCommand('/settele "test command" true', MockTeleportCommand, mockGameServerId);
    expect(parsed.command).to.equal('settele');
    expect(parsed.arguments.name).to.equal('test command');
    expect(parsed.arguments.public).to.equal(true);
  });

  it('Throws an error when invalid boolean types are provided', async () => {
    await expect(parseCommand('/settele test 42', MockTeleportCommand, mockGameServerId)).to.be.rejectedWith(
      'The value for "public" should be either "true" or "false". Please correct it and try again.',
    );
    await expect(parseCommand('/settele test foobar', MockTeleportCommand, mockGameServerId)).to.be.rejectedWith(
      'The value for "public" should be either "true" or "false". Please correct it and try again.',
    );
  });

  it('Throws an error when invalid number types are provided', async () => {
    await expect(parseCommand('/settele test true foobar', MockTeleportCommand, mockGameServerId)).to.be.rejectedWith(
      'The value for "number" should be a number. Please correct it and try again.',
    );
  });

  it('Throws when required arguments are missing', async () => {
    await expect(parseCommand('/settele', MockTeleportCommand, mockGameServerId)).to.be.rejectedWith(
      'Oops! It seems you forgot to provide the "name" value. Please check and try again.',
    );
  });
});
