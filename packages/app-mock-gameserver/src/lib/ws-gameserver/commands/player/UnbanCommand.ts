import { BaseCommand, CommandContext, ValidationResult } from '../types.js';
import { CommandOutput, IPlayerReferenceDTO } from '@takaro/gameserver';

export class UnbanCommand extends BaseCommand {
  name = 'unban';
  description = 'Unban a player from the server';
  usage = 'unban <playerId>';
  examples = ['unban player123'];

  async execute(args: string[], context: CommandContext): Promise<CommandOutput> {
    const playerId = args[0];

    try {
      await context.gameServer.unbanPlayer(new IPlayerReferenceDTO({ gameId: playerId }));

      return this.success(`Unbanned player ${playerId}`);
    } catch (error) {
      context.log.error(`Error unbanning player ${playerId}:`, error);
      return this.error(`Failed to unban player: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  validate(args: string[]): ValidationResult {
    if (args.length === 0) {
      return {
        valid: false,
        error: 'Player ID is required. Usage: unban <playerId>',
      };
    }
    return { valid: true };
  }
}
