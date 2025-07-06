import { BaseCommand, CommandContext } from '../types.js';
import { CommandOutput } from '@takaro/gameserver';
import { EventPlayerConnected, GameEvents } from '@takaro/modules';

export class ConnectAllCommand extends BaseCommand {
  name = 'connectAll';
  description = 'Connect all known players to the server';
  usage = 'connectAll';
  aliases = ['ca', 'connectall'];

  async execute(args: string[], context: CommandContext): Promise<CommandOutput> {
    try {
      const players = await context.dataHandler.getAllPlayers();

      await Promise.all(
        players.map(async (p) => {
          await context.dataHandler.setOnlineStatus(p.player.gameId, true);
          context.gameServer.sendEvent(
            GameEvents.PLAYER_CONNECTED,
            new EventPlayerConnected({
              player: p.player,
              msg: 'Player connected',
              type: GameEvents.PLAYER_CONNECTED,
            }),
          );
        }),
      );

      return this.success(`Connected all players (${players.length} total)`);
    } catch (error) {
      context.log.error('Error connecting all players:', error);
      return this.error(`Failed to connect all players: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
