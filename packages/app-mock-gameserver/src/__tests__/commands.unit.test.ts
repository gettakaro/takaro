import 'reflect-metadata';
import { CommandRegistry } from '../lib/ws-gameserver/commands/registry.js';
import { BaseCommand, CommandContext } from '../lib/ws-gameserver/commands/types.js';
import { CommandOutput } from '@takaro/gameserver';
import { expect } from '@takaro/test';
import { describe, it } from 'node:test';

// Create a test command
class TestCommand extends BaseCommand {
  name = 'test';
  description = 'Test command';
  usage = 'test [args]';
  aliases = ['t', 'tst'];

  async execute(args: string[], _context: CommandContext): Promise<CommandOutput> {
    return this.success(`Test executed with args: ${args.join(', ')}`);
  }

  validate(args: string[]) {
    if (args.length > 0 && args[0] === 'invalid') {
      return { valid: false, error: 'Invalid argument provided' };
    }
    return { valid: true };
  }
}

describe('CommandRegistry', () => {
  describe('Command Registration', () => {
    it('should register a command', () => {
      const registry = new CommandRegistry();
      const command = new TestCommand();

      registry.register(command);

      const retrieved = registry.get('test');
      expect(retrieved).to.equal(command);
    });

    it('should register command aliases', () => {
      const registry = new CommandRegistry();
      const command = new TestCommand();

      registry.register(command);

      expect(registry.get('t')).to.equal(command);
      expect(registry.get('tst')).to.equal(command);
    });

    it('should handle case-insensitive command names', () => {
      const registry = new CommandRegistry();
      const command = new TestCommand();

      registry.register(command);

      expect(registry.get('TEST')).to.equal(command);
      expect(registry.get('Test')).to.equal(command);
    });

    it('should register multiple commands', () => {
      const registry = new CommandRegistry();
      const command1 = new TestCommand();
      const command2 = new TestCommand();
      command2.name = 'test2';

      registry.registerAll([command1, command2]);

      expect(registry.getAll()).to.have.lengthOf(2);
    });
  });

  describe('Command Parsing', () => {
    it('should parse simple command', () => {
      const registry = new CommandRegistry();
      const command = new TestCommand();
      registry.register(command);

      const parsed = registry.parse('test arg1 arg2');

      expect(parsed.command).to.equal(command);
      expect(parsed.commandName).to.equal('test');
      expect(parsed.args).to.deep.equal(['arg1', 'arg2']);
    });

    it('should parse command with quoted arguments', () => {
      const registry = new CommandRegistry();
      const command = new TestCommand();
      registry.register(command);

      const parsed = registry.parse('test "hello world" arg2');

      expect(parsed.args).to.deep.equal(['hello world', 'arg2']);
    });

    it('should parse command with single quotes', () => {
      const registry = new CommandRegistry();
      const command = new TestCommand();
      registry.register(command);

      const parsed = registry.parse("test 'hello world' arg2");

      expect(parsed.args).to.deep.equal(['hello world', 'arg2']);
    });

    it('should handle unknown commands', () => {
      const registry = new CommandRegistry();

      const parsed = registry.parse('unknown arg1');

      expect(parsed.command).to.be.null;
      expect(parsed.commandName).to.equal('unknown');
      expect(parsed.args).to.deep.equal(['arg1']);
    });

    it('should handle empty command', () => {
      const registry = new CommandRegistry();

      const parsed = registry.parse('');

      expect(parsed.command).to.be.null;
      expect(parsed.commandName).to.equal('');
      expect(parsed.args).to.deep.equal([]);
    });

    it('should parse command with JSON argument (backward compatibility)', () => {
      const registry = new CommandRegistry();
      const command = new TestCommand();
      command.name = 'createPlayer';
      registry.register(command);

      const parsed = registry.parse('createPlayer player1 {"name": "test", "steamId": "123"}');

      expect(parsed.command).to.equal(command);
      expect(parsed.commandName).to.equal('createPlayer');
      expect(parsed.args).to.have.lengthOf(2);
      expect(parsed.args[0]).to.equal('player1');
      expect(parsed.args[1]).to.equal('{"name": "test", "steamId": "123"}');
    });

    it('should parse command with JSON as only argument', () => {
      const registry = new CommandRegistry();
      const command = new TestCommand();
      command.name = 'config';
      registry.register(command);

      const parsed = registry.parse('config {"setting": "value"}');

      expect(parsed.command).to.equal(command);
      expect(parsed.args).to.have.lengthOf(1);
      expect(parsed.args[0]).to.equal('{"setting": "value"}');
    });
  });

  describe('Command Suggestions', () => {
    it('should provide command suggestions', () => {
      const registry = new CommandRegistry();

      const command1 = new TestCommand();
      command1.name = 'startSimulation';

      const command2 = new TestCommand();
      command2.name = 'stopSimulation';

      const command3 = new TestCommand();
      command3.name = 'help';

      registry.registerAll([command1, command2, command3]);

      const suggestions = registry.getSuggestions('st');
      expect(suggestions).to.include('startsimulation');
      expect(suggestions).to.include('stopsimulation');
      expect(suggestions).to.not.include('help');
    });

    it('should include alias suggestions', () => {
      const registry = new CommandRegistry();
      const command = new TestCommand();
      command.name = 'connectAll';
      command.aliases = ['ca'];
      registry.register(command);

      const suggestions = registry.getSuggestions('c');
      expect(suggestions).to.include('connectall');
      expect(suggestions).to.include('ca (connectall)');
    });
  });

  describe('Command Retrieval', () => {
    it('should get all command names including aliases', () => {
      const registry = new CommandRegistry();
      const command = new TestCommand();
      registry.register(command);

      const names = registry.getAllNames();
      expect(names).to.include('test');
      expect(names).to.include('t');
      expect(names).to.include('tst');
    });
  });
});
