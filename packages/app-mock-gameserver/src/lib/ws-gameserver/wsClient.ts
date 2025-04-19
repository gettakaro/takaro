import WebSocket from 'ws';
import { logger } from '@takaro/util';
import { config } from '../../config.js';
import { EventEmitter } from 'events';

interface WebSocketMessage {
  type: string;
  payload: unknown;
  requestId?: string;
}

export class WSClient extends EventEmitter {
  private log = logger('WSClient');
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private pingTimeout: NodeJS.Timeout | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = config.get('ws.maxReconnectAttempts') ?? 10;
  private readonly reconnectInterval = config.get('ws.reconnectIntervalMs') ?? 5000;
  private readonly pingInterval = config.get('ws.heartbeatIntervalMs') ?? 30000;

  constructor(url: string) {
    super();
    this.url = url;
    this.connect();
  }

  private connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.log.warn('Already connected');
      return;
    }

    try {
      this.log.info(`Connecting to ${this.url}`);
      this.ws = new WebSocket(this.url);
      this.setupEventHandlers();
    } catch (error) {
      this.log.error('Failed to create WebSocket connection:', error);
      this.scheduleReconnect();
    }
  }

  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.on('open', () => {
      this.log.info('Connected to WebSocket server');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connected');
      this.setupPingTimeout();
    });

    this.ws.on('close', () => {
      this.log.info('Disconnected from WebSocket server');
      this.isConnected = false;
      this.clearPingTimeout();
      this.emit('disconnected');
      this.scheduleReconnect();
    });

    this.ws.on('error', (error: Error) => {
      this.log.error('WebSocket error:', error);
      this.emit('error', error);
    });

    this.ws.on('message', (data: WebSocket.RawData) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());

        // Handle server pings
        if (message.type === 'ping') {
          this.send({ type: 'pong', payload: null });
          return;
        }

        // Reset ping timeout on any message
        this.setupPingTimeout();

        this.emit('message', message);
      } catch (error) {
        this.log.error('Error parsing message:', error);
      }
    });

    this.ws.on('pong', () => {
      this.setupPingTimeout();
    });
  }

  private setupPingTimeout(): void {
    this.clearPingTimeout();
    this.pingTimeout = setTimeout(() => {
      this.log.warn('Ping timeout - reconnecting');
      this.reconnect();
    }, this.pingInterval);
  }

  private clearPingTimeout(): void {
    if (this.pingTimeout) {
      clearTimeout(this.pingTimeout);
      this.pingTimeout = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.log.error('Max reconnection attempts reached');
      this.emit('maxReconnectAttemptsReached');
      return;
    }

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.log.info(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      this.connect();
    }, this.reconnectInterval);
  }

  public reconnect(): void {
    this.log.info('Manual reconnect initiated');
    if (this.ws) {
      this.ws.terminate();
    }
    this.connect();
  }

  public send(message: WebSocketMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.log.warn('Cannot send message - not connected');
      return;
    }

    try {
      this.ws.send(JSON.stringify(message));
    } catch (error) {
      this.log.error('Error sending message:', error);
      this.emit('error', error);
    }
  }

  public disconnect(): void {
    this.log.info('Disconnecting...');
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.clearPingTimeout();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  public isConnectedToServer(): boolean {
    return this.isConnected;
  }
}
