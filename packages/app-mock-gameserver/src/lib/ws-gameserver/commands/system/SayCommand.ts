import { BaseCommand, CommandContext, ValidationResult } from '../types.js';
import { CommandOutput } from '@takaro/gameserver';
import { IMessageOptsDTO } from '@takaro/gameserver';

export class SayCommand extends BaseCommand {
  name = 'say';
  description = 'Send a message to all players';
  usage = 'say <message>';
  examples = ['say Hello everyone!', 'say Server restart in 5 minutes'];
  aliases = ['broadcast', 'msg'];

  async execute(args: string[], context: CommandContext): Promise<CommandOutput> {
    const message = this.joinArgs(args);

    await context.gameServer.sendMessage(message, new IMessageOptsDTO({}));

    return this.success(`Sent message: ${message}`);
  }

  validate(args: string[]): ValidationResult {
    if (args.length === 0) {
      return {
        valid: false,
        error: 'Message is required. Usage: say <message>',
      };
    }
    return { valid: true };
  }
}
