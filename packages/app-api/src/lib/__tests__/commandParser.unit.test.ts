import { expect } from '@takaro/test';
import { randomUUID } from 'crypto';
import {
  CommandArgumentOutputDTO,
  CommandOutputDTO,
} from '../../service/CommandService.js';
import { parseCommand } from '../commandParser';

const MockArgument_name = await new CommandArgumentOutputDTO().construct({
  name: 'name',
  position: 0,
  type: 'string',
  helpText: 'The name of the teleport location',
  id: randomUUID(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  domain: 'mock domain',
});

const MockArgument_public = await new CommandArgumentOutputDTO().construct({
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

const MockArgument_number = await new CommandArgumentOutputDTO().construct({
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

const MockTeleportCommand = await new CommandOutputDTO().construct({
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

describe('commandParser', () => {
  before(async () => {
    // Ensure the Mock objects are valid, don't want mocks to drift from reality
    await MockTeleportCommand.validate();
  });

  it('Can parse a basic command', () => {
    const parsed = parseCommand('/settele test', MockTeleportCommand);
    expect(parsed.command).to.equal('settele');
    expect(parsed.arguments.name).to.equal('test');
  });

  it('Respects default values', () => {
    const parsed = parseCommand('/settele test', MockTeleportCommand);
    expect(parsed.command).to.equal('settele');
    expect(parsed.arguments.name).to.equal('test');
    expect(parsed.arguments.public).to.equal(false);
    expect(parsed.arguments.number).to.equal(42);
  });

  it('Can parse a command with a boolean argument', () => {
    const parsed = parseCommand('/settele test true', MockTeleportCommand);
    expect(parsed.command).to.equal('settele');
    expect(parsed.arguments.name).to.equal('test');
    expect(parsed.arguments.public).to.equal(true);
  });

  it('Can handle arguments with spaces', () => {
    const parsed = parseCommand(
      '/settele "test command" true',
      MockTeleportCommand
    );
    expect(parsed.command).to.equal('settele');
    expect(parsed.arguments.name).to.equal('test command');
    expect(parsed.arguments.public).to.equal(true);
  });

  it('Throws an error when invalid boolean types are provided', () => {
    expect(() =>
      parseCommand('/settele test 42', MockTeleportCommand)
    ).to.throw('Invalid boolean value for argument "public"');
    expect(() =>
      parseCommand('/settele test foobar', MockTeleportCommand)
    ).to.throw('Invalid boolean value for argument "public"');
  });

  it('Throws an error when invalid number types are provided', () => {
    expect(() =>
      parseCommand('/settele test true foobar', MockTeleportCommand)
    ).to.throw('Invalid number value for argument "number"');
  });

  it('Throws when required arguments are missing', () => {
    expect(() => parseCommand('/settele', MockTeleportCommand)).to.throw(
      'Missing argument "name"'
    );
  });
});
