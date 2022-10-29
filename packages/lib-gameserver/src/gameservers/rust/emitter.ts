import WebSocket from 'ws';
import { logger, errors } from '@takaro/util';
import { TakaroEmitter } from '../../interfaces/eventEmitter';
import {
  EventPlayerConnected,
  EventPlayerDisconnected,
  GameEvents,
  IGameEventEmitter,
  IGamePlayer,
} from '../../main';
import { IsString } from 'class-validator';
import { JsonObject } from 'type-fest';
import { RustConnectionInfo } from '.';

export class RustConfig {
  @IsString()
  hostname!: string;
  @IsString()
  port!: string;
  @IsString()
  password!: string;

  constructor(config: JsonObject) {
    Object.assign(this, config);
  }
}

export enum RustEventType {
  DEFAULT = 'generic',
  WARNING = 'warning',
  // pretty sure chat messages have their own type as well.
}

const EventRegexMap = {
  [GameEvents.PLAYER_CONNECTED]: /\d{17}\/.+ joined \[.+\/\d{17}\]/,
  [GameEvents.PLAYER_DISCONNECTED]: /.* disconnecting\: disconnect/,
  // [GameEvents.PLAYER_SPAWNED]: /.*\[\d{17}\] has spawned/,
  // [GameEvents.PLAYER_KICKED]: /.*\/\d{17}\/.* kicked: .*/,
  // [GameEvents.ITEM_GIVEN_TO]: /\[.*\] giving .*/,
  // [GameEvents.PLAYER_MESSAGED]: /\[CHAT\].*\[\d{17}\] :.*/,
};

export interface RustEvent {
  message: string;
  identifier: number;
  type: RustEventType;
  stacktrace: string;
}

export class RustEmitter extends TakaroEmitter implements IGameEventEmitter {
  private ws: WebSocket | null = null;
  private logger = logger('rust:ws');
  private config: RustConnectionInfo;

  constructor(config: RustConnectionInfo) {
    super();
    this.config = config;
  }

  async start(): Promise<void> {
    this.logger.debug('Connecting to [RUST] game server...');

    this.ws = new WebSocket(
      `ws://${this.config.host}:${this.config.rconPort}/${this.config.rconPassword}`
    );

    this.logger.debug('Connected to [RUST] game server!!!');

    this.ws.on('message', (m: string) => {
      this.listener(m);
    });

    this.ws.on('open', () => {
      this.logger.info('Connected to [RUST] game server.');
    });

    this.ws.on('error', (e) => {
      this.logger.error('Could not connect to [RUST] game server!', e);
    });
  }

  async stop(): Promise<void> {
    this.ws?.close();
    this.logger.debug('Websocket connection has been closed');
    return;
  }
  private transform(obj: Record<string, unknown>): RustEvent {
    // Currently this contains only lowercasing the keys.
    return {
      message: obj.Message as string,
      identifier: obj.Identifier as number,
      type: obj.Type as RustEventType,
      stacktrace: obj.Stacktrace as string,
    };
  }

  async parseMessage(e: RustEvent) {
    // TODO: We probably want to handle the stacktrace first, because in that case it might be an invalid message.
    // TODO: Certain events have a different type. We could split the events based on these types to improve performance.
    if (EventRegexMap[GameEvents.PLAYER_CONNECTED].test(e.message)) {
      this.logger.debug('regexje');
      const data = this.handlePlayerConnected(e.message);
      this.emitGameEvent(GameEvents.PLAYER_CONNECTED, data);
    }
    if (EventRegexMap[GameEvents.PLAYER_DISCONNECTED].test(e.message)) {
      const data = this.handlePlayerDisconnected(e.message);
      this.emitGameEvent(GameEvents.PLAYER_DISCONNECTED, data);
    }

    this.emit(GameEvents.LOG_LINE, {
      timestamp: new Date(),
      msg: e.message,
    });
  }

  private handlePlayerConnected(msg: string) {
    // "msg": "169.169.169.80:65384/76561198021481871/brunkel joined [windows/76561198021481871]"
    const expSearch =
      /(?<ip>[0-9\.]+):(?<port>\d{5})\/(?<steamId>\d{17})\/(?<name>.+) joined \[(?<device>.+)\/\d{17}\]/.exec(
        msg
      );

    console.log(expSearch?.groups);

    if (
      expSearch &&
      expSearch.groups &&
      expSearch.groups.ip &&
      expSearch.groups.port &&
      expSearch.groups.steamId &&
      expSearch.groups.name &&
      expSearch.groups.device
    ) {
      const player = new IGamePlayer({
        gameId: expSearch.groups.steamId,
        name: expSearch.groups.name,
        steamId: expSearch.groups.steamId,
        ip: expSearch.groups.ip,
        device: expSearch.groups.device,
      });

      this.logger.debug('player: ', player);

      return new EventPlayerConnected({
        player,
      });
    }

    this.logger.error(
      'Could not parse `PlayerConnected` event correctly.',
      msg,
      expSearch
    );

    throw new errors.GameServerError();
  }

  private handlePlayerDisconnected(msg: string) {
    // Example: 178.118.188.46:52210/76561198035925898/Emiel disconnecting: disconnect
    const expSearch =
      /(?<ip>.*):(?<port>\d{5})\/(?<platformId>\d{17})\/(?<name>.*) disconnecting: disconnect/.exec(
        msg
      );

    if (
      expSearch &&
      expSearch.groups &&
      expSearch.groups.platformId &&
      expSearch.groups.name
    ) {
      const player = new IGamePlayer({
        name: expSearch.groups.name,
        steamId: expSearch.groups.steamId,
      });

      return new EventPlayerDisconnected({ player });
    }

    this.logger.error(
      'Could not parse `playerDisconnected` event correctly.',
      msg,
      expSearch
    );

    throw new errors.GameServerError();
  }

  async listener(data: string) {
    try {
      data.replace(/"([^"]+)":/g, (_, $1: string) => {
        return '"' + $1.toLowerCase() + '":';
      });
      const event = this.transform(JSON.parse(data));
      await this.parseMessage(event);
      this.logger.debug('event: ', event);
    } catch (error) {
      this.logger.error('Error handling message from game server', error);
    }
  }
}
