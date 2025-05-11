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
  IGameServer,
  IItemDTO,
  IMessageOptsDTO,
  IPlayerReferenceDTO,
  MapInfoDTO,
  TakaroEmitter,
  TestReachabilityOutputDTO,
} from '@takaro/gameserver';
import { GameDataHandler } from './DataHandler.js';
import { PartialDeep } from 'type-fest/index.js';

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
  private serverId;
  private tickInterval: NodeJS.Timeout;

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
    executeConsoleCommand: async (args: { command: string }) => this.executeConsoleCommand(args.command),
    sendMessage: async (args: { message: string; opts: IMessageOptsDTO }) =>
      this.sendMessage(args.message, new IMessageOptsDTO(args.opts)),
    teleportPlayer: async (args: { player: IPlayerReferenceDTO; x: number; y: number; z: number }) =>
      this.teleportPlayer(args.player, args.x, args.y, args.z),
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
    this.tickInterval = setInterval(() => this.handleGameServerTick(), 10000);
  }

  private async handleGameServerTick() {
    try {
      const allPlayers = await this.dataHandler.getOnlinePlayers();
      if (allPlayers.length > 0) {
        this.wsClient.send({
          type: 'gameEvent',
          payload: {
            type: GameEvents.PLAYER_CONNECTED,
            data: new EventPlayerConnected({
              player: allPlayers[0].player,
            }),
          },
        });
      }
    } catch (error) {
      this.log.error('Error in game server tick:', error);
    }
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
    clearInterval(this.tickInterval);
    this.wsClient.disconnect();
    return Promise.resolve();
  }

  private async createInitPlayers() {
    const totalPlayersWanted = 10;
    const existingPlayers = await this.dataHandler.getOnlinePlayers();
    const totalToCreate = totalPlayersWanted - existingPlayers.length;
    if (totalToCreate <= 0) return;

    const playersToCreate = Array.from({ length: totalToCreate }, (_, i) => {
      const player = new IGamePlayer({
        gameId: i.toString(),
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
        },
        online: false,
      };

      return { player, meta };
    });

    try {
      await Promise.all(playersToCreate.map(({ player, meta }) => this.dataHandler.addPlayer(player, meta)));
      this.log.info(`Successfully created ${playersToCreate.length} mock players`);
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
      });
    } catch (error) {
      this.log.error(`Error getting player location for ${player.gameId}:`, error);
      return null;
    }
  }

  async getPlayerInventory(player: IPlayerReferenceDTO): Promise<IItemDTO[]> {
    try {
      return [
        new IItemDTO({
          code: 'wood',
          name: 'Wood',
          description: 'Wood is good',
        }),
        new IItemDTO({
          code: 'stone',
          name: 'Stone',
          description: 'Stone can get you stoned',
        }),
      ];
    } catch (error) {
      this.log.error(`Error getting inventory for player ${player.gameId}:`, error);
      return [];
    }
  }

  async giveItem(player: IPlayerReferenceDTO, item: string, amount: number, quality?: string): Promise<void> {
    try {
      this.log.info(`Giving ${amount} of ${item} (quality: ${quality || 'default'}) to player ${player.gameId}`);
      return Promise.resolve();
    } catch (error) {
      this.log.error(`Error giving item to player ${player.gameId}:`, error);
      throw error;
    }
  }

  async listItems(): Promise<IItemDTO[]> {
    try {
      return [
        new IItemDTO({
          code: 'wood',
          name: 'Wood',
          description: 'Wood is good',
        }),
        new IItemDTO({
          code: 'stone',
          name: 'Stone',
          description: 'Stone can get you stoned',
        }),
      ];
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

  async teleportPlayer(player: IPlayerReferenceDTO, x: number, y: number, z: number): Promise<void> {
    try {
      await this.dataHandler.updatePlayerPosition(player.gameId, { x, y, z });
      this.sendLog(`Teleported ${player.gameId} to ${x}, ${y}, ${z}`);
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

  async getMapTile(x: number, y: number, z: number): Promise<Buffer> {
    try {
      this.log.info(`Getting map tile at (${x}, ${y}, ${z})`);
      // Return an empty buffer as a placeholder
      return Buffer.from([]);
    } catch (error) {
      this.log.error(`Error getting map tile at (${x}, ${y}, ${z}):`, error);
      throw error;
    }
  }
  //#endregion
}
