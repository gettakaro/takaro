import { errors, logger, TakaroDTO } from '@takaro/util';
import WebSocket, { WebSocketServer, RawData } from 'ws';
import { randomUUID } from 'crypto';
import { config } from '../config.js';
import { gameServerManager } from './GameServerManager.js';
import { IGamePlayer, IPosition } from '@takaro/modules';
import {
  BanDTO,
  CommandOutput,
  GameServerActions,
  IEntityDTO,
  IItemDTO,
  ILocationDTO,
  MapInfoDTO,
  TestReachabilityOutputDTO,
} from '@takaro/gameserver';
import { Counter, Gauge, Histogram } from 'prom-client';

export interface WebSocketMessage {
  type: string;
  payload: Record<string, unknown> | null;
  requestId?: string;
}

interface WebSocketClient extends WebSocket {
  isAlive?: boolean;
  id?: string;
}

class WSServer {
  private log = logger('WSServer');
  private wss: WebSocketServer;
  private pingInterval: NodeJS.Timeout;
  private clients: Map<string, WebSocketClient> = new Map();
  private servers: Map<string, WebSocketClient> = new Map();
  private WsToServerMap: Map<string, string> = new Map();
  private port: number;

  private metrics = {
    connections: new Gauge({
      name: 'takaro_ws_active_connections',
      help: 'Number of active WebSocket connections',
    }),

    messageCounter: new Counter({
      name: 'takaro_ws_messages_total',
      help: 'Total number of WebSocket messages processed',
      labelNames: ['type', 'status'],
    }),

    messageLatency: new Histogram({
      name: 'takaro_ws_message_processing_duration_seconds',
      help: 'Time taken to process WebSocket messages',
      labelNames: ['type'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
    }),

    requestLatency: new Histogram({
      name: 'takaro_ws_request_duration_seconds',
      help: 'Time taken for game server to respond to requests',
      labelNames: ['action'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 3, 5, 10],
    }),
    gameserverRequests: new Counter({
      name: 'takaro_ws_gameserver_requests_total',
      help: 'Total number of requests sent to game servers',
      labelNames: ['action'],
    }),
    errors: new Counter({
      name: 'takaro_ws_errors_total',
      help: 'Total number of WebSocket errors',
      labelNames: ['type', 'code'],
    }),
  };

  constructor(port: number) {
    this.port = port;
    this.wss = new WebSocketServer({ port });
    this.setupWebSocketServer();
    this.setupHeartbeat();
    this.log.info(`WebSocket server started on port ${port}`);
  }

  private setupWebSocketServer(): void {
    this.wss.on('connection', (ws: WebSocketClient) => {
      this.metrics.connections.inc();
      const clientId = this.generateClientId();
      ws.id = clientId;
      ws.isAlive = true;
      this.clients.set(clientId, ws);

      this.log.info(`Client connected: ${clientId}`);

      ws.on('pong', () => {
        ws.isAlive = true;
      });

      ws.on('message', (data: RawData) => {
        this.handleMessage(ws, data);
      });

      ws.on('close', () => {
        this.clients.delete(clientId);
        this.servers.delete(clientId);
        this.WsToServerMap.delete(clientId);
        this.log.info(`Client disconnected: ${clientId}`);
        this.metrics.connections.dec();
      });

      ws.on('error', (error: Error) => {
        this.log.error(`WebSocket error for client ${clientId}:`, error);
        ws.terminate();
        this.metrics.errors.inc({
          type: 'connection',
          code: error.name,
        });
      });

      // Send welcome message
      this.sendToClient(ws, {
        type: 'connected',
        payload: { clientId },
      });
    });

    this.wss.on('error', (error: Error) => {
      this.log.error('WebSocket server error:', error);
      this.metrics.errors.inc({
        type: 'server',
        code: error.name,
      });
    });

    this.wss.on('listening', () => {
      this.log.info(`WebSocket server is listening on port ${this.port}`);
    });
  }

  private setupHeartbeat(): void {
    this.pingInterval = setInterval(() => {
      this.wss.clients.forEach((ws: WebSocketClient) => {
        if (ws.isAlive === false) {
          return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping();
      });
    }, config.get('ws.heartbeatIntervalMs'));
  }

  private async handleMessage(ws: WebSocketClient, data: RawData): Promise<void> {
    const message: WebSocketMessage = JSON.parse(data.toString());
    this.log.debug(`Received message from client ${ws.id}:`, { data: data.toString() });
    const timer = this.metrics.messageLatency.startTimer({ type: message.type });
    try {
      switch (message.type) {
        case 'ping':
          this.sendToClient(ws, { type: 'pong', payload: null });
          break;
        case 'identify': {
          const payload = message.payload;
          if (!payload)
            return this.sendToClient(ws, {
              type: 'identifyResponse',
              payload: { error: new errors.BadRequestError('No payload provided') },
            });
          if (!payload.identityToken || payload.identityToken === '')
            return this.sendToClient(ws, {
              type: 'identifyResponse',
              payload: { error: new errors.BadRequestError('No identityToken provided') },
            });
          if (!payload.registrationToken)
            return this.sendToClient(ws, {
              type: 'identifyResponse',
              payload: { error: new errors.BadRequestError('No registrationToken provided') },
            });

          const { identityToken, registrationToken, name } = payload;
          if (typeof identityToken !== 'string') throw new errors.BadRequestError('Invalid identityToken provided');
          if (typeof registrationToken !== 'string')
            throw new errors.BadRequestError('Invalid registrationToken provided');
          const serverName = typeof name === 'string' ? name : identityToken;
          let gameServerId;

          try {
            gameServerId = await gameServerManager.handleWsIdentify(identityToken, registrationToken, serverName);
          } catch (error) {
            this.log.warn('Error identifying game server:', error);
            this.log.error(error);
            this.sendToClient(ws, { type: 'identifyResponse', payload: { error } });
            return;
          }

          if (!gameServerId) {
            this.log.warn('Gameserver tried to identify, but we could not resolve it');
            this.sendToClient(ws, {
              type: 'identifyResponse',
              payload: { error: new errors.BadRequestError('Could not identify game server') },
            });
            return;
          }
          if (!ws.id) throw new errors.BadRequestError('WS ID is missing, WS not properly identified/connected');
          this.servers.set(gameServerId, ws);
          this.WsToServerMap.set(ws.id, gameServerId);
          this.sendToClient(ws, { type: 'identifyResponse', payload: { gameServerId } });
          this.log.info(`Game server identified: ${gameServerId}`);
          break;
        }
        case 'gameEvent': {
          if (!ws.id) throw new errors.BadRequestError('WS ID is missing, WS not properly identified/connected');
          const gameServerId = this.WsToServerMap.get(ws.id);
          if (!gameServerId) {
            this.log.warn('Socket not properly identified/connected, Disconnecting to force re-identify');
            ws.terminate();
            throw new errors.BadRequestError('Game server ID not found for WS ID');
          }
          try {
            await gameServerManager.handleGameMessage(gameServerId, message);
          } catch (error) {
            if (error instanceof errors.ValidationError) {
              this.sendToClient(ws, {
                type: 'error',
                payload: { message: error.message },
              });
              return;
            }
            this.log.error('Error handling game event:', error);
            this.log.error(error);
            this.metrics.errors.inc({
              type: 'gameEvent',
              code: error instanceof errors.TakaroError ? error.constructor.name : 'InternalError',
            });
            this.sendToClient(ws, {
              type: 'error',
              payload: { message: 'Internal error handling game event' },
            });
            return;
          }
          break;
        }
        case 'response': {
          // Do nothing, we're handling response somewhere else.
          break;
        }
        default:
          this.log.warn(`Unknown message type: ${message.type}`);
      }
    } catch (error) {
      this.metrics.messageCounter.inc({ type: message.type, status: 'error' });
      this.metrics.errors.inc({
        type: 'message_processing',
        code: error instanceof errors.TakaroError ? error.constructor.name : 'InternalError',
      });
      this.log.warn('Error handling message:', error);
      if (error instanceof errors.TakaroError) {
        this.sendToClient(ws, {
          type: 'error',
          payload: { message: error.message },
        });
      } else {
        this.log.error('Internal error handling message');
        this.log.error(error);
        this.sendToClient(ws, {
          type: 'error',
          payload: { message: 'Invalid message format' },
        });
      }
    } finally {
      timer({ type: message.type });
      this.metrics.messageCounter.inc({ type: message.type, status: 'success' });
    }
  }

  private generateClientId(): string {
    return `client-${randomUUID()}`;
  }

  private sendToClient(client: WebSocketClient, message: WebSocketMessage, requestId?: string): void {
    try {
      client.send(
        JSON.stringify({
          ...message,
          requestId: requestId || randomUUID(),
        }),
      );
    } catch (error) {
      this.log.error(`Error sending message to client ${client.id}:`, error);
    }
  }

  public broadcast(message: WebSocketMessage): void {
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        this.sendToClient(client, message);
      }
    });
  }

  public sendToClients(clientIds: string[], message: WebSocketMessage): void {
    clientIds.forEach((clientId) => {
      const client = this.clients.get(clientId);
      if (client && client.readyState === WebSocket.OPEN) {
        this.sendToClient(client, message);
      }
    });
  }

  public shutdown(): void {
    clearInterval(this.pingInterval);
    this.wss.close(() => {
      this.log.info('WebSocket server shut down');
    });
  }

  public async resetConnection(id: string): Promise<void> {
    const client = this.servers.get(id);
    if (!client) {
      this.log.warn(`Game server ${id} not found`);
      return;
    }
    client.terminate();
    this.servers.delete(id);
    if (client.id) this.WsToServerMap.delete(client.id);
    this.log.info(`Game server ${id} connection reset`);
  }

  public async requestFromGameServer(id: string, action: GameServerActions, args: string) {
    const timer = this.metrics.requestLatency.startTimer({ action });
    this.metrics.gameserverRequests.inc({ action });
    const client = this.servers.get(id);
    if (!client) {
      this.metrics.errors.inc({
        type: 'request_processing',
        code: 'GameServerNotConnected',
      });
      throw new errors.BadRequestError('Game server is not connected');
    }

    return new Promise((resolve, reject) => {
      const requestId = randomUUID();
      const timeout = setTimeout(() => {
        this.metrics.errors.inc({
          type: 'request_processing',
          code: 'RequestTimeout',
        });
        timer({ action });
        reject(
          new errors.BadRequestError(`Request timed out after ${config.get('ws.requestTimeoutMs')}ms : ${action} `),
        );
      }, config.get('ws.requestTimeoutMs'));

      this.sendToClient(
        client,
        {
          type: 'request',
          payload: { action, args },
        },
        requestId,
      );

      client.on('message', async (data: RawData) => {
        const message: WebSocketMessage = JSON.parse(data.toString());
        if (message.requestId === requestId) {
          clearTimeout(timeout);

          try {
            await this.validateResponseDTO(action, message);
          } catch (error) {
            if (error instanceof errors.ValidationError) {
              this.sendToClient(
                client,
                {
                  type: 'error',
                  payload: { message: error.message },
                },
                requestId,
              );
            } else {
              this.log.error('Error validating response DTO:', error);
              this.sendToClient(
                client,
                {
                  type: 'error',
                  payload: { message: 'Internal error validating response DTO' },
                },
                requestId,
              );
            }
            this.metrics.errors.inc({
              type: 'request_processing',
              code: error instanceof errors.TakaroError ? error.constructor.name : 'InternalError',
            });
            return reject(error);
          } finally {
            timer({ action });
          }

          resolve(message.payload);
        }
      });
    });
  }

  private async validateResponseDTO(action: GameServerActions, response: WebSocketMessage): Promise<void> {
    type ActionResponse = {
      dto: typeof TakaroDTO<any>;
      isArray: boolean;
    } | null;
    const validationMap: Record<GameServerActions, ActionResponse> = {
      getPlayer: { dto: IGamePlayer, isArray: false },
      getPlayers: { dto: IGamePlayer, isArray: true },
      getPlayerLocation: { dto: IPosition, isArray: false },
      testReachability: { dto: TestReachabilityOutputDTO, isArray: false },
      executeConsoleCommand: { dto: CommandOutput, isArray: false },
      listBans: { dto: BanDTO, isArray: true },
      listItems: { dto: IItemDTO, isArray: true },
      listEntities: { dto: IEntityDTO, isArray: true },
      listLocations: { dto: ILocationDTO, isArray: true },
      getPlayerInventory: { dto: IItemDTO, isArray: true },
      getMapInfo: { dto: MapInfoDTO, isArray: false },
      getMapTile: null,
      giveItem: null,
      sendMessage: null,
      teleportPlayer: null,
      kickPlayer: null,
      banPlayer: null,
      unbanPlayer: null,
      shutdown: null,
    };

    const validationConfig = validationMap[action];

    if (validationConfig) {
      if (!response.payload) {
        throw new errors.ValidationError(`No payload provided but expected DTO: ${validationConfig.dto.name}`);
      }

      if (validationConfig.isArray) {
        // Handle array responses
        if (!Array.isArray(response.payload)) {
          throw new errors.ValidationError(`Expected array for action ${action} but got ${typeof response.payload}`);
        }

        const dtoArray = response.payload.map((item) => new validationConfig.dto(item));
        await Promise.all(dtoArray.map((dto) => dto.validate()));
      } else {
        // Handle single object responses
        const dto = new validationConfig.dto(response.payload);
        await dto.validate();
      }
    }
  }
}

export const wsServer = new WSServer(config.get('ws.port'));
