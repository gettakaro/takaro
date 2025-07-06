import { ICommand } from './types.js';
import { logger } from '@takaro/util';

/**
 * Parsed command result
 */
export interface ParsedCommand {
  command: ICommand | null;
  commandName: string;
  args: string[];
}

/**
 * Registry for managing and executing commands
 */
export class CommandRegistry {
  private commands: Map<string, ICommand> = new Map();
  private aliases: Map<string, string> = new Map();
  private log = logger('CommandRegistry');

  /**
   * Register a command
   */
  register(command: ICommand): void {
    // Register primary name
    this.commands.set(command.name.toLowerCase(), command);
    this.log.debug(`Registered command: ${command.name}`);

    // Register aliases
    if (command.aliases) {
      for (const alias of command.aliases) {
        this.aliases.set(alias.toLowerCase(), command.name.toLowerCase());
        this.log.debug(`Registered alias: ${alias} -> ${command.name}`);
      }
    }
  }

  /**
   * Register multiple commands at once
   */
  registerAll(commands: ICommand[]): void {
    for (const command of commands) {
      this.register(command);
    }
  }

  /**
   * Get a command by name or alias
   */
  get(name: string): ICommand | undefined {
    const lowerName = name.toLowerCase();

    // Check direct command name
    const directCommand = this.commands.get(lowerName);
    if (directCommand) {
      return directCommand;
    }

    // Check aliases
    const actualName = this.aliases.get(lowerName);
    if (actualName) {
      return this.commands.get(actualName);
    }

    return undefined;
  }

  /**
   * Get all registered commands
   */
  getAll(): ICommand[] {
    return Array.from(this.commands.values());
  }

  /**
   * Get all command names (including aliases)
   */
  getAllNames(): string[] {
    const names = Array.from(this.commands.keys());
    const aliasNames = Array.from(this.aliases.keys());
    return [...names, ...aliasNames].sort();
  }

  /**
   * Parse a raw command string into command and arguments
   */
  parse(rawCommand: string): ParsedCommand {
    const trimmed = rawCommand.trim();
    if (!trimmed) {
      return { command: null, commandName: '', args: [] };
    }

    // Special handling for commands with JSON data (backward compatibility)
    // Check if command contains JSON object
    const jsonStart = trimmed.indexOf('{');
    if (jsonStart !== -1) {
      // Find the command name (first word)
      const firstSpace = trimmed.indexOf(' ');
      if (firstSpace !== -1 && firstSpace < jsonStart) {
        const commandName = trimmed.substring(0, firstSpace);
        const command = this.get(commandName);

        if (command) {
          // For known commands with JSON, split at first space before JSON
          const remainingText = trimmed.substring(firstSpace + 1);
          // Find where JSON actually starts in the remaining text
          const jsonStartInRemaining = remainingText.indexOf('{');

          if (jsonStartInRemaining > 0) {
            // There's text before the JSON (like player ID)
            const beforeJson = remainingText.substring(0, jsonStartInRemaining).trim();
            const jsonText = remainingText.substring(jsonStartInRemaining);
            return {
              command,
              commandName,
              args: [beforeJson, jsonText],
            };
          } else {
            // JSON starts immediately
            return {
              command,
              commandName,
              args: [remainingText],
            };
          }
        }
      }
    }

    // Standard parsing for non-JSON commands
    const parts = this.splitCommandLine(trimmed);
    const commandName = parts[0] || '';
    const args = parts.slice(1);

    const command = this.get(commandName);

    return {
      command: command || null,
      commandName,
      args,
    };
  }

  /**
   * Split command line respecting quoted strings
   */
  private splitCommandLine(line: string): string[] {
    const parts: string[] = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (!inQuotes && (char === '"' || char === "'")) {
        inQuotes = true;
        quoteChar = char;
      } else if (inQuotes && char === quoteChar) {
        inQuotes = false;
        quoteChar = '';
      } else if (!inQuotes && char === ' ') {
        if (current) {
          parts.push(current);
          current = '';
        }
      } else {
        current += char;
      }
    }

    if (current) {
      parts.push(current);
    }

    return parts;
  }

  /**
   * Get command suggestions for partial input (for future autocomplete)
   */
  getSuggestions(partial: string): string[] {
    const lowerPartial = partial.toLowerCase();
    const suggestions: string[] = [];

    // Add commands that start with the partial
    for (const name of this.commands.keys()) {
      if (name.startsWith(lowerPartial)) {
        suggestions.push(name);
      }
    }

    // Add aliases that start with the partial
    for (const [alias, commandName] of this.aliases.entries()) {
      if (alias.startsWith(lowerPartial)) {
        suggestions.push(`${alias} (${commandName})`);
      }
    }

    return suggestions.sort();
  }
}
