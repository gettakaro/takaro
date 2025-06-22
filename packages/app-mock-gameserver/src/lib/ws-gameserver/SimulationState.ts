import { logger } from '@takaro/util';

export interface EventFrequency {
  frequency: number; // 0-100 frequency value
  enabled: boolean; // Whether this event type is active
}

export interface SimulationConfig {
  chatMessage: EventFrequency;
  playerMovement: EventFrequency;
  connection: EventFrequency;
  death: EventFrequency;
  kill: EventFrequency;
  itemInteraction: EventFrequency;
}

// Base interval ranges for each event type (in milliseconds)
export const BASE_INTERVALS = {
  chatMessage: { min: 3000, max: 60000 }, // 3s to 1min
  playerMovement: { min: 2000, max: 20000 }, // 2s to 20s
  connection: { min: 10000, max: 30000 }, // 10s to 30s (faster for testing)
  death: { min: 15000, max: 120000 }, // 15s to 2min
  kill: { min: 10000, max: 90000 }, // 10s to 1.5min
  itemInteraction: { min: 5000, max: 60000 }, // 5s to 1min
};

// User-friendly event type names for console commands
export const EVENT_TYPE_NAMES: Record<string, keyof SimulationConfig> = {
  chat: 'chatMessage',
  movement: 'playerMovement',
  connection: 'connection',
  death: 'death',
  kill: 'kill',
  items: 'itemInteraction',
};

export const DEFAULT_FREQUENCY = 50; // Default to 50% frequency

export const DEFAULT_SIMULATION_CONFIG: SimulationConfig = {
  chatMessage: {
    frequency: DEFAULT_FREQUENCY,
    enabled: true,
  },
  playerMovement: {
    frequency: DEFAULT_FREQUENCY,
    enabled: true,
  },
  connection: {
    frequency: DEFAULT_FREQUENCY,
    enabled: true,
  },
  death: {
    frequency: DEFAULT_FREQUENCY,
    enabled: true,
  },
  kill: {
    frequency: DEFAULT_FREQUENCY,
    enabled: true,
  },
  itemInteraction: {
    frequency: DEFAULT_FREQUENCY,
    enabled: true,
  },
};

export class SimulationState {
  private log = logger('SimulationState');
  private isRunning: boolean = false;
  private config: SimulationConfig;
  private startedAt?: Date;
  private stoppedAt?: Date;

  constructor(initialConfig?: Partial<SimulationConfig>) {
    this.config = this.mergeConfig(DEFAULT_SIMULATION_CONFIG, initialConfig);
    this.log.debug('SimulationState initialized', { config: this.config });
  }

  /**
   * Start the simulation
   */
  start(): void {
    if (this.isRunning) {
      this.log.warn('Attempted to start simulation that is already running');
      return;
    }

    this.isRunning = true;
    this.startedAt = new Date();
    this.stoppedAt = undefined;

    this.log.info('Simulation state changed to active', {
      startedAt: this.startedAt.toISOString(),
    });
  }

  /**
   * Stop the simulation
   */
  stop(): void {
    if (!this.isRunning) {
      this.log.warn('Attempted to stop simulation that is not running');
      return;
    }

    this.isRunning = false;
    this.stoppedAt = new Date();

    const duration = this.startedAt ? this.stoppedAt.getTime() - this.startedAt.getTime() : 0;

    this.log.info('Simulation state changed to inactive', {
      stoppedAt: this.stoppedAt.toISOString(),
      durationMs: duration,
    });
  }

  /**
   * Check if simulation is currently active
   */
  isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Get current simulation configuration (immutable copy)
   */
  getConfig(): SimulationConfig {
    return this.deepClone(this.config);
  }

  /**
   * Update simulation configuration
   * Note: Changes only take effect on next start/restart
   */
  updateConfig(updates: Partial<SimulationConfig>): void {
    const oldConfig = this.deepClone(this.config);
    this.config = this.mergeConfig(this.config, updates);

    this.log.info('Simulation configuration updated', {
      oldConfig,
      newConfig: this.config,
      isRunning: this.isRunning,
    });

    if (this.isRunning) {
      this.log.warn('Configuration updated while simulation is running. Changes will take effect on restart.');
    }
  }

  /**
   * Reset configuration to defaults
   */
  resetConfig(): void {
    const oldConfig = this.deepClone(this.config);
    this.config = this.deepClone(DEFAULT_SIMULATION_CONFIG);

    this.log.info('Simulation configuration reset to defaults', {
      oldConfig,
      newConfig: this.config,
    });
  }

  /**
   * Get simulation statistics
   */
  getStats(): {
    isRunning: boolean;
    startedAt?: string;
    stoppedAt?: string;
    uptimeMs?: number;
    config: SimulationConfig;
  } {
    const now = new Date();
    const uptimeMs = this.isRunning && this.startedAt ? now.getTime() - this.startedAt.getTime() : undefined;

    return {
      isRunning: this.isRunning,
      startedAt: this.startedAt?.toISOString(),
      stoppedAt: this.stoppedAt?.toISOString(),
      uptimeMs,
      config: this.getConfig(),
    };
  }

  /**
   * Convert frequency (0-100) to interval in milliseconds
   */
  frequencyToInterval(
    frequency: number,
    eventType: keyof SimulationConfig,
  ): { minInterval: number; maxInterval: number } {
    const baseInterval = BASE_INTERVALS[eventType];
    if (!baseInterval) {
      this.log.error(`Unknown event type: ${eventType}`);
      return { minInterval: 60000, maxInterval: 120000 }; // Default fallback
    }

    // Frequency 0 = slowest (use max interval), 100 = fastest (use min interval)
    // Linear interpolation: frequency 100% = min interval, frequency 0% = max interval
    const range = baseInterval.max - baseInterval.min;
    const factor = (100 - frequency) / 100; // 0 at 100%, 1 at 0%

    // Calculate target interval and add some randomness around it
    const targetInterval = baseInterval.min + range * factor;
    const variation = targetInterval * 0.3; // 30% variation for randomness

    return {
      minInterval: Math.max(baseInterval.min, targetInterval - variation),
      maxInterval: Math.min(baseInterval.max, targetInterval + variation),
    };
  }

  /**
   * Set global frequency for all event types
   */
  setGlobalFrequency(frequency: number): void {
    if (frequency < 0 || frequency > 100) {
      this.log.error(`Invalid frequency: ${frequency}. Must be between 0 and 100.`);
      return;
    }

    Object.keys(this.config).forEach((eventType) => {
      const key = eventType as keyof SimulationConfig;
      this.config[key].frequency = frequency;
    });

    this.log.info(`Global simulation frequency set to ${frequency}%`);
  }

  /**
   * Set frequency for specific event type
   */
  setEventFrequency(eventType: keyof SimulationConfig, frequency: number): void {
    if (frequency < 0 || frequency > 100) {
      this.log.error(`Invalid frequency: ${frequency}. Must be between 0 and 100.`);
      return;
    }

    if (!(eventType in this.config)) {
      this.log.error(`Unknown event type: ${eventType}`);
      return;
    }

    this.config[eventType].frequency = frequency;
    this.log.info(`${eventType} frequency set to ${frequency}%`);
  }

  /**
   * Get all frequency values
   */
  getFrequencies(): Record<keyof SimulationConfig, number> {
    const frequencies: Partial<Record<keyof SimulationConfig, number>> = {};

    Object.entries(this.config).forEach(([key, value]) => {
      frequencies[key as keyof SimulationConfig] = value.frequency;
    });

    return frequencies as Record<keyof SimulationConfig, number>;
  }

  /**
   * Validate configuration
   */
  validateConfig(config: Partial<SimulationConfig>): string[] {
    const errors: string[] = [];

    Object.entries(config).forEach(([key, freq]) => {
      if (freq && typeof freq === 'object') {
        const { frequency, enabled } = freq as EventFrequency;

        if (typeof frequency === 'number' && (frequency < 0 || frequency > 100)) {
          errors.push(`${key}.frequency must be between 0 and 100`);
        }

        if (typeof enabled !== 'boolean' && enabled !== undefined) {
          errors.push(`${key}.enabled must be a boolean`);
        }
      }
    });

    return errors;
  }

  /**
   * Enable/disable specific event types
   */
  enableEventType(eventType: keyof SimulationConfig, enabled: boolean): void {
    if (!(eventType in this.config)) {
      this.log.error(`Unknown event type: ${eventType}`);
      return;
    }

    this.config[eventType].enabled = enabled;

    this.log.info(`Event type ${eventType} ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Deep clone an object
   */
  private deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Merge configuration objects
   */
  private mergeConfig(base: SimulationConfig, updates?: Partial<SimulationConfig>): SimulationConfig {
    if (!updates) return this.deepClone(base);

    const merged = this.deepClone(base);

    Object.entries(updates).forEach(([key, value]) => {
      if (key in merged && value !== undefined) {
        const eventKey = key as keyof SimulationConfig;
        merged[eventKey] = {
          ...merged[eventKey],
          ...value,
        };
      }
    });

    return merged;
  }
}
