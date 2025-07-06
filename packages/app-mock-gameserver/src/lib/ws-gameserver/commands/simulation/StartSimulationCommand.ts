import { BaseCommand, CommandContext } from '../types.js';
import { CommandOutput } from '@takaro/gameserver';

export class StartSimulationCommand extends BaseCommand {
  name = 'startSimulation';
  description = 'Start the activity simulation';
  usage = 'startSimulation';
  aliases = ['startsim', 'sim start', 'simulation start'];

  async execute(_args: string[], context: CommandContext): Promise<CommandOutput> {
    try {
      if (context.activitySimulator.isActive()) {
        return this.error('Simulation is already running');
      }

      context.activitySimulator.start();

      const config = context.activitySimulator.getConfig();
      const eventTypes = Object.entries(config)
        .filter(([, eventConfig]) => eventConfig.enabled && eventConfig.frequency > 0)
        .map(([type]) => type)
        .join(', ');

      return this.success(`Activity simulation started\nActive events: ${eventTypes}`);
    } catch (error) {
      context.log.error('Error starting simulation:', error);
      return this.error(`Failed to start simulation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
