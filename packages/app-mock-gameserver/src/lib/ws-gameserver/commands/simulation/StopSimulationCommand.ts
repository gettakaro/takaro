import { BaseCommand, CommandContext } from '../types.js';
import { CommandOutput } from '@takaro/gameserver';

export class StopSimulationCommand extends BaseCommand {
  name = 'stopSimulation';
  description = 'Stop the activity simulation';
  usage = 'stopSimulation';
  aliases = ['stopsim', 'sim stop', 'simulation stop'];

  async execute(_args: string[], context: CommandContext): Promise<CommandOutput> {
    try {
      if (!context.activitySimulator.isActive()) {
        return this.error('Simulation is not running');
      }

      context.activitySimulator.stop();

      return this.success('Activity simulation stopped');
    } catch (error) {
      context.log.error('Error stopping simulation:', error);
      return this.error(`Failed to stop simulation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
