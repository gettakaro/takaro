import { BaseCommand, CommandContext, ValidationResult } from '../types.js';
import { CommandOutput, BanDTO, IPlayerReferenceDTO } from '@takaro/gameserver';

export class BanCommand extends BaseCommand {
  name = 'ban';
  description = 'Ban a player from the server';
  usage = 'ban <playerId> [reason]';
  examples = ['ban player123 "Cheating"', 'ban player456'];

  async execute(args: string[], context: CommandContext): Promise<CommandOutput> {
    const playerId = args[0];
    const reason = this.joinArgs(args, 1) || 'No reason provided';

    try {
      await context.gameServer.banPlayer(
        new BanDTO({
          player: new IPlayerReferenceDTO({ gameId: playerId }),
          reason,
        }),
      );

      return this.success(`Banned player ${playerId} with reason: ${reason}`);
    } catch (error) {
      context.log.error(`Error banning player ${playerId}:`, error);
      return this.error(`Failed to ban player: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  validate(args: string[]): ValidationResult {
    if (args.length === 0) {
      return {
        valid: false,
        error: 'Player ID is required. Usage: ban <playerId> [reason]',
      };
    }
    return { valid: true };
  }
}
