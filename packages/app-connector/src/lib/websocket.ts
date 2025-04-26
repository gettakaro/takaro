import { errors, logger } from '@takaro/util';
import WebSocket, { WebSocketServer, RawData } from 'ws';
import { randomUUID } from 'crypto';
import { config } from '../config.js';
import { gameServerManager } from './GameServerManager.js';

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

  constructor(port: number) {
    this.port = port;
    this.wss = new WebSocketServer({ port });
    this.setupWebSocketServer();
    this.setupHeartbeat();
    this.log.info(`WebSocket server started on port ${port}`);
  }

  private setupWebSocketServer(): void {
    this.wss.on('connection', (ws: WebSocketClient) => {
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
      });

      ws.on('error', (error: Error) => {
        this.log.error(`WebSocket error for client ${clientId}:`, error);
        ws.terminate();
      });

      // Send welcome message
      this.sendToClient(ws, {
        type: 'connected',
        payload: { clientId },
      });
    });

    this.wss.on('error', (error: Error) => {
      this.log.error('WebSocket server error:', error);
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
    try {
      const message: WebSocketMessage = JSON.parse(data.toString());

      this.log.debug(`Received message from client ${ws.id}:`, { data: data.toString() });

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
          gameServerManager.handleGameMessage(gameServerId, message);
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
    }
  }

  private generateClientId(): string {
    return `client-${randomUUID()}`;
  }

  private sendToClient(client: WebSocketClient, message: WebSocketMessage): void {
    try {
      client.send(
        JSON.stringify({
          ...message,
          requestId: randomUUID(),
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

  public async requestFromGameServer(id: string, action: string, args: string) {
    const client = this.servers.get(id);
    if (!client) {
      throw new errors.BadRequestError('Game server is not connected');
    }

    return new Promise((resolve, reject) => {
      const requestId = randomUUID();
      const timeout = setTimeout(() => {
        reject(
          new errors.BadRequestError(`Request timed out after ${config.get('ws.requestTimeoutMs')}ms : ${action} `),
        );
      }, config.get('ws.requestTimeoutMs'));

      client.send(
        JSON.stringify({
          type: 'request',
          payload: { action, args },
          requestId,
        }),
      );

      client.on('message', (data: RawData) => {
        const message: WebSocketMessage = JSON.parse(data.toString());
        if (message.requestId === requestId) {
          clearTimeout(timeout);
          resolve(message.payload);
        }
      });
    });
  }
}

export const wsServer = new WSServer(config.get('ws.port'));
