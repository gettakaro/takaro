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
  IGamePlayer,
} from '@takaro/modules';

export enum RustEventType {
  DEFAULT = 'Generic',
  WARNING = 'Warning',
  CHAT = 'Chat',
}

const EventRegexMap = {
  [GameEvents.PLAYER_CONNECTED]: /\d{17}\/.+ joined \[.+\/\d{17}\]/,
  [GameEvents.PLAYER_DISCONNECTED]: /.* disconnecting\: disconnect/,
  [GameEvents.PLAYER_DEATH]: /(?<name>.+)\[\d+\] (was killed by (?<attacker>.+\[\d+\])|(?<cause>.+)|died) /,
  [GameEvents.ENTITY_KILLED]:
    /(?<killerName>.+)\[\d+\] killed (?<entityName>.+) at \((?<xCoord>[-\d.]+), (?<yCoord>[-\d.]+), (?<zCoord>[-\d.]+)\)/,
};

export interface RustEvent {
  Message: string;
  Identifier: number;
  Type: RustEventType;
  Stacktrace: string;
}

export class RustEmitter extends TakaroEmitter {
  private ws: WebSocket | null = null;
  private log = logger('rust:ws');

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

    this.ws?.on('message', (m: Buffer) => {
      this.listener(m.toString());
    });
  }

  async stop(): Promise<void> {
    this.ws?.close();
    this.log.debug('Websocket connection has been closed');
    return;
  }

  async parseMessage(e: RustEvent) {
    // TODO: We probably want to handle the stacktrace first, because in that case it might be an invalid message.
    // TODO: Certain events have a different type. We could split the events based on these types to improve performance.
    if (EventRegexMap[GameEvents.PLAYER_CONNECTED].test(e.Message)) {
      const data = await this.handlePlayerConnected(e);
      this.emit(GameEvents.PLAYER_CONNECTED, data);
    }
    if (EventRegexMap[GameEvents.PLAYER_DISCONNECTED].test(e.Message)) {
      const data = await this.handlePlayerDisconnected(e);
      this.emit(GameEvents.PLAYER_DISCONNECTED, data);
    }

    if (EventRegexMap[GameEvents.PLAYER_DEATH].test(e.Message)) {
      const data = await this.handlePlayerDeath(e);
      this.emit(GameEvents.PLAYER_DEATH, data);
    }

    if (EventRegexMap[GameEvents.ENTITY_KILLED].test(e.Message)) {
      const data = await this.handleEntityKilled(e);
      this.emit(GameEvents.ENTITY_KILLED, data);
    }

    if (e.Type === RustEventType.CHAT) {
      const data = await this.handleChatMessage(e);
      this.emit(GameEvents.CHAT_MESSAGE, data);
    }

    this.emit(
      GameEvents.LOG_LINE,
      await new EventLogLine().construct({
        timestamp: new Date(),
        msg: e.Message,
      })
    );
  }

  private async handlePlayerConnected(e: RustEvent) {
    // "msg": "169.169.169.80:65384/76561198021481871/brunkel joined [windows/76561198021481871]"
    const msg = e.Message;
    const expSearch =
      /(?<ip>[0-9\.]+):(?<port>\d{5})\/(?<steamId>\d{17})\/(?<name>.+) joined \[(?<device>.+)\/\d{17}\]/.exec(msg);

    if (
      expSearch &&
      expSearch.groups &&
      expSearch.groups.ip &&
      expSearch.groups.port &&
      expSearch.groups.steamId &&
      expSearch.groups.name &&
      expSearch.groups.device
    ) {
      const player = await new IGamePlayer().construct({
        gameId: expSearch.groups.steamId,
        name: expSearch.groups.name,
        steamId: expSearch.groups.steamId,
        ip: expSearch.groups.ip,
      });

      this.log.debug('player: ', player);

      return new EventPlayerConnected().construct({
        player,
        msg: msg,
        timestamp: new Date(),
      });
    }

    this.log.error('Could not parse `PlayerConnected` event correctly.', msg, expSearch);

    throw new errors.GameServerError();
  }

  private async handlePlayerDisconnected(e: RustEvent) {
    // Example: 178.118.188.46:52210/76561198035925898/Emiel disconnecting: disconnect
    const msg = e.Message;
    const expSearch = /(?<ip>.*):(?<port>\d{5})\/(?<platformId>\d{17})\/(?<name>.*) disconnecting: disconnect/.exec(
      msg
    );

    if (expSearch && expSearch.groups && expSearch.groups.platformId && expSearch.groups.name) {
      const player = await new IGamePlayer().construct({
        name: expSearch.groups.name,
        steamId: expSearch.groups.platformId,
        gameId: expSearch.groups.platformId,
      });

      return new EventPlayerDisconnected().construct({
        player,
        msg,
        timestamp: new Date(),
      });
    }

    this.log.error('Could not parse `playerDisconnected` event correctly.', msg, expSearch);

    throw new errors.GameServerError();
  }

  private async handleChatMessage(e: RustEvent): Promise<EventChatMessage> {
    const parsed = JSON.parse(e.Message);

    return new EventChatMessage().construct({
      msg: parsed.Message,
      player: await new IGamePlayer().construct({
        gameId: parsed.UserId,
        name: parsed.Username,
      }),
      timestamp: new Date(parsed.Time * 1000),
    });
  }

  private async handlePlayerDeath(logLine: RustEvent) {
    const match = EventRegexMap[GameEvents.PLAYER_DEATH].exec(logLine.Message);
    if (!match) throw new Error('Could not parse player death message');
    const { groups } = match;
    if (!groups) throw new Error('Could not parse player death message');

    const { name } = groups;

    const locationMatches = /at \((?<xCoord>[-\d.]+), (?<yCoord>[-\d.]+), (?<zCoord>[-\d.]+)\)/.exec(logLine.Message);
    if (!locationMatches) throw new Error('Could not parse player death message');
    const { xCoord, yCoord, zCoord } = locationMatches.groups || {};
    if (!xCoord || !yCoord || !zCoord) throw new Error('Could not parse player death message');

    return new EventPlayerDeath().construct({
      msg: logLine.Message,
      player: await new IGamePlayer().construct({
        name,
      }),
      position: {
        x: parseFloat(xCoord),
        y: parseFloat(yCoord),
        z: parseFloat(zCoord),
      },
      timestamp: new Date(),
    });
  }

  private async handleEntityKilled(logLine: RustEvent) {
    const match = EventRegexMap[GameEvents.ENTITY_KILLED].exec(logLine.Message);
    if (!match) throw new Error('Could not parse entity killed message');
    const { groups } = match;
    if (!groups) throw new Error('Could not parse entity killed message');

    const { killerName, entityName } = groups;

    return new EventEntityKilled().construct({
      msg: logLine.Message,
      player: await new IGamePlayer().construct({
        name: killerName,
      }),
      entity: entityName,

      timestamp: new Date(),
    });
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
