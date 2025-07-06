import { CommandOutput } from '@takaro/gameserver';
import { GameServer } from '../gameserver.js';
import { GameDataHandler } from '../DataHandler.js';
import { ActivitySimulator } from '../ActivitySimulator.js';
import { Logger } from '@takaro/util';

/**
 * Context passed to command execution
 */
export interface CommandContext {
  gameServer: GameServer;
  dataHandler: GameDataHandler;
  activitySimulator: ActivitySimulator;
  log: Logger;
  commandRegistry?: any; // For help command access
}

/**
 * Result of command validation
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Interface for all commands
 */
export interface ICommand {
  /**
   * The primary name of the command
   */
  name: string;

  /**
   * A brief description of what the command does
   */
  description: string;

  /**
   * Alternative names for the command
   */
  aliases?: string[];

  /**
   * Usage pattern for the command
   */
  usage: string;

  /**
   * Example usages of the command
   */
  examples?: string[];

  /**
   * Execute the command
   */
  execute(args: string[], context: CommandContext): Promise<CommandOutput>;

  /**
   * Validate command arguments before execution
   */
  validate?(args: string[]): ValidationResult;
}

/**
 * Base class for commands with common functionality
 */
export abstract class BaseCommand implements ICommand {
  abstract name: string;
  abstract description: string;
  abstract usage: string;
  aliases?: string[];
  examples?: string[];

  abstract execute(args: string[], context: CommandContext): Promise<CommandOutput>;

  /**
   * Default validation - can be overridden by subclasses
   */
  validate(_args: string[]): ValidationResult {
    return { valid: true };
  }

  /**
   * Helper to create a success response
   */
  protected success(message: string): CommandOutput {
    return new CommandOutput({
      rawResult: message,
      success: true,
    });
  }

  /**
   * Helper to create an error response
   */
  protected error(message: string): CommandOutput {
    return new CommandOutput({
      rawResult: message,
      success: false,
    });
  }

  /**
   * Parse a JSON argument safely
   */
  protected parseJson(jsonString: string): { data: any; error?: string } {
    try {
      const data = JSON.parse(jsonString);
      return { data };
    } catch (e) {
      return {
        data: null,
        error: e instanceof Error ? e.message : 'Invalid JSON',
      };
    }
  }

  /**
   * Join args starting from a specific index (useful for multi-word arguments)
   */
  protected joinArgs(args: string[], startIndex: number = 0): string {
    return args.slice(startIndex).join(' ');
  }
}
