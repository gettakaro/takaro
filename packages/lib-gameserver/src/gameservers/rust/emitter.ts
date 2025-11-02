import WebSocket from 'ws';
import { logger, errors } from '@takaro/util';
import { RustConnectionInfo } from './connectionInfo.js';
import { TakaroEmitter } from '../../TakaroEmitter.js';
import {
  EventChatMessage,
  EventEntityKilled,
  EventLogLine,
  EventPlayerConnected,
  EventPlayerDeath,
  EventPlayerDisconnected,
  GameEvents,
  GameEventsMapping,
} from '@takaro/modules';
import { ValueOf } from 'type-fest';

export enum RustEventType {
  DEFAULT = 'Generic',
  WARNING = 'Warning',
  CHAT = 'Chat',
}

export interface RustEvent {
  Message: string;
  Identifier: number;
  Type: RustEventType;
  Stacktrace: string;
}

enum RustTypesType {
  PLAYER_CONNECTED = 0,
  PLAYER_DISCONNECTED = 1,
  CHAT_MESSAGE = 2,
  PLAYER_DEATH = 3,
  ENTITY_KILLED = 4,
}

export class RustEmitter extends TakaroEmitter {
  private ws: WebSocket | null = null;
  private log = logger('rust:ws');
  private boundListener = (m: Buffer) => this.listener(m.toString());

  constructor(private config: RustConnectionInfo) {
    super();
  }

  static async getClient(config: RustConnectionInfo) {
    const log = logger('rust:ws');

    const protocol = config.useTls ? 'wss' : 'ws';
    const client = new WebSocket(`${protocol}://${config.host}:${config.rconPort}/${config.rconPassword}`);

    log.debug('getClient', {
      host: config.host,
      port: config.rconPort,
    });

    return Promise.race([
      new Promise<WebSocket>((resolve, reject) => {
        client?.on('error', (err) => {
          log.warn('getClient', err);
          client?.close();
          return reject(err);
        });
        client?.on('unexpected-response', (req, res) => {
          log.debug('unexpected-response', {
            req,
            res,
          });
          reject(new errors.InternalServerError());
        });
        client?.on('open', () => {
          log.debug('Connection opened');
          if (client) {
            return resolve(client);
          }
        });
      }),
      new Promise<WebSocket>((_, reject) => {
        setTimeout(() => reject(new errors.WsTimeOutError('Timeout')), 5000);
      }),
    ]);
  }

  async start(): Promise<void> {
    this.ws = await RustEmitter.getClient(this.config);

    this.ws?.on('message', this.boundListener);
  }

  async stop(): Promise<void> {
    this.ws?.off('message', this.boundListener);
    this.ws?.close();
    this.log.debug('Websocket connection has been closed');
    return;
  }

  async parseMessage(e: RustEvent) {
    if (e.Message.includes('[Hook Parser]')) {
      const parsed = JSON.parse(e.Message.replace('[Hook Parser]', ''));
      let dto: InstanceType<ValueOf<typeof GameEventsMapping>> | null = null;
      switch (parsed.type) {
        case RustTypesType.PLAYER_CONNECTED:
          dto = await this.handlePlayerConnected(parsed.data);
          break;
        case RustTypesType.PLAYER_DISCONNECTED:
          dto = await this.handlePlayerDisconnected(parsed.data);
          break;
        case RustTypesType.CHAT_MESSAGE:
          dto = await this.handleChatMessage(parsed.data);
          break;
        case RustTypesType.PLAYER_DEATH:
          dto = await this.handlePlayerDeath(parsed.data);
          break;
        case RustTypesType.ENTITY_KILLED:
          dto = await this.handleEntityKilled(parsed.data);
          break;
        default:
          this.log.warn('Unknown event type', parsed);
          break;
      }

      if (!dto) {
        this.log.warn('dto undefined, could not determine type?', parsed);
        return;
      }

      await dto.validate({
        whitelist: false,
      });
      this.emit(dto.type, dto);
    }

    this.emit(
      GameEvents.LOG_LINE,
      new EventLogLine({
        msg: e.Message,
      }),
    );
  }

  private async handlePlayerConnected(data: Record<string, unknown>): Promise<EventPlayerConnected> {
    const event = new EventPlayerConnected(data);
    if (event.player.steamId) {
      event.player.gameId = event.player.steamId;
    }
    return event;
  }

  private async handlePlayerDisconnected(data: Record<string, unknown>): Promise<EventPlayerDisconnected> {
    const event = new EventPlayerDisconnected(data);
    if (event.player.steamId) {
      event.player.gameId = event.player.steamId;
    }
    return event;
  }

  private async handleChatMessage(data: Record<string, string>): Promise<EventChatMessage> {
    data.channel = data.channel.toLowerCase();
    const event = new EventChatMessage(data);
    if (event.player) {
      if (event.player.steamId) {
        event.player.gameId = event.player.steamId;
      }
    }

    return event;
  }

  private async handlePlayerDeath(data: Record<string, unknown>): Promise<EventPlayerDeath> {
    const event = new EventPlayerDeath(data);
    if (event.player.steamId) {
      event.player.gameId = event.player.steamId;
    }
    if (event.attacker && event.attacker.steamId) {
      event.attacker.gameId = event.attacker.steamId;
    }
    return event;
  }

  private async handleEntityKilled(data: Record<string, unknown>): Promise<EventEntityKilled> {
    const event = new EventEntityKilled(data);
    if (event.player.steamId) {
      event.player.gameId = event.player.steamId;
    }
    return event;
  }

  async listener(data: string) {
    try {
      const event = JSON.parse(data);
      await this.parseMessage(event);
      this.log.debug('event: ', event);
    } catch (error) {
      this.log.error('Error handling message from game server', error);
    }
  }
}
