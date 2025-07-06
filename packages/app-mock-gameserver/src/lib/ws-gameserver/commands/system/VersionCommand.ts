import { BaseCommand, CommandContext } from '../types.js';
import { CommandOutput } from '@takaro/gameserver';

export class VersionCommand extends BaseCommand {
  name = 'version';
  description = 'Display the mock game server version';
  usage = 'version';
  aliases = ['ver', 'v'];

  async execute(_args: string[], _context: CommandContext): Promise<CommandOutput> {
    return this.success('Mock game server v0.0.1');
  }
}
