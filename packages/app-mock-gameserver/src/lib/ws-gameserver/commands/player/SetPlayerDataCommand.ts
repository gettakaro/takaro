import { BaseCommand, CommandContext, ValidationResult } from '../types.js';
import { CommandOutput } from '@takaro/gameserver';

export class SetPlayerDataCommand extends BaseCommand {
  name = 'setPlayerData';
  description = 'Update player data with JSON object';
  usage = 'setPlayerData <gameId> <jsonData>';
  examples = [
    'setPlayerData player123 {"health":100,"armor":50}',
    'setPlayerData player456 {"position":{"x":100,"y":50,"z":200}}',
  ];
  aliases = ['spd', 'setdata'];

  async execute(args: string[], context: CommandContext): Promise<CommandOutput> {
    // Parse command: setPlayerData <gameId> {data}
    const match = this.parseCommandWithJson(args);
    if (!match) {
      return this.error('Invalid command format. Use: setPlayerData <gameId> {data}');
    }

    const { playerId, jsonString } = match;
    const parseResult = this.parseJson(jsonString);

    if (parseResult.error) {
      return this.error(`Failed to parse JSON data: ${parseResult.error}`);
    }

    try {
      await context.dataHandler.updatePlayerData(playerId, parseResult.data);
      return this.success(`Updated player ${playerId} data`);
    } catch (error) {
      context.log.error(`Error updating player data for ${playerId}:`, error);
      return this.error(`Error updating player data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  validate(args: string[]): ValidationResult {
    if (args.length < 2) {
      return {
        valid: false,
        error: 'Both gameId and JSON data are required. Usage: setPlayerData <gameId> {data}',
      };
    }
    return { valid: true };
  }

  private parseCommandWithJson(args: string[]): { playerId: string; jsonString: string } | null {
    if (args.length < 2) return null;

    const playerId = args[0];
    // Join the rest as it might contain spaces in the JSON
    const jsonString = args.slice(1).join(' ');

    return { playerId, jsonString };
  }
}
