import { logger } from '@takaro/util';
import { GameDataHandler } from './DataHandler.js';
import { EventGenerator } from './EventGenerator.js';
import { PlayerMovementSimulator } from './PlayerMovementSimulator.js';
import { PlayerPopulationManager } from './PlayerPopulationManager.js';
import { SimulationState, SimulationConfig } from './SimulationState.js';

export interface ActivitySimulatorOptions {
  dataHandler: GameDataHandler;
  eventEmitter: (type: string, data: any) => Promise<void>;
  serverLogger: (message: string) => void;
  config?: Partial<SimulationConfig>;
}

export class ActivitySimulator {
  private log = logger('ActivitySimulator');
  private dataHandler: GameDataHandler;
  private eventEmitter: (type: string, data: any) => Promise<void>;
  private serverLogger: (message: string) => void;
  private state: SimulationState;
  private eventGenerator: EventGenerator;
  private movementSimulator: PlayerMovementSimulator;
  private populationManager: PlayerPopulationManager;
  private timers: Map<string, NodeJS.Timeout> = new Map();

  constructor(options: ActivitySimulatorOptions) {
    this.dataHandler = options.dataHandler;
    this.eventEmitter = options.eventEmitter;
    this.serverLogger = options.serverLogger;
    this.state = new SimulationState(options.config);
    this.eventGenerator = new EventGenerator();
    this.movementSimulator = new PlayerMovementSimulator(this.dataHandler);
    this.populationManager = new PlayerPopulationManager();
  }

  /**
   * Start the activity simulation system
   */
  async start(): Promise<void> {
    if (this.state.isActive()) {
      this.log.warn('Activity simulation is already running');
      return;
    }

    this.log.info('Starting activity simulation');
    this.state.start();

    // Save state to Redis
    await this.dataHandler.setSimulationState(true);
    await this.dataHandler.setSimulationConfig(this.state.getConfig());

    // Immediate server log feedback
    this.serverLogger('🚀 Activity simulation started - server logging enabled');

    // Start all simulation components
    await this.startChatMessageSimulation();
    await this.startPlayerMovementSimulation();
    await this.startConnectionSimulation();
    await this.startDeathSimulation();
    await this.startKillSimulation();
    await this.startItemInteractionSimulation();

    this.log.info('Activity simulation started successfully');

    // Send immediate test event to show the system is working
    this.serverLogger('🎯 Activity simulation is now generating events - watch for activity logs!');
  }

  /**
   * Stop the activity simulation system
   */
  async stop(): Promise<void> {
    if (!this.state.isActive()) {
      this.log.warn('Activity simulation is not running');
      return;
    }

    this.log.info('Stopping activity simulation');
    this.state.stop();

    // Save state to Redis
    await this.dataHandler.setSimulationState(false);

    // Clear all timers
    this.clearAllTimers();

    // Immediate server log feedback
    this.serverLogger('⏹️ Activity simulation stopped');

    this.log.info('Activity simulation stopped successfully');
  }

  /**
   * Check if simulation is currently active
   */
  isActive(): boolean {
    return this.state.isActive();
  }

  /**
   * Get current simulation configuration
   */
  getConfig(): SimulationConfig {
    return this.state.getConfig();
  }

  /**
   * Update simulation configuration
   */
  updateConfig(updates: Partial<SimulationConfig>): void {
    this.state.updateConfig(updates);
    this.log.info('Simulation configuration updated', { updates });
  }

  /**
   * Set global frequency for all event types
   */
  async setGlobalFrequency(frequency: number): Promise<void> {
    this.state.setGlobalFrequency(frequency);

    // Save config to Redis
    await this.dataHandler.setSimulationConfig(this.state.getConfig());

    // If simulation is running, restart to apply new frequencies
    if (this.state.isActive()) {
      this.log.info('Restarting simulation to apply new frequency settings');
      this.serverLogger(`🔄 Global frequency changed to ${frequency}% - restarting simulation`);
      await this.restart();
    } else {
      this.serverLogger(`🔄 Global frequency set to ${frequency}% (will apply when simulation starts)`);
    }
  }

  /**
   * Set frequency for specific event type
   */
  async setEventFrequency(eventType: keyof SimulationConfig, frequency: number): Promise<void> {
    this.state.setEventFrequency(eventType, frequency);

    // Save config to Redis
    await this.dataHandler.setSimulationConfig(this.state.getConfig());

    // If simulation is running, restart to apply new frequency
    if (this.state.isActive()) {
      this.log.info(`Restarting simulation to apply new ${eventType} frequency`);
      this.serverLogger(`🔄 ${eventType} frequency changed to ${frequency}% - restarting simulation`);
      await this.restart();
    } else {
      this.serverLogger(`🔄 ${eventType} frequency set to ${frequency}% (will apply when simulation starts)`);
    }
  }

  /**
   * Get current frequency settings
   */
  getFrequencies(): Record<keyof SimulationConfig, number> {
    return this.state.getFrequencies();
  }

  /**
   * Calculate intervals for given frequency and event type (for debugging)
   */
  calculateIntervals(
    frequency: number,
    eventType: keyof SimulationConfig,
  ): { minInterval: number; maxInterval: number } {
    return this.state.frequencyToInterval(frequency, eventType);
  }

  /**
   * Restart simulation with current settings
   */
  private async restart(): Promise<void> {
    await this.stop();
    await this.start();
  }

  /**
   * Start chat message simulation
   */
  private async startChatMessageSimulation(): Promise<void> {
    const config = this.state.getConfig().chatMessage;
    if (!config.enabled) return;

    const intervals = this.state.frequencyToInterval(config.frequency, 'chatMessage');

    this.scheduleRandomEvent(
      'chatMessage',
      async () => {
        if (!this.state.isActive()) return;

        try {
          const players = await this.dataHandler.getOnlinePlayers();
          if (players.length === 0) {
            this.serverLogger('⚠️ No online players available for chat simulation');
            return;
          }

          const chatEvent = this.eventGenerator.generateChatMessage(players);
          await this.eventEmitter('chat-message', chatEvent);
          this.log.debug('Generated chat message event', { player: chatEvent.player?.name });
          this.serverLogger(`🎮 Simulated chat message from ${chatEvent.player?.name}: ${chatEvent.msg}`);
        } catch (error) {
          this.log.error('Error generating chat message:', error);
        }
      },
      intervals.minInterval,
      intervals.maxInterval,
    );
  }

  /**
   * Start player movement simulation
   */
  private async startPlayerMovementSimulation(): Promise<void> {
    const config = this.state.getConfig().playerMovement;
    if (!config.enabled) return;

    const intervals = this.state.frequencyToInterval(config.frequency, 'playerMovement');

    this.scheduleRandomEvent(
      'playerMovement',
      async () => {
        if (!this.state.isActive()) return;

        try {
          const players = await this.dataHandler.getOnlinePlayers();
          if (players.length === 0) {
            this.serverLogger('⚠️ No online players available for movement simulation');
            return;
          }

          await this.movementSimulator.updateAllPlayerPositions();
          this.log.debug('Updated player positions');
          this.serverLogger(
            `🚶 Simulated player movement: Updated positions for ${players.length} online player${players.length === 1 ? '' : 's'}`,
          );
        } catch (error) {
          this.log.error('Error updating player positions:', error);
        }
      },
      intervals.minInterval,
      intervals.maxInterval,
    );
  }

  /**
   * Start connection/disconnection simulation
   */
  private async startConnectionSimulation(): Promise<void> {
    const config = this.state.getConfig().connection;
    if (!config.enabled) return;

    const intervals = this.state.frequencyToInterval(config.frequency, 'connection');

    this.scheduleRandomEvent(
      'connection',
      async () => {
        if (!this.state.isActive()) return;

        try {
          const players = await this.dataHandler.getAllPlayers();
          if (players.length === 0) {
            this.serverLogger('⚠️ No players available for connection simulation');
            return;
          }

          // Analyze current population vs target
          const onlineCount = players.filter((p) => p.meta.online).length;
          const populationStats = this.populationManager.analyzePopulation(onlineCount, players.length);

          // Debug log population decision
          this.log.info('🎯 Population analysis for connection event', {
            onlineCount,
            totalCount: players.length,
            currentPercentage: populationStats.currentPercentage,
            targetPercentage: populationStats.targetPercentage,
            bias: populationStats.bias,
            shouldConnect: populationStats.shouldConnect,
            timePeriod: this.populationManager.getCurrentTimePeriod(),
          });

          // Generate connection event with population bias
          const connectionEvent = this.eventGenerator.generateConnectionEvent(players, populationStats.shouldConnect);
          const isConnection = connectionEvent.type === 'player-connected';
          const playerName = connectionEvent.data.player?.name || 'Unknown Player';
          const playerId = connectionEvent.data.player?.gameId;

          if (!playerId) {
            this.log.error('Connection event generated without valid player ID');
            return;
          }

          // CRITICAL: Log what EventGenerator decided vs what we requested
          this.log.info('🔍 EventGenerator result', {
            requestedAction: populationStats.shouldConnect ? 'CONNECT' : 'DISCONNECT',
            generatedEventType: connectionEvent.type,
            interpretedAsConnection: isConnection,
            playerName,
            playerId,
          });

          // Validate that the action matches the intention
          if (populationStats.shouldConnect !== isConnection) {
            this.log.error('🚨 CRITICAL: Population bias mismatch - intended action differs from generated event', {
              intended: populationStats.shouldConnect ? 'CONNECT' : 'DISCONNECT',
              actual: isConnection ? 'CONNECT' : 'DISCONNECT',
              playerName,
              bias: populationStats.bias,
              eventType: connectionEvent.type,
            });
          }

          // Update player online status in Redis FIRST and track what we actually did
          await this.dataHandler.setOnlineStatus(playerId, isConnection);

          // Emit the connection event
          await this.eventEmitter(connectionEvent.type, connectionEvent.data);
          this.log.debug('Generated connection event', { type: connectionEvent.type, player: playerName });

          // Log based on what we ACTUALLY did (isConnection), not the event type
          const actionType = isConnection ? 'connected' : 'disconnected';
          const statusEmoji = isConnection ? '🟢' : '🔴';
          const newOnlineCount = isConnection ? onlineCount + 1 : onlineCount - 1;
          const timePeriod = this.populationManager.getCurrentTimePeriod();

          this.serverLogger(
            `${statusEmoji} Simulated connection: ${playerName} ${actionType} (${onlineCount}→${newOnlineCount}/${players.length}, ${populationStats.currentPercentage}%→${populationStats.targetPercentage}% target, ${timePeriod})`,
          );
        } catch (error) {
          this.log.error('Error generating connection event:', error);
          this.serverLogger('⚠️ Connection simulation error - check logs');
        }
      },
      intervals.minInterval,
      intervals.maxInterval,
    );
  }

  /**
   * Start player death simulation
   */
  private async startDeathSimulation(): Promise<void> {
    const config = this.state.getConfig().death;
    if (!config.enabled) return;

    const intervals = this.state.frequencyToInterval(config.frequency, 'death');

    this.scheduleRandomEvent(
      'death',
      async () => {
        if (!this.state.isActive()) return;

        try {
          const players = await this.dataHandler.getOnlinePlayers();
          if (players.length === 0) {
            this.serverLogger('⚠️ No online players available for death simulation');
            return;
          }

          const deathEvent = this.eventGenerator.generatePlayerDeath(players);
          await this.eventEmitter('player-death', deathEvent);
          this.log.debug('Generated player death event', { player: deathEvent.player.name });
          this.serverLogger(
            `💀 Simulated death: ${deathEvent.player.name} died${deathEvent.msg ? ` - ${deathEvent.msg}` : ''}`,
          );
        } catch (error) {
          this.log.error('Error generating death event:', error);
        }
      },
      intervals.minInterval,
      intervals.maxInterval,
    );
  }

  /**
   * Start entity kill simulation
   */
  private async startKillSimulation(): Promise<void> {
    const config = this.state.getConfig().kill;
    if (!config.enabled) return;

    const intervals = this.state.frequencyToInterval(config.frequency, 'kill');

    this.scheduleRandomEvent(
      'kill',
      async () => {
        if (!this.state.isActive()) return;

        try {
          const players = await this.dataHandler.getOnlinePlayers();
          if (players.length === 0) {
            this.serverLogger('⚠️ No online players available for kill simulation');
            return;
          }

          const killEvent = this.eventGenerator.generateEntityKill(players);
          await this.eventEmitter('entity-killed', killEvent);
          this.log.debug('Generated entity kill event', {
            player: killEvent.player.name,
            entity: killEvent.entity,
          });
          this.serverLogger(
            `⚔️ Simulated kill: ${killEvent.player.name} killed ${killEvent.entity}${killEvent.weapon ? ` with ${killEvent.weapon}` : ''}`,
          );
        } catch (error) {
          this.log.error('Error generating kill event:', error);
        }
      },
      intervals.minInterval,
      intervals.maxInterval,
    );
  }

  /**
   * Start item interaction simulation
   */
  private async startItemInteractionSimulation(): Promise<void> {
    const config = this.state.getConfig().itemInteraction;
    if (!config.enabled) return;

    const intervals = this.state.frequencyToInterval(config.frequency, 'itemInteraction');

    this.scheduleRandomEvent(
      'itemInteraction',
      async () => {
        if (!this.state.isActive()) return;

        try {
          const players = await this.dataHandler.getOnlinePlayers();
          if (players.length === 0) {
            this.serverLogger('⚠️ No online players available for item interaction simulation');
            return;
          }

          const logEvent = this.eventGenerator.generateItemInteraction(players);
          await this.eventEmitter('log', logEvent);
          this.log.debug('Generated item interaction event');
          this.serverLogger(`📦 Simulated item interaction: ${logEvent.msg}`);
        } catch (error) {
          this.log.error('Error generating item interaction:', error);
        }
      },
      intervals.minInterval,
      intervals.maxInterval,
    );
  }

  /**
   * Schedule a random event with variable timing
   */
  private scheduleRandomEvent(
    id: string,
    callback: () => Promise<void>,
    minInterval: number,
    maxInterval: number,
  ): void {
    const scheduleNext = () => {
      if (!this.state.isActive()) return;

      const delay = Math.random() * (maxInterval - minInterval) + minInterval;
      const timer = setTimeout(async () => {
        try {
          await callback();
        } catch (error) {
          this.log.error(`Error in ${id} simulation:`, error);
        }
        scheduleNext(); // Schedule next execution
      }, delay);

      this.timers.set(id, timer);
    };

    scheduleNext();
  }

  /**
   * Clear all timers
   */
  private clearAllTimers(): void {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
  }
}
