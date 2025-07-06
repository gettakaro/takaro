import { BaseCommand, CommandContext } from '../types.js';
import { CommandOutput } from '@takaro/gameserver';
import { EventPlayerDisconnected, GameEvents } from '@takaro/modules';

export class DisconnectAllCommand extends BaseCommand {
  name = 'disconnectAll';
  description = 'Disconnect all online players from the server';
  usage = 'disconnectAll';
  aliases = ['da', 'disconnectall', 'dc'];

  async execute(args: string[], context: CommandContext): Promise<CommandOutput> {
    try {
      const players = await context.gameServer.getPlayers();

      await Promise.all(
        players.map(async (p) => {
          await context.dataHandler.setOnlineStatus(p.gameId, false);
          context.gameServer.sendEvent(
            GameEvents.PLAYER_DISCONNECTED,
            new EventPlayerDisconnected({
              player: p,
              msg: 'Player disconnected',
              type: GameEvents.PLAYER_DISCONNECTED,
            }),
          );
        }),
      );

      return this.success(`Disconnected all players (${players.length} total)`);
    } catch (error) {
      context.log.error('Error disconnecting all players:', error);
      return this.error(
        `Failed to disconnect all players: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
