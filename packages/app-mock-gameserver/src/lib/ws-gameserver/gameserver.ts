import {
  EventLogLine,
  EventPayload,
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
import { GAME_ITEMS, GAME_ENTITIES } from './GameContent.js';
import { getRandomPublicIP } from './IpGenerator.js';
import { PartialDeep } from 'type-fest/index.js';
import { readFile } from 'fs/promises';
import path from 'path';
import { CommandRegistry, getAllCommands, CommandContext } from './commands/index.js';

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
  private commandRegistry: CommandRegistry;

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

    // Initialize command registry
    this.commandRegistry = new CommandRegistry();
    this.commandRegistry.registerAll(getAllCommands());
    this.log.info(`Registered ${this.commandRegistry.getAll().length} commands`);
  }

  async init() {
    this.setupMessageHandlers();

    // Set up WebSocket connection with proper error handling
    await this.connectToServer();

    await this.dataHandler.init();
    await this.createInitPlayers();

    // Restore simulation state after all initialization is complete
    await this.restoreSimulationState();
  }

  private async connectToServer(timeoutMs: number = 120000): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let isResolved = false;

      // Set up timeout for initial connection
      const connectionTimeout = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          this.log.warn('Initial connection timeout reached, but continuing with reconnection attempts');
          resolve(); // Don't reject, allow the app to continue running
        }
      }, timeoutMs);

      // Handle successful connection and identification
      const onConnected = async () => {
        try {
          this.log.info('Connected to WebSocket server');
          this.log.info(`Gameserver identity is ${this.serverId}`);

          const identifyListener = (message: any) => {
            if (message.type !== 'identifyResponse') return;
            if (message.payload.error) {
              this.log.error('Failed to identify with server:', message.payload.error);
              this.wsClient.removeListener('message', identifyListener);

              if (!isResolved) {
                isResolved = true;
                clearTimeout(connectionTimeout);
                // Handle error objects properly - extract message and name
                const errorObj = message.payload.error;
                const error = new Error(errorObj.message || errorObj);
                error.name = errorObj.name || 'BadRequestError';
                reject(error);
              }
              return;
            }

            this.log.info('Successfully identified with the server');
            this.wsClient.removeListener('message', identifyListener);

            if (!isResolved) {
              isResolved = true;
              clearTimeout(connectionTimeout);
              resolve();
            }
          };

          this.wsClient.on('message', identifyListener);

          this.wsClient.send({
            type: 'identify',
            payload: {
              identityToken: this.serverId,
              registrationToken: this.config.mockserver.registrationToken,
            },
          });
        } catch (error) {
          this.log.error('Error during identification process:', error);
        }
      };

      // Handle connection failures
      const onMaxReconnectReached = () => {
        this.log.warn('Max reconnection attempts reached, will retry after delay');
        // Reset and try again after a longer delay
        setTimeout(() => {
          this.wsClient.reconnect();
        }, 30000);
      };

      const onError = (error: Error) => {
        this.log.error('WebSocket connection error:', error);
        // Don't reject here, let the reconnection logic handle it
      };

      // Set up event listeners
      this.wsClient.on('connected', onConnected);
      this.wsClient.on('maxReconnectAttemptsReached', onMaxReconnectReached);
      this.wsClient.on('error', onError);

      // Clean up listeners when resolved
      const cleanup = () => {
        this.wsClient.removeListener('connected', onConnected);
        this.wsClient.removeListener('maxReconnectAttemptsReached', onMaxReconnectReached);
        this.wsClient.removeListener('error', onError);
      };

      // Clean up on resolution or rejection
      const originalResolve = resolve;
      const originalReject = reject;
      resolve = (...args) => {
        cleanup();
        originalResolve(...args);
      };
      reject = (...args) => {
        cleanup();
        originalReject(...args);
      };
    });
  }

  async shutdown() {
    this.wsClient.disconnect();
    return Promise.resolve();
  }

  private async restoreSimulationState(): Promise<void> {
    try {
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
      // Use simple sequential gameIds starting from existing player count
      const gameId = (existingPlayers.length + i).toString();
      const player = new IGamePlayer({
        gameId,
        name: faker.internet.userName(),
        epicOnlineServicesId: faker.string.alphanumeric(16),
        steamId: faker.string.alphanumeric(16),
        xboxLiveId: faker.string.alphanumeric(16),
        ip: getRandomPublicIP(),
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

  public sendEvent(type: GameEventTypes, data: EventPayload) {
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

      const { command, commandName, args } = this.commandRegistry.parse(rawCommand);

      if (!command) {
        const suggestions = this.commandRegistry.getSuggestions(commandName);
        const suggestionText = suggestions.length > 0 ? `\nDid you mean: ${suggestions.slice(0, 3).join(', ')}` : '';

        return new CommandOutput({
          rawResult: `Unknown command: ${commandName}. Use 'help' for available commands.${suggestionText}`,
          success: false,
        });
      }

      // Validate command arguments
      if (command.validate) {
        const validation = command.validate(args);
        if (!validation.valid) {
          return new CommandOutput({
            rawResult: validation.error || 'Invalid command arguments',
            success: false,
          });
        }
      }

      // Create command context
      const context: CommandContext = {
        gameServer: this,
        dataHandler: this.dataHandler,
        activitySimulator: this.activitySimulator,
        log: this.log,
        commandRegistry: this.commandRegistry as any, // For help command
      };

      // Execute the command
      const result = await command.execute(args, context);

      this.sendLog(`${result.success ? '🟢' : '🔴'} Command executed: ${rawCommand}`);
      return result;
    } catch (error) {
      this.log.error(`Error executing console command: ${rawCommand}`, error);
      return new CommandOutput({
        rawResult: `Command execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
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
