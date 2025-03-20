import { EventPlayerConnected, GameEvents, IGamePlayer, IPosition } from '@takaro/modules';
import { config } from '../../config.js';
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

interface ActionHandler {
  (args: any): Promise<any>;
}
interface IActionMap {
  [key: string]: ActionHandler;
}

export class GameServer implements IGameServer {
  private wsClient = new WSClient(config.get('ws.url'));
  private log = logger('GameServer');
  private dataHandler: GameDataHandler;
  private serverId = config.get('mockserver.identityToken');
  private tickInterval: NodeJS.Timeout;

  // Implement the connectionInfo property
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
    executeConsoleCommand: async (args: { rawCommand: string }) => this.executeConsoleCommand(args.rawCommand),
    sendMessage: async (args: { message: string; opts: IMessageOptsDTO }) =>
      this.sendMessage(args.message, new IMessageOptsDTO(args.opts)),
    teleportPlayer: async (args: { player: IPlayerReferenceDTO; x: number; y: number; z: number }) =>
      this.teleportPlayer(new IPlayerReferenceDTO(args.player), args.x, args.y, args.z),
    kickPlayer: async (args: { player: IPlayerReferenceDTO; reason: string }) =>
      this.kickPlayer(new IPlayerReferenceDTO(args.player), args.reason),
    banPlayer: async (args: BanDTO) => this.banPlayer(new BanDTO(args)),
    unbanPlayer: async (args: IPlayerReferenceDTO) => this.unbanPlayer(new IPlayerReferenceDTO(args)),
    listBans: async () => this.listBans(),
    getMapInfo: async () => this.getMapInfo(),
    getMapTile: async (args: { x: number; y: number; z: number }) => this.getMapTile(args.x, args.y, args.z),
  };

  constructor() {
    this.dataHandler = new GameDataHandler(this.serverId);
    this.tickInterval = setInterval(() => this.handleGameServerTick(), 10000);
  }

  private async handleGameServerTick() {
    try {
      const allPlayers = await this.dataHandler.getAllPlayers();
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
    return new Promise<void>(async (resolve) => {
      this.wsClient.on('connected', async () => {
        this.log.info('Connected to WebSocket server');
        this.log.info(`Gameserver identity is ${this.serverId}`);
        this.wsClient.send({
          type: 'identify',
          payload: {
            identityToken: this.serverId,
            registrationToken: config.get('mockserver.registrationToken'),
          },
        });

        resolve();
      });

      this.setupMessageHandlers();
      await this.dataHandler.init();
      await this.createInitPlayers();
    });
  }

  async shutdown() {
    clearInterval(this.tickInterval);
    this.wsClient.disconnect();
    return Promise.resolve();
  }

  private async createInitPlayers() {
    const playersToCreate = Array.from({ length: 10 }, (_, i) => {
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
        online: faker.datatype.boolean(),
      };

      return { player, meta };
    });

    try {
      await Promise.all(playersToCreate.map(({ player, meta }) => this.dataHandler.addPlayer(player, meta)));
      this.log.info('Successfully created mock players');
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

        const result = await handler(args);
        this.sendResponse(requestId, result);
      } catch (error) {
        this.log.error(`Error handling action ${action}:`, error);
        this.sendError(requestId, error instanceof Error ? error.message : 'Unknown error occurred');
      }
    });
  }

  //#region IGameServer
  getEventEmitter(): TakaroEmitter {
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
      const players = await this.dataHandler.getAllPlayers();
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

      return {
        x: playerData.meta.position.x,
        y: playerData.meta.position.y,
        z: playerData.meta.position.z,
      };
    } catch (error) {
      this.log.error(`Error getting player location for ${player.gameId}:`, error);
      return null;
    }
  }

  async getPlayerInventory(player: IPlayerReferenceDTO): Promise<IItemDTO[]> {
    try {
      // Mock inventory with random items
      return Array.from(
        { length: faker.number.int({ min: 1, max: 10 }) },
        (_, i) =>
          new IItemDTO({
            name: `Item ${i}`,
            code: `item_${i}`,
            description: faker.commerce.productDescription(),
            amount: faker.number.int({ min: 1, max: 100 }),
            quality: faker.helpers.arrayElement(['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary']),
          }),
      );
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
      // Mock list of available items
      return Array.from(
        { length: 20 },
        (_, i) =>
          new IItemDTO({
            name: `Game Item ${i}`,
            code: `game_item_${i}`,
            description: faker.commerce.productDescription(),
          }),
      );
    } catch (error) {
      this.log.error('Error listing items:', error);
      return [];
    }
  }

  async executeConsoleCommand(rawCommand: string): Promise<CommandOutput> {
    try {
      this.log.info(`Executing console command: ${rawCommand}`);
      return new CommandOutput({
        rawResult: `Executed command: ${rawCommand}`,
        success: true,
      });
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
      this.log.info(`Teleporting player ${player.gameId} to coordinates (${x}, ${y}, ${z})`);
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
      this.log.info(`Kicking player ${player.gameId} with reason: ${reason}`);
      return Promise.resolve();
    } catch (error) {
      this.log.error(`Error kicking player ${player.gameId}:`, error);
      throw error;
    }
  }

  async banPlayer(options: BanDTO): Promise<void> {
    try {
      this.log.info(
        `Banning player ${options.player.gameId} with reason: ${options.reason}, expires: ${options.expiresAt || 'never'}`,
      );
      return Promise.resolve();
    } catch (error) {
      this.log.error(`Error banning player ${options.player.gameId}:`, error);
      throw error;
    }
  }

  async unbanPlayer(player: IPlayerReferenceDTO): Promise<void> {
    try {
      this.log.info(`Unbanning player ${player.gameId}`);
      return Promise.resolve();
    } catch (error) {
      this.log.error(`Error unbanning player ${player.gameId}:`, error);
      throw error;
    }
  }

  async listBans(): Promise<BanDTO[]> {
    try {
      // Mock list of banned players
      return Array.from({ length: faker.number.int({ min: 0, max: 5 }) }, () => {
        const player = new IGamePlayer({
          gameId: faker.string.alphanumeric(8),
          name: faker.internet.userName(),
          steamId: faker.string.alphanumeric(16),
        });

        return new BanDTO({
          player,
          reason: faker.helpers.arrayElement(['Cheating', 'Harassment', 'Exploiting', 'Toxic behavior']),
          expiresAt: faker.helpers.arrayElement([faker.date.future().toISOString(), null]),
        });
      });
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
