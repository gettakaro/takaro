import { BaseCommand, CommandContext, ICommand } from '../types.js';
import { CommandOutput } from '@takaro/gameserver';

export class HelpCommand extends BaseCommand {
  name = 'help';
  description = 'Display help information for commands';
  usage = 'help [command]';
  examples = ['help', 'help ban', 'help startSimulation'];
  aliases = ['h', '?'];

  async execute(args: string[], context: CommandContext): Promise<CommandOutput> {
    // Get the command registry from the context
    // We'll need to add this to the context when we integrate
    const registry = (context as any).commandRegistry;

    if (!registry) {
      return this.error('Command registry not available');
    }

    // If a specific command is requested
    if (args.length > 0) {
      const commandName = args[0];
      const command = registry.get(commandName);

      if (!command) {
        return this.error(`Unknown command: ${commandName}`);
      }

      return this.success(this.formatCommandHelp(command));
    }

    // Otherwise, show all commands
    const commands = registry.getAll() as ICommand[];
    return this.success(this.formatAllCommands(commands));
  }

  private formatCommandHelp(command: ICommand): string {
    const lines: string[] = [];

    lines.push(`Command: ${command.name}`);
    lines.push(`Description: ${command.description}`);
    lines.push(`Usage: ${command.usage}`);

    if (command.aliases && command.aliases.length > 0) {
      lines.push(`Aliases: ${command.aliases.join(', ')}`);
    }

    if (command.examples && command.examples.length > 0) {
      lines.push('Examples:');
      command.examples.forEach((example) => {
        lines.push(`  ${example}`);
      });
    }

    return lines.join('\n');
  }

  private formatAllCommands(commands: ICommand[]): string {
    const lines: string[] = [];
    lines.push('Available commands:');
    lines.push('');

    // Group commands by category based on their module path
    const grouped = this.groupCommands(commands);

    for (const [category, cmds] of Object.entries(grouped)) {
      lines.push(`${category}:`);
      cmds.forEach((cmd) => {
        const aliases = cmd.aliases && cmd.aliases.length > 0 ? ` (aliases: ${cmd.aliases.join(', ')})` : '';
        lines.push(`  ${cmd.name.padEnd(20)} ${cmd.description}${aliases}`);
      });
      lines.push('');
    }

    lines.push('Use "help <command>" for detailed information about a specific command.');

    return lines.join('\n');
  }

  private groupCommands(commands: ICommand[]): Record<string, ICommand[]> {
    const groups: Record<string, ICommand[]> = {
      System: [],
      'Player Management': [],
      Simulation: [],
      Debug: [],
      Other: [],
    };

    for (const cmd of commands) {
      // Determine category based on command name patterns
      if (['version', 'help', 'say'].includes(cmd.name)) {
        groups['System'].push(cmd);
      } else if (cmd.name.includes('player') || ['ban', 'unban', 'connectAll', 'disconnectAll'].includes(cmd.name)) {
        groups['Player Management'].push(cmd);
      } else if (cmd.name.includes('simulation') || cmd.name.includes('Simulation')) {
        groups['Simulation'].push(cmd);
      } else if (['triggerKill', 'testInventory', 'playerPersistenceCheck', 'populationStats'].includes(cmd.name)) {
        groups['Debug'].push(cmd);
      } else {
        groups['Other'].push(cmd);
      }
    }

    // Remove empty groups
    for (const key of Object.keys(groups)) {
      if (groups[key].length === 0) {
        delete groups[key];
      }
    }

    return groups;
  }
}
