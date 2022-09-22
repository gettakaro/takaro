import { EventEmitter } from 'node:stream';
import { logger } from '@takaro/logger';
import { IGameEventEmitter } from '../../interfaces/eventEmitter';
import WebSocket from 'ws';
import { JsonObject } from 'type-fest';
import { IsString } from 'class-validator';
import { GameEvents } from '../../interfaces/events';
import { IGamePlayer } from '../../interfaces/GamePlayer';

// TODO: should move to somewhere else
export interface RustCombatLog {
  /// The recorded server time in which the combat round was initiated
  time: string;
  /// The player that initiated the combat round.
  attacker: string;
  /// The player's unique network ID.
  attackerId: string;
  /// The player or object that was harmed by the Attacker
  target: string;
  /// The weapon type used in the combat round.
  weapon: string;
  /// The ammo type used in the combat round.
  ammo: string;
  /// The specific area in which the hit registered (head, neck, arm)
  area: string;
  /// The distance in which the attack was initiated in meters.
  distance: string;
  /// The total health of the target before the combat round took place.
  oldHp: number;
  /// The total health of the target after the combat round took place.
  newHp: number;
  /// Additioanl information statuses and flags.
  info: string;
}

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

enum RustEventType {
  DEFAULT = 'generic',
  WARNING = 'warning',
}

interface RustEvent {
  message: string;
  identifier: number;
  type: RustEventType;
  stacktrace: string;
}

const EventRegexMap = {
  [GameEvents.PLAYER_CONNECTED]:
    /.* with steamid ([0-9]{17}) joined from ip .*/,
  [GameEvents.PLAYER_DISCONNECTED]: /.* disconnecting\: disconnect/,
  [GameEvents.PLAYER_SPAWNED]: /.*\[\d{17}\] has spawned/,
  [GameEvents.PLAYER_KICKED]: /.*\/\d{17}\/.* kicked: .*/,
  [GameEvents.ITEM_GIVEN_TO]: /\[.*\] giving .*/,
  [GameEvents.PLAYER_MESSAGED]: /\[CHAT\].*\[\d{17}\] :.*/,
};

export class RustEmitter extends EventEmitter implements IGameEventEmitter {
  private ws: WebSocket | null = null;
  private logger = logger('rust:ws');

  constructor() {
    super();
  }
  async start(config: JsonObject): Promise<void> {
    // temporary
    config.hostname = '195.201.91.127';
    config.port = '28016';
    config.password = 'docker';
    this.ws = new WebSocket(
      `ws://${config.hostname}:${config.port}/${config.password}`
    );

    this.ws.on('message', (m: string) => {
      this.listener(m);
    });

    this.ws.on('open', () => {
      this.logger.info('Connected to [RUST] gameserver.');
      // this.ws!.send(JSON.stringify({ Message: 'serverinfo', Identifier: 42, Name: 'Takaro' }));
    });
  }

  async stop(): Promise<void> {
    this.ws?.close();
    this.logger.debug('Websocket connection has been closed');
    return;
  }
  private transform(obj: any): RustEvent {
    // Currently this contains only lowercasing the keys.
    return {
      message: obj.Message,
      identifier: obj.Identifier,
      type: obj.Type,
      stacktrace: obj.Stacktrace,
    };
  }

  private async parseMessage(e: RustEvent) {
    // TODO: We probably want to handle the stacktrace first, because in that case it might be an invalid message.
    // TODO: Certain events have a different type. We could split the events based on these types to improve performance.
    if (EventRegexMap[GameEvents.PLAYER_CONNECTED].test(e.message)) {
      const data = this.handlePlayerConnected(e.message);
      this.emit(GameEvents.PLAYER_CONNECTED, data);
      return;
    }
    if (EventRegexMap[GameEvents.PLAYER_DISCONNECTED].test(e.message)) {
      const data = this.handlePlayerDisconnected(e.message);
      this.emit(GameEvents.PLAYER_DISCONNECTED, data);
      return;
    }

    if (EventRegexMap[GameEvents.PLAYER_SPAWNED].test(e.message)) {
      const data = this.handlePlayerSpawned(e.message);
      this.emit(GameEvents.PLAYER_SPAWNED, data);
      return;
    }

    if (EventRegexMap[GameEvents.PLAYER_KICKED].test(e.message)) {
      const data = this.handlePlayerKicked(e.message);
      this.emit(GameEvents.PLAYER_KICKED, data);
      return;
    }

    if (EventRegexMap[GameEvents.PLAYER_MESSAGED].test(e.message)) {
      const data = this.handlePlayerMessaged(e.message);
      this.emit(GameEvents.PLAYER_MESSAGED, data);
      return;
    }

    if (EventRegexMap[GameEvents.ITEM_GIVEN_TO].test(e.message)) {
      const data = this.handleItemGivenTo(e.message);
      this.emit(GameEvents.ITEM_GIVEN_TO, data);
      return;
    }

    this.emit(GameEvents.LOG_LINE, {
      timestamp: new Date(),
      msg: e.message,
    });
  }

  async listener(data: string) {
    try {
      data.replace(/"([^"]+)":/g, (_, $1: string) => {
        return '"' + $1.toLowerCase() + '":';
      });
      const event = this.transform(JSON.parse(data));
      await this.parseMessage(event);
    } catch (error) {
      this.logger.error('Error handling message from game server', error);
    }
  }

  private handlePlayerConnected(msg: string) {
    /// Example: Emiel with steamid 76561198035925898 joined from ip 178.118.188.46:55766
    const player = new IGamePlayer();
    const expSearch =
      /(?<name>.+?) with steamid (?<platformId>\d{17}) joined from ip (?<ip>.*)/.exec(
        msg
      );
    if (
      expSearch &&
      expSearch.groups &&
      expSearch.groups.name &&
      expSearch.groups.platformId
    ) {
      player.name = expSearch.groups.name;
      player.platformId = expSearch.groups.platformId;
      return { player };
    }
    this.logger.error('Could not parse event correctly', msg, expSearch);
    throw new Error('RUSTEVENTHANDLER_PARSING_FAILED');
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
      const player = new IGamePlayer();
      player.platformId = expSearch.groups.platformId;
      player.name = expSearch.groups.name;
      return { player };
    }
    this.logger.error('Could not parse event correctly', msg, expSearch);
    throw new Error('RUSTEVENTHANDLER_PARSING_FAILED');
  }

  private handlePlayerMessaged(msg: string) {
    /// Example: [CHAT] Emiel[76561198035925898] : hallo
    const expSearch =
      /(?<=\[CHAT\] )(?<name>.*)(?=\[(?<platformId>\d{17})\] : (?<message>.*))/.exec(
        msg
      );

    if (
      expSearch &&
      expSearch.groups &&
      expSearch.groups.platformId &&
      expSearch.groups.name &&
      expSearch.groups.message
    ) {
      const player = new IGamePlayer();
      player.name = expSearch.groups.name;
      player.platformId = expSearch.groups.platformId;
      const message = expSearch.groups.message;
      return { player, message };
    }
    this.logger.error('Could not parse event correctly', msg, expSearch);
    throw new Error('RUSTEVENTHANDLER_PARSING_FAILED');
  }

  private handlePlayerSpawned(msg: string) {
    /// Example: Emiel[76561198035925898] has spawned
    const expSearch = /(?<name>^.*?)\[(?<platformId>\d{17})\] has spawned/.exec(
      msg
    );
    if (
      expSearch &&
      expSearch.groups &&
      expSearch.groups.name &&
      expSearch.groups.platformId
    ) {
      const player = new IGamePlayer();
      player.name = expSearch.groups.name;
      player.platformId = expSearch.groups.platformId;
      return { player };
    }
    this.logger.error('Could parse messsage correctly', msg, expSearch);
    throw new Error('RUSTEVENTHANDLER_PARSING_FAILED');
  }

  private handlePlayerKicked(msg: string) {
    /// Example: 178.118.188.46:64115/76561198035925898/Emiel kicked: Steam: Invalid
    const expSearch =
      /(?<ip>.*):(?<port>\d{5})\/(?<platformId>\d{17})\/(?<name>.*) kicked: (?<reason>.*)/.exec(
        msg
      );
    if (
      expSearch &&
      expSearch.groups &&
      expSearch.groups.platformId &&
      expSearch.groups.name &&
      expSearch.groups.reason
    ) {
      const player = new IGamePlayer();
      player.platformId = expSearch.groups.platformId;
      player.name = expSearch.groups.name;
      const reason = expSearch.groups.reason;
      return { reason, player };
    }
    this.logger.error('could not parse message correctly', msg, expSearch);
    throw new Error('RUSTEVENTHANDLER_PARSING_FAILED');
  }

  private handleItemGivenTo(msg: string) {
    /// Example: [ServerVar] giving Emiel 10 x Small Neon Sign
    const expSearch =
      /\[(?<sender>.*)] giving (?<receiver>.*) (?<amount>[0-9]+) x (?<itemName>.*)/.exec(
        msg
      );
    if (
      expSearch &&
      expSearch.groups &&
      expSearch.groups.sender &&
      expSearch.groups.receiver &&
      expSearch.groups.amount &&
      expSearch.groups.itemName
    ) {
      const sender = expSearch.groups.sender;
      const receiver = expSearch.groups.receiver;
      const amount = expSearch.groups.amount;
      const itemName = expSearch.groups.itemName;
      return { sender, receiver, amount, itemName };
    }
    this.logger.error('could not parse message correctly', msg, expSearch);
    throw new Error('RUSTEVENTHANDLER_PARSING_FAILED');
  }

  private async getPlayer(id: string): Promise<IGamePlayer | null> {
    // TODO:
    this.logger.debug(id);
    return null;
  }
  private async getPlayers(): Promise<IGamePlayer[]> {
    return [];
  }

  public executeRawCommand(command: string): string {
    const data = {
      Message: command,
      Name: 'Takaro',
    };
    this.ws?.send(data, (resp) => console.log(resp));
    return '';
  }
}
