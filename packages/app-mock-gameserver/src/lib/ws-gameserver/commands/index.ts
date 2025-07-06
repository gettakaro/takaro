// Export types and registry
export * from './types.js';
export { CommandRegistry } from './registry.js';

// Export all commands
export * from './system/index.js';
export * from './player/index.js';
export * from './simulation/index.js';

// Import all command classes for easy registration
import { VersionCommand, SayCommand, HelpCommand } from './system/index.js';
import {
  ConnectAllCommand,
  DisconnectAllCommand,
  BanCommand,
  UnbanCommand,
  CreatePlayerCommand,
  SetPlayerDataCommand,
} from './player/index.js';
import { StartSimulationCommand, StopSimulationCommand } from './simulation/index.js';
import { ICommand } from './types.js';

/**
 * Get all available commands for registration
 */
export function getAllCommands(): ICommand[] {
  return [
    // System commands
    new VersionCommand(),
    new SayCommand(),
    new HelpCommand(),

    // Player commands
    new ConnectAllCommand(),
    new DisconnectAllCommand(),
    new BanCommand(),
    new UnbanCommand(),
    new CreatePlayerCommand(),
    new SetPlayerDataCommand(),

    // Simulation commands
    new StartSimulationCommand(),
    new StopSimulationCommand(),
  ];
}
