import {
  EventEntityKilled,
  EventLogLine,
  EventPayload,
  EventPlayerConnected,
  EventPlayerDisconnected,
  GameEvents,
  GameEventTypes,
  IGamePlayer,
  IPosition,
} from '@takaro/modules';
import { config, IMockServerConfig } from '../../config.js';
import { WSClient } from './wsClient.js';
import { faker } from '@faker-js/faker';
import { errors, logger } from '@takaro/util';
import {
  BanDTO,
  CommandOutput,
  IEntityDTO,
  IGameServer,
  IItemDTO,
  ILocationDTO,
  IMessageOptsDTO,
  IPlayerReferenceDTO,
  MapInfoDTO,
  TakaroEmitter,
  TestReachabilityOutputDTO,
} from '@takaro/gameserver';
import { GameDataHandler } from './DataHandler.js';
import { ActivitySimulator } from './ActivitySimulator.js';
import { SimulationConfig, EVENT_TYPE_NAMES } from './SimulationState.js';
import { GAME_ITEMS, GAME_ENTITIES } from './GameContent.js';
import { PartialDeep } from 'type-fest/index.js';
import { readFile } from 'fs/promises';
import path from 'path';

interface ActionHandler {
  (args: any): Promise<any>;
}
interface IActionMap {
  [key: string]: ActionHandler;
}

export class GameServer implements IGameServer {
  private config: IMockServerConfig;
  private wsClient;
  private log = logger('GameServer');
  private dataHandler: GameDataHandler;
  private activitySimulator: ActivitySimulator;
  private serverId;

  public connectionInfo: unknown = {};

  private actionHandlers: IActionMap = {
    getPlayer: async (args: IPlayerReferenceDTO) => this.getPlayer(new IPlayerReferenceDTO(args)),
    getPlayers: async () => this.getPlayers(),
    testReachability: async () => this.testReachability(),
    getPlayerLocation: async (args: IPlayerReferenceDTO) => this.getPlayerLocation(new IPlayerReferenceDTO(args)),
    getPlayerInventory: async (args: IPlayerReferenceDTO) => this.getPlayerInventory(new IPlayerReferenceDTO(args)),
    giveItem: async (args: { player: IPlayerReferenceDTO; item: string; amount: number; quality?: string }) =>
      this.giveItem(new IPlayerReferenceDTO(args.player), args.item, args.amount, args.quality),
    listItems: async () => this.listItems(),
    listEntities: async () => this.listEntities(),
    executeConsoleCommand: async (args: { command: string }) => this.executeConsoleCommand(args.command),
    sendMessage: async (args: { message: string; opts: IMessageOptsDTO }) =>
      this.sendMessage(args.message, new IMessageOptsDTO(args.opts)),
    teleportPlayer: async (args: {
      player: IPlayerReferenceDTO;
      x: number;
      y: number;
      z: number;
      dimension?: string;
    }) => this.teleportPlayer(args.player, args.x, args.y, args.z, args.dimension),
    kickPlayer: async (args: { player: IPlayerReferenceDTO; reason: string }) =>
      this.kickPlayer(new IPlayerReferenceDTO(args.player), args.reason),
    banPlayer: async (args: BanDTO) => this.banPlayer(new BanDTO(args)),
    unbanPlayer: async (args: IPlayerReferenceDTO) => this.unbanPlayer(new IPlayerReferenceDTO(args)),
    listBans: async () => this.listBans(),
    getMapInfo: async () => this.getMapInfo(),
    getMapTile: async (args: { x: number; y: number; z: number }) => this.getMapTile(args.x, args.y, args.z),
  };

  constructor(configOverrides: PartialDeep<IMockServerConfig> = {}) {
    this.config = { ...JSON.parse(config._config.toString()), ...configOverrides } as IMockServerConfig;
    this.serverId = this.config.mockserver.identityToken;
    this.wsClient = new WSClient(this.config.ws.url);
    this.dataHandler = new GameDataHandler(this.serverId);
    this.activitySimulator = new ActivitySimulator({
      dataHandler: this.dataHandler,
      eventEmitter: async (type: string, data: any) => this.sendEvent(type as GameEventTypes, data),
      serverLogger: (message: string) => this.sendLog(message),
    });

    // Restore simulation state after initialization
    this.restoreSimulationState();
  }

  async init() {
    // eslint-disable-next-line no-async-promise-executor
    const identifyPromise = new Promise<void>(async (resolve, reject) => {
      this.wsClient.on('connected', async () => {
        this.log.info('Connected to WebSocket server');
        this.log.info(`Gameserver identity is ${this.serverId}`);
        const identifyListener = (message: any) => {
          if (message.type !== 'identifyResponse') return;
          if (message.payload.error) return reject(message.payload.error);

          this.log.info('Successfully identified with the server');
          this.wsClient.removeListener('message', identifyListener);
          resolve();
        };

        this.wsClient.on('message', identifyListener);

        this.wsClient.send({
          type: 'identify',
          payload: {
            identityToken: this.serverId,
            registrationToken: this.config.mockserver.registrationToken,
          },
        });
      });
    });

    this.setupMessageHandlers();
    await identifyPromise;
    await this.dataHandler.init();
    await this.createInitPlayers();
  }

  async shutdown() {
    this.wsClient.disconnect();
    return Promise.resolve();
  }

  private async restoreSimulationState(): Promise<void> {
    try {
      await this.dataHandler.init();
      const savedState = await this.dataHandler.getSimulationState();

      if (savedState) {
        this.log.info('Found saved simulation state', savedState);

        // Apply saved config if available
        if (savedState.config) {
          this.activitySimulator.updateConfig(savedState.config);
        }

        // Start simulation if it was running before
        if (savedState.isRunning) {
          this.log.info('Restoring active simulation state');
          // Use setTimeout to ensure all initialization is complete
          setTimeout(async () => {
            await this.activitySimulator.start();
            this.sendLog('🔄 Activity simulation restored from previous state');
          }, 2000);
        }
      } else if (this.config.simulation.autoStart) {
        // Auto-start simulation if configured
        this.log.info('Auto-starting simulation based on configuration');
        setTimeout(async () => {
          await this.activitySimulator.start();
          this.sendLog('🚀 Activity simulation auto-started from configuration');
        }, 2000);
      }
    } catch (error) {
      this.log.error('Error restoring simulation state:', error);
    }
  }

  private async createInitPlayers() {
    const totalPlayersWanted = this.config.population.totalPlayers;
    const existingPlayers = await this.dataHandler.getAllPlayers();
    const totalToCreate = totalPlayersWanted - existingPlayers.length;

    this.log.info(
      `Player population check: wanted=${totalPlayersWanted}, existing=${existingPlayers.length}, toCreate=${totalToCreate}`,
    );

    if (totalToCreate <= 0) {
      this.log.info('No new players needed - using existing persisted players');
      return;
    }

    const dimensions = ['overworld', 'nether', 'end'];

    const playersToCreate = Array.from({ length: totalToCreate }, (_, i) => {
      // Generate unique gameId to avoid collisions with existing players
      const uniqueGameId = `${Date.now()}-${i}`;
      const player = new IGamePlayer({
        gameId: uniqueGameId,
        name: faker.internet.userName(),
        epicOnlineServicesId: faker.string.alphanumeric(16),
        steamId: faker.string.alphanumeric(16),
        xboxLiveId: faker.string.alphanumeric(16),
      });

      const meta = {
        position: {
          x: faker.number.int({ min: -1000, max: 1000 }),
          y: faker.number.int({ min: 0, max: 512 }),
          z: faker.number.int({ min: -1000, max: 1000 }),
          dimension: dimensions[faker.number.int({ min: 0, max: dimensions.length - 1 })],
        },
        online: false,
      };

      return { player, meta };
    });

    try {
      // Additional safeguard: ensure no gameId conflicts
      const existingGameIds = new Set(existingPlayers.map((p) => p.player.gameId));
      const conflictingPlayers = playersToCreate.filter(({ player }) => existingGameIds.has(player.gameId));

      if (conflictingPlayers.length > 0) {
        this.log.warn(`Detected ${conflictingPlayers.length} gameId conflicts - regenerating unique IDs`);
        conflictingPlayers.forEach(({ player }) => {
          player.gameId = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
        });
      }

      await Promise.all(
        playersToCreate.map(async ({ player, meta }) => {
          await this.dataHandler.addPlayer(player, meta);
          await this.dataHandler.initializePlayerInventory(player.gameId);
        }),
      );
      this.log.info(
        `Successfully created ${playersToCreate.length} new mock players with default inventory (total players now: ${totalPlayersWanted})`,
      );
    } catch (error) {
      this.log.error('Error creating players:', error);
    }
  }

  private sendResponse(requestId: string, payload: any) {
    this.wsClient.send({
      requestId,
      payload,
      type: 'response',
    });
  }

  private sendError(requestId: string, message: string) {
    this.wsClient.send({
      requestId,
      payload: { message },
      type: 'error',
    });
  }

  private sendEvent(type: GameEventTypes, data: EventPayload) {
    this.wsClient.send({
      type: 'gameEvent',
      payload: {
        type,
        data,
      },
    });
  }

  private sendLog(message: string) {
    this.log.info(message);
    this.wsClient.send({
      type: 'gameEvent',
      payload: {
        type: 'log',
        data: new EventLogLine({
          msg: message,
          type: GameEvents.LOG_LINE,
        }),
      },
    });
  }

  private async setupMessageHandlers() {
    this.wsClient.on('message', async (message) => {
      if (message.type !== 'request') return;

      const {
        requestId,
        payload: { action, args },
      } = message;

      try {
        const handler = this.actionHandlers[action];
        if (!handler) {
          throw new Error(`Unknown action requested: ${action}`);
        }

        const parsedArgs = JSON.parse(args);
        const result = await handler(parsedArgs);
        this.sendResponse(requestId, result);
      } catch (error) {
        this.log.error(`Error handling action ${action}:`, error);
        this.sendError(requestId, error instanceof Error ? error.message : 'Unknown error occurred');
      }
    });
  }

  //#region IGameServer
  getEventEmitter(): TakaroEmitter {
    // This is a relic from the legacy API. It's not used anymore with the new WS connection method.
    throw new errors.NotImplementedError();
  }

  async getPlayer(playerRef: IPlayerReferenceDTO): Promise<IGamePlayer | null> {
    try {
      const result = await this.dataHandler.getPlayer(playerRef);
      return result?.player ?? null;
    } catch (error) {
      this.log.error(`Error getting player ${playerRef.gameId}:`, error);
      return null;
    }
  }

  async getPlayers(): Promise<IGamePlayer[]> {
    try {
      const players = await this.dataHandler.getOnlinePlayers();
      return players.map((p) => p.player);
    } catch (error) {
      this.log.error('Error getting all players:', error);
      return [];
    }
  }

  async getPlayerLocation(player: IPlayerReferenceDTO): Promise<IPosition | null> {
    try {
      const playerData = await this.dataHandler.getPlayer(player);
      if (!playerData || !playerData.meta.position) return null;

      return new IPosition({
        x: playerData.meta.position.x,
        y: playerData.meta.position.y,
        z: playerData.meta.position.z,
        dimension: playerData.meta.position.dimension,
      });
    } catch (error) {
      this.log.error(`Error getting player location for ${player.gameId}:`, error);
      return null;
    }
  }

  async getPlayerInventory(player: IPlayerReferenceDTO): Promise<IItemDTO[]> {
    try {
      return await this.dataHandler.getPlayerInventory(player.gameId);
    } catch (error) {
      this.log.error(`Error getting inventory for player ${player.gameId}:`, error);
      return [];
    }
  }

  async giveItem(player: IPlayerReferenceDTO, item: string, amount: number, quality?: string): Promise<void> {
    try {
      await this.dataHandler.addItemToInventory(player.gameId, item, amount);
      this.log.info(`Gave ${amount}x ${item} (quality: ${quality || 'default'}) to player ${player.gameId}`);
    } catch (error) {
      this.log.error(`Error giving item to player ${player.gameId}:`, error);
      throw error;
    }
  }

  async listItems(): Promise<IItemDTO[]> {
    try {
      return GAME_ITEMS;
    } catch (error) {
      this.log.error('Error listing items:', error);
      return [];
    }
  }

  async executeConsoleCommand(rawCommand: string): Promise<CommandOutput> {
    try {
      this.log.info(`Executing console command: ${rawCommand}`);

      const output = new CommandOutput({
        rawResult: 'Unknown command (Command not implemented in mock game server)',
        success: false,
      });

      if (rawCommand === 'version') {
        output.rawResult = 'Mock game server v0.0.1';
        output.success = true;
      }

      if (rawCommand === 'connectAll') {
        const players = await this.dataHandler.getAllPlayers();
        await Promise.all(
          players.map(async (p) => {
            await this.dataHandler.setOnlineStatus(p.player.gameId, true);
            this.sendEvent(
              GameEvents.PLAYER_CONNECTED,
              new EventPlayerConnected({
                player: p.player,
                msg: 'Player connected',
                type: GameEvents.PLAYER_CONNECTED,
              }),
            );
          }),
        );
        output.rawResult = 'Connected all players';
        output.success = true;
      }

      if (rawCommand === 'disconnectAll') {
        const players = await this.getPlayers();
        await Promise.all(
          players.map(async (p) => {
            await this.dataHandler.setOnlineStatus(p.gameId, false);
            this.sendEvent(
              GameEvents.PLAYER_DISCONNECTED,
              new EventPlayerDisconnected({
                player: p,
                msg: 'Player disconnected',
                type: GameEvents.PLAYER_DISCONNECTED,
              }),
            );
          }),
        );
        output.rawResult = 'Disconnected all players';
        output.success = true;
      }

      if (rawCommand.startsWith('say')) {
        const message = rawCommand.replace('say ', '');
        await this.sendMessage(message, new IMessageOptsDTO({}));
        output.rawResult = `Sent message: ${message}`;
        output.success = true;
      }

      if (rawCommand.startsWith('ban')) {
        const [_, playerId, reason] = rawCommand.split(' ');
        await this.banPlayer(
          new BanDTO({
            player: new IPlayerReferenceDTO({ gameId: playerId }),
            reason,
          }),
        );
        output.rawResult = `Banned player ${playerId} with reason: ${reason}`;
        output.success = true;
      }

      if (rawCommand.startsWith('unban')) {
        const [_, playerId] = rawCommand.split(' ');
        await this.unbanPlayer(new IPlayerReferenceDTO({ gameId: playerId }));
        output.rawResult = `Unbanned player ${playerId}`;
        output.success = true;
      }

      if (rawCommand.startsWith('triggerKill')) {
        const [_, playerId] = rawCommand.split(' ');
        const player = await this.getPlayer(new IPlayerReferenceDTO({ gameId: playerId }));
        this.sendEvent(
          GameEvents.ENTITY_KILLED,
          new EventEntityKilled({
            entity: 'zombie',
            player,
            weapon: 'knife',
          }),
        );
        output.rawResult = `Triggered kill for player ${playerId}`;
        output.success = true;
      }

      if (rawCommand.startsWith('setPlayerData')) {
        try {
          // Parse command: setPlayerData <gameId> {data}
          const match = rawCommand.match(/^setPlayerData\s+(\S+)\s+(.+)$/);
          if (!match) {
            output.rawResult = 'Invalid command format. Use: setPlayerData <gameId> {data}';
            output.success = false;
          } else {
            const [_, playerId, dataJson] = match;
            try {
              const data = JSON.parse(dataJson);
              await this.dataHandler.updatePlayerData(playerId, data);
              output.rawResult = `Updated player ${playerId} data`;
              output.success = true;
            } catch (parseError) {
              output.rawResult = `Failed to parse JSON data: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`;
              output.success = false;
            }
          }
        } catch (error) {
          output.rawResult = `Error updating player data: ${error instanceof Error ? error.message : 'Unknown error'}`;
          output.success = false;
        }
      }

      if (rawCommand === 'startSimulation') {
        try {
          if (this.activitySimulator.isActive()) {
            output.rawResult = 'Activity simulation is already running';
            output.success = false;
          } else {
            await this.activitySimulator.start();
            output.rawResult = 'Activity simulation started successfully';
            output.success = true;
          }
        } catch (error) {
          output.rawResult = `Error starting simulation: ${error instanceof Error ? error.message : 'Unknown error'}`;
          output.success = false;
        }
      }

      if (rawCommand === 'stopSimulation') {
        try {
          if (!this.activitySimulator.isActive()) {
            output.rawResult = 'Activity simulation is not running';
            output.success = false;
          } else {
            await this.activitySimulator.stop();
            output.rawResult = 'Activity simulation stopped successfully';
            output.success = true;
          }
        } catch (error) {
          output.rawResult = `Error stopping simulation: ${error instanceof Error ? error.message : 'Unknown error'}`;
          output.success = false;
        }
      }

      if (rawCommand === 'simulationStatus') {
        try {
          const isActive = this.activitySimulator.isActive();
          const config = this.activitySimulator.getConfig();
          const frequencies = this.activitySimulator.getFrequencies();

          const eventDetails = Object.entries(config)
            .map(([key, eventConfig]) => {
              const freq = frequencies[key as keyof typeof frequencies];
              return `${key}: ${freq}% (${eventConfig.enabled ? 'enabled' : 'disabled'})`;
            })
            .join(', ');

          output.rawResult = `Simulation ${isActive ? 'ACTIVE' : 'INACTIVE'}. Events: ${eventDetails}`;
          output.success = true;
        } catch (error) {
          output.rawResult = `Error getting simulation status: ${error instanceof Error ? error.message : 'Unknown error'}`;
          output.success = false;
        }
      }

      if (rawCommand.startsWith('setSimulationFrequency')) {
        try {
          const parts = rawCommand.split(' ');
          if (parts.length !== 2) {
            output.rawResult = 'Usage: setSimulationFrequency <0-100>';
            output.success = false;
          } else {
            const frequency = parseInt(parts[1], 10);
            if (isNaN(frequency) || frequency < 0 || frequency > 100) {
              output.rawResult = 'Invalid frequency. Must be a number between 0 and 100.';
              output.success = false;
            } else {
              await this.activitySimulator.setGlobalFrequency(frequency);
              output.rawResult = `Global simulation frequency set to ${frequency}%`;
              output.success = true;
            }
          }
        } catch (error) {
          output.rawResult = `Error setting simulation frequency: ${error instanceof Error ? error.message : 'Unknown error'}`;
          output.success = false;
        }
      }

      if (rawCommand.startsWith('setSimulationEventFrequency')) {
        try {
          const parts = rawCommand.split(' ');
          if (parts.length !== 3) {
            output.rawResult = 'Usage: setSimulationEventFrequency <eventType> <0-100>';
            output.success = false;
          } else {
            const eventType = parts[1];
            const frequency = parseInt(parts[2], 10);

            if (isNaN(frequency) || frequency < 0 || frequency > 100) {
              output.rawResult = 'Invalid frequency. Must be a number between 0 and 100.';
              output.success = false;
            } else {
              // Use imported event type names mapping
              const internalEventType = EVENT_TYPE_NAMES[eventType] || eventType;

              if (
                !EVENT_TYPE_NAMES[eventType] &&
                !Object.keys(this.activitySimulator.getConfig()).includes(eventType)
              ) {
                output.rawResult = `Unknown event type: ${eventType}. Valid types: ${Object.keys(EVENT_TYPE_NAMES).join(', ')}`;
                output.success = false;
              } else {
                await this.activitySimulator.setEventFrequency(internalEventType as keyof SimulationConfig, frequency);
                output.rawResult = `${eventType} frequency set to ${frequency}%`;
                output.success = true;
              }
            }
          }
        } catch (error) {
          output.rawResult = `Error setting event frequency: ${error instanceof Error ? error.message : 'Unknown error'}`;
          output.success = false;
        }
      }

      if (rawCommand === 'getSimulationFrequency') {
        try {
          const frequencies = this.activitySimulator.getFrequencies();
          const isActive = this.activitySimulator.isActive();

          let result = `Simulation Frequencies (${isActive ? 'ACTIVE' : 'INACTIVE'}):\n`;

          // Map internal names to user-friendly names
          const displayNames: Record<string, string> = {
            chatMessage: 'Chat',
            playerMovement: 'Movement',
            connection: 'Connection',
            death: 'Death',
            kill: 'Kill',
            itemInteraction: 'Items',
          };

          Object.entries(frequencies).forEach(([key, value]) => {
            const displayName = displayNames[key] || key;
            result += `- ${displayName}: ${value}%\n`;
          });

          output.rawResult = result.trim();
          output.success = true;
        } catch (error) {
          output.rawResult = `Error getting simulation frequencies: ${error instanceof Error ? error.message : 'Unknown error'}`;
          output.success = false;
        }
      }

      if (rawCommand === 'simulationDebug') {
        try {
          const isActive = this.activitySimulator.isActive();
          const config = this.activitySimulator.getConfig();
          const onlinePlayers = await this.dataHandler.getOnlinePlayers();
          const allPlayers = await this.dataHandler.getAllPlayers();

          let result = '🔍 Simulation Debug Information\n';
          result += `Status: ${isActive ? 'ACTIVE ✅' : 'INACTIVE ❌'}\n`;
          result += `Online Players: ${onlinePlayers.length}\n`;
          result += `Total Players: ${allPlayers.length}\n\n`;

          result += 'Event Intervals (at current frequencies):\n';

          Object.entries(config).forEach(([eventType, eventConfig]) => {
            const intervals = this.activitySimulator.calculateIntervals(
              eventConfig.frequency,
              eventType as keyof SimulationConfig,
            );
            const minSec = Math.round(intervals.minInterval / 1000);
            const maxSec = Math.round(intervals.maxInterval / 1000);
            const status = eventConfig.enabled ? '✅' : '❌';

            result += `- ${eventType}: ${eventConfig.frequency}% ${status} (${minSec}-${maxSec}s)\n`;
          });

          if (onlinePlayers.length === 0) {
            // eslint-disable-next-line quotes
            result += "\n⚠️ Warning: No online players - most events won't fire";
          }

          output.rawResult = result.trim();
          output.success = true;
        } catch (error) {
          output.rawResult = `Error getting debug info: ${error instanceof Error ? error.message : 'Unknown error'}`;
          output.success = false;
        }
      }

      if (rawCommand.startsWith('testInventory')) {
        try {
          const [_, playerId] = rawCommand.split(' ');
          if (!playerId) {
            output.rawResult = 'Usage: testInventory <playerId>';
            output.success = false;
          } else {
            // Test inventory operations
            const currentInventory = await this.dataHandler.getPlayerInventory(playerId);
            let result = `Player ${playerId} inventory before: `;
            result += currentInventory.map((item) => `${item.code}(${item.name})`).join(', ') || 'empty';

            // Add an item
            await this.dataHandler.addItemToInventory(playerId, 'apple', 3);
            result += '\nAdded 3x apple';

            // Check inventory after
            const updatedInventory = await this.dataHandler.getPlayerInventory(playerId);
            result += `\nPlayer ${playerId} inventory after: `;
            result += updatedInventory.map((item) => `${item.code}(${item.name})`).join(', ') || 'empty';

            output.rawResult = result;
            output.success = true;
          }
        } catch (error) {
          output.rawResult = `Error testing inventory: ${error instanceof Error ? error.message : 'Unknown error'}`;
          output.success = false;
        }
      }

      if (rawCommand === 'playerPersistenceCheck') {
        try {
          const allPlayers = await this.dataHandler.getAllPlayers();
          const onlinePlayers = await this.dataHandler.getOnlinePlayers();

          let result = '🔍 Player Persistence Check\n';
          result += `Total players in Redis: ${allPlayers.length}\n`;
          result += `Online players: ${onlinePlayers.length}\n`;
          result += `Offline players: ${allPlayers.length - onlinePlayers.length}\n\n`;

          if (allPlayers.length > 0) {
            result += 'Sample player data:\n';
            const sample = allPlayers.slice(0, 3);
            sample.forEach((p, i) => {
              result += `${i + 1}. ${p.player.name} (ID: ${p.player.gameId}) - ${p.meta.online ? 'ONLINE' : 'OFFLINE'}\n`;
            });
          } else {
            result += 'No players found in Redis\n';
          }

          output.rawResult = result.trim();
          output.success = true;
        } catch (error) {
          output.rawResult = `Error checking persistence: ${error instanceof Error ? error.message : 'Unknown error'}`;
          output.success = false;
        }
      }

      if (rawCommand === 'populationStats') {
        try {
          const onlinePlayers = await this.dataHandler.getOnlinePlayers();
          const allPlayers = await this.dataHandler.getAllPlayers();
          const populationManager = new (await import('./PlayerPopulationManager.js')).PlayerPopulationManager();

          const populationStats = populationManager.analyzePopulation(onlinePlayers.length, allPlayers.length);
          const timePeriod = populationManager.getCurrentTimePeriod();

          let result = '📊 Population Statistics\n';
          result += `Current Time Period: ${timePeriod}\n`;
          result += `Online: ${populationStats.currentOnlineCount}/${populationStats.totalPlayerCount} (${populationStats.currentPercentage}%)\n`;
          result += `Target: ${populationStats.targetPercentage}%\n`;
          result += `Connection Bias: ${Math.round(populationStats.bias * 100)}% toward connecting\n`;
          result += `Next Action: ${populationStats.shouldConnect ? 'CONNECT' : 'DISCONNECT'}\n\n`;

          const hourlyTargets = [];
          for (let hour = 0; hour < 24; hour++) {
            const testDate = new Date();
            testDate.setHours(hour);
            const testManager = new (await import('./PlayerPopulationManager.js')).PlayerPopulationManager();
            // Temporarily override the current time for testing
            const originalGetHours = Date.prototype.getHours;
            Date.prototype.getHours = function () {
              return hour;
            };
            const target = testManager.getTargetOnlinePercentage();
            Date.prototype.getHours = originalGetHours;

            hourlyTargets.push(`${hour.toString().padStart(2, '0')}:00 - ${target}%`);
          }

          result += 'Hourly Target Schedule (Today):\n';
          result += hourlyTargets.join('\n');

          output.rawResult = result.trim();
          output.success = true;
        } catch (error) {
          output.rawResult = `Error getting population stats: ${error instanceof Error ? error.message : 'Unknown error'}`;
          output.success = false;
        }
      }

      this.sendLog(`${output.success ? '🟢' : '🔴'} Command executed: ${rawCommand}`);
      return output;
    } catch (error) {
      this.log.error(`Error executing console command: ${rawCommand}`, error);
      return new CommandOutput({
        rawResult: '',
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }

  async sendMessage(message: string, opts: IMessageOptsDTO): Promise<void> {
    try {
      if (opts.recipient) {
        this.log.info(`Sending DM to player ${opts.recipient.gameId}: ${message}`);
      } else {
        this.log.info(`Sending global message: ${message}`);
      }
      return Promise.resolve();
    } catch (error) {
      this.log.error('Error sending message:', error);
      throw error;
    }
  }

  async teleportPlayer(
    player: IPlayerReferenceDTO,
    x: number,
    y: number,
    z: number,
    dimension?: string,
  ): Promise<void> {
    try {
      // Use the provided dimension or keep the existing one
      const playerData = await this.dataHandler.getPlayer(player);
      const targetDimension = dimension || playerData?.meta.position.dimension;

      await this.dataHandler.updatePlayerPosition(player.gameId, { x, y, z, dimension: targetDimension });
      const dimensionMsg = targetDimension ? ` in dimension ${targetDimension}` : '';
      this.sendLog(`Teleported ${player.gameId} to ${x}, ${y}, ${z}${dimensionMsg}`);
      return Promise.resolve();
    } catch (error) {
      this.log.error(`Error teleporting player ${player.gameId}:`, error);
      throw error;
    }
  }

  async testReachability(): Promise<TestReachabilityOutputDTO> {
    return new TestReachabilityOutputDTO({
      connectable: true,
      latency: faker.number.int({ min: 10, max: 200 }),
    });
  }

  async kickPlayer(player: IPlayerReferenceDTO, reason: string): Promise<void> {
    try {
      await this.dataHandler.setOnlineStatus(player.gameId, false);
      this.sendEvent(
        GameEvents.PLAYER_DISCONNECTED,
        new EventPlayerDisconnected({
          player: await this.getPlayer(player),
          msg: reason,
          type: GameEvents.PLAYER_DISCONNECTED,
        }),
      );
      this.sendLog(`Kicked player ${player.gameId} with reason: ${reason}`);
      return Promise.resolve();
    } catch (error) {
      this.log.error(`Error kicking player ${player.gameId}:`, error);
      throw error;
    }
  }

  async banPlayer(options: BanDTO): Promise<void> {
    try {
      await this.dataHandler.banPlayer(options);
      this.sendEvent(
        GameEvents.PLAYER_DISCONNECTED,
        new EventPlayerDisconnected({
          player: await this.getPlayer(options.player),
          msg: options.reason,
          type: GameEvents.PLAYER_DISCONNECTED,
        }),
      );
      this.sendLog(`Banned player ${options.player.gameId} with reason: ${options.reason}`);
      return Promise.resolve();
    } catch (error) {
      this.log.error(`Error banning player ${options.player.gameId}:`, error);
      throw error;
    }
  }

  async unbanPlayer(player: IPlayerReferenceDTO): Promise<void> {
    try {
      await this.dataHandler.unbanPlayer(player);
      this.sendLog(`Unbanned player ${player.gameId}`);
      return Promise.resolve();
    } catch (error) {
      this.log.error(`Error unbanning player ${player.gameId}:`, error);
      throw error;
    }
  }

  async listBans(): Promise<BanDTO[]> {
    try {
      const bans = await this.dataHandler.listBans();
      return bans.map((ban) => new BanDTO(ban));
    } catch (error) {
      this.log.error('Error listing bans:', error);
      return [];
    }
  }

  async getMapInfo(): Promise<MapInfoDTO> {
    try {
      return new MapInfoDTO({
        enabled: true,
        mapBlockSize: 16,
        maxZoom: 5,
        mapSizeX: 16384,
        mapSizeY: 1024,
        mapSizeZ: 16384,
      });
    } catch (error) {
      this.log.error('Error getting map info:', error);
      throw error;
    }
  }

  async getMapTile(x: number, y: number, z: number): Promise<string> {
    try {
      this.log.info(`Getting map tile at (${x}, ${y}, ${z})`);
      // We transform the y coordinate to a letter in the range A-Z
      const yLetter = String.fromCharCode(65 + y);
      const tilesDir = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'map', 'tiles');
      const tilePath = path.join(tilesDir, `${yLetter}${x}.png`);
      console.log('Tile path', tilePath);
      console.log('Tile path', tilePath);
      console.log('Tile path', tilePath);
      console.log('Tile path', tilePath);
      console.log('Tile path', tilePath);
      console.log('Tile path', tilePath);
      const tileBuffer = await readFile(tilePath);
      if (!tileBuffer) return '';
      const base64 = tileBuffer.toString('base64');
      return base64;
    } catch (error) {
      this.log.error(`Error getting map tile at (${x}, ${y}, ${z}):`, error);
      throw error;
    }
  }

  async listEntities(): Promise<IEntityDTO[]> {
    try {
      return GAME_ENTITIES;
    } catch (error) {
      this.log.error('Error listing entities:', error);
      return [];
    }
  }

  async listLocations(): Promise<ILocationDTO[]> {
    return [];
  }
  //#endregion
}
