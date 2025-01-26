import { EventPlayerConnected, GameEvents, IGamePlayer } from '@takaro/modules';
import { config } from '../../config.js';
import { WSClient } from './wsClient.js';
import { faker } from '@faker-js/faker';
import { logger } from '@takaro/util';
import { IPlayerReferenceDTO } from '@takaro/gameserver';
import { GameDataHandler } from './DataHandler.js';

interface ActionHandler {
  (args: any): Promise<any>;
}
interface IActionMap {
  [key: string]: ActionHandler;
}

export class GameServer {
  private wsClient = new WSClient(config.get('ws.url'));
  private log = logger('GameServer');
  private dataHandler: GameDataHandler;
  private serverId = config.get('mockserver.identityToken');
  private tickInterval: NodeJS.Timeout;

  private actionHandlers: IActionMap = {
    getPlayer: async (args: IPlayerReferenceDTO) => this.getPlayer(new IPlayerReferenceDTO(args)),
    getPlayers: async () => this.getPlayers(),
  };

  constructor() {
    this.dataHandler = new GameDataHandler(this.serverId);
    this.tickInterval = setInterval(() => this.handleGameServerTick(), 1000);
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
}
