import { logger } from '@takaro/util';
import EventSource from 'eventsource';
import { JsonObject } from 'type-fest';
import {
  ChatChannel,
  EventChatMessage,
  EventEntityKilled,
  EventLogLine,
  EventPlayerConnected,
  EventPlayerDeath,
  EventPlayerDisconnected,
  GameEvents,
  IGamePlayer,
} from '@takaro/modules';
import { SdtdConnectionInfo } from './connectionInfo.js';
import { TakaroEmitter } from '../../TakaroEmitter.js';
import { SevenDaysToDie } from './index.js';
import ms from 'ms';

interface I7DaysToDieEvent extends JsonObject {
  msg: string;
}

/**
 * 7d2d servers can get really spammy with bugged vehicles, buggy mods, etc.
 * This is a list of messages that we don't want to emit events for.
 */
const blackListedMessages = [
  'NullReferenceException',
  'Infinity or NaN floating point numbers appear when calculating the transform matrix for a Collider',
  'IsMovementBlocked',
  'Particle System is trying to spawn on a mesh with zero surface area',
  'AddDecorationAt',
  'EntityFactory CreateEntity: unknown type',
  'DroneManager',
  'VehicleManager',
  'kinematic body',
];

const EventRegexMap = {
  [GameEvents.PLAYER_CONNECTED]:
    /PlayerSpawnedInWorld \(reason: (JoinMultiplayer|EnterMultiplayer), position: [-\d]+, [-\d]+, [-\d]+\): EntityID=(?<entityId>[-\d]+), PltfmId='(Steam|XBL)_[\w\d]+', CrossId='EOS_[\w\d]+', OwnerID='(Steam|XBL)_\d+', PlayerName='(?<name>.+)'/,
  [GameEvents.PLAYER_DISCONNECTED]: /(Player disconnected: )/,
  [GameEvents.CHAT_MESSAGE]:
    /Chat \(from '(?<platformId>[\w\d-]+)', entity id '(?<entityId>[-\d]+)', to '(?<channel>\w+)'\): ('(?<playerName>.+)':)?(?<message>.+)/,
  [GameEvents.PLAYER_DEATH]:
    /GMSG: Player '(?<name1>.+)' died|\[CSMM_Patrons\]playerDied: (?<name2>.+) \((?<steamOrXboxId>.+)\) died @ (?<xCoord>[-\d]+) (?<yCoord>[-\d]+) (?<zCoord>[-\d]+)/,
  [GameEvents.ENTITY_KILLED]:
    /\[CSMM_Patrons\]entityKilled: (?<killerName>.+) \((?<steamOrXboxId>.+)\) killed (?<entityType>\w+) (?<entityName>\w+) with (?<weapon>.+)|Entity (?<entityName2>\w+) \d+ killed by (?<killerName2>.+) \d+/,
};

export class SevenDaysToDieEmitter extends TakaroEmitter {
  private SSERegex = /\d+-\d+-\d+T\d+:\d+:\d+ \d+\.\d+ INF (.+)/;
  private eventSource!: EventSource;
  private logger = logger('7D2D:SSE');
  private sdtd: SevenDaysToDie;

  private recentMessages: Set<string> = new Set(); // To track recent messages
  private checkInterval: NodeJS.Timeout;
  private lastMessageTimestamp = Date.now();
  private keepAliveTimeout = ms('30s');

  constructor(private config: SdtdConnectionInfo) {
    super();
    this.sdtd = new SevenDaysToDie(config, {});
  }

  get url() {
    if (this.config.useLegacy) {
      return `${this.config.useTls ? 'https' : 'http'}://${this.config.host}/sse/log`;
    }
    return `${this.config.useTls ? 'https' : 'http'}://${this.config.host}/sse/?events=log`;
  }

  async start(): Promise<void> {
    this.checkInterval = setInterval(() => {
      if (Date.now() - this.lastMessageTimestamp >= this.keepAliveTimeout) {
        this.logger.warn(`No messages received for ${ms(this.keepAliveTimeout, { long: true })}. Reconnecting...`);
        this.lastMessageTimestamp = Date.now();
        this.stop()
          .then(() => this.start())
          .catch((err) => this.logger.error('Error during reconnection', err));
      }
    }, 5000);

    await Promise.race([
      new Promise<void>((resolve, reject) => {
        this.logger.debug(`Connecting to ${this.config.host}`);
        this.eventSource = new EventSource(this.url, {
          headers: {
            'X-SDTD-API-TOKENNAME': this.config.adminUser,
            'X-SDTD-API-SECRET': this.config.adminToken,
          },
        });

        this.eventSource.addEventListener('logLine', (data) => this.listener(data));

        this.eventSource.onerror = (e) => {
          this.logger.error('Event source error', e);
          return reject(e);
        };
        this.eventSource.onopen = () => {
          this.logger.debug('Opened a SSE channel for server');
          return resolve();
        };
      }),
      new Promise((_resolve, reject) => {
        setTimeout(() => {
          reject(new Error('Timed out'));
        }, 30000);
      }),
    ]);
  }

  async stop(): Promise<void> {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    this.eventSource.removeEventListener('logLine', this.listener);
    this.eventSource.close();
  }

  async parseMessage(logLine: I7DaysToDieEvent) {
    this.logger.silly(`Received message from game server: ${logLine.msg}`);
    if (!logLine.msg || typeof logLine.msg !== 'string') {
      throw new Error('Invalid logLine');
    }

    if (blackListedMessages.some((msg) => logLine.msg.includes(msg))) {
      return;
    }

    if (EventRegexMap[GameEvents.PLAYER_CONNECTED].test(logLine.msg)) {
      const data = await this.handlePlayerConnected(logLine);
      await this.emit(GameEvents.PLAYER_CONNECTED, data);
    }

    if (EventRegexMap[GameEvents.PLAYER_DISCONNECTED].test(logLine.msg)) {
      const data = await this.handlePlayerDisconnected(logLine);
      await this.emit(GameEvents.PLAYER_DISCONNECTED, data);
    }

    if (EventRegexMap[GameEvents.CHAT_MESSAGE].test(logLine.msg)) {
      const data = await this.handleChatMessage(logLine);
      if (data) await this.emit(GameEvents.CHAT_MESSAGE, data);
    }

    if (EventRegexMap[GameEvents.PLAYER_DEATH].test(logLine.msg)) {
      const data = await this.handlePlayerDeath(logLine);
      if (data) await this.emit(GameEvents.PLAYER_DEATH, data);
    }

    if (EventRegexMap[GameEvents.ENTITY_KILLED].test(logLine.msg)) {
      const data = await this.handleEntityKilled(logLine);
      if (data) await this.emit(GameEvents.ENTITY_KILLED, data);
    }

    await this.emit(
      GameEvents.LOG_LINE,
      new EventLogLine({
        msg: logLine.msg,
      }),
    );
  }

  private async handlePlayerConnected(logLine: I7DaysToDieEvent) {
    const nameMatches = /PlayerName='([^']+)/.exec(logLine.msg);
    const platformIdMatches = /PltfmId='(.+)', CrossId=/.exec(logLine.msg);
    const crossIdMatches = /CrossId='(.+)', OwnerID/.exec(logLine.msg);

    const name = nameMatches ? nameMatches[1] : 'Unknown name';
    const platformId = platformIdMatches ? platformIdMatches[1] : null;
    const epicOnlineServicesId = crossIdMatches ? crossIdMatches[1].replace('EOS_', '') : undefined;
    const gameId = epicOnlineServicesId;

    const steamId = platformId && platformId.startsWith('Steam_') ? platformId.replace('Steam_', '') : undefined;
    const xboxLiveId = platformId && platformId.startsWith('XBL_') ? platformId.replace('XBL_', '') : undefined;

    if (!gameId) throw new Error('Could not find gameId');

    return new EventPlayerConnected({
      msg: logLine.msg,
      player: new IGamePlayer({
        name,
        gameId,
        steamId,
        xboxLiveId,
        epicOnlineServicesId,
      }),
    });
  }
  private async handlePlayerDisconnected(logLine: I7DaysToDieEvent) {
    const nameMatch = /PlayerName='([^']+)/.exec(logLine.msg);
    const platformIdMatches = /PltfmId='(.+)', CrossId=/.exec(logLine.msg);
    const crossIdMatches = /CrossId='(.+)', OwnerID/.exec(logLine.msg);

    const name = nameMatch ? nameMatch[1] : 'Unknown name';
    const platformId = platformIdMatches ? platformIdMatches[1] : null;

    const steamId = platformId && platformId.startsWith('Steam_') ? platformId.replace('Steam_', '') : undefined;
    const xboxLiveId = platformId && platformId.startsWith('XBL_') ? platformId.replace('XBL_', '') : undefined;
    const epicOnlineServicesId = crossIdMatches ? crossIdMatches[1].replace('EOS_', '') : undefined;
    const gameId = epicOnlineServicesId;

    if (!gameId) throw new Error('Could not find gameId');

    return new EventPlayerDisconnected({
      msg: logLine.msg,
      player: new IGamePlayer({
        name,
        gameId,
        steamId,
        xboxLiveId,
      }),
    });
  }

  private async handleChatMessage(logLine: I7DaysToDieEvent) {
    const match = EventRegexMap[GameEvents.CHAT_MESSAGE].exec(logLine.msg);
    if (!match) throw new Error('Could not parse chat message');

    const { groups } = match;
    if (!groups) throw new Error('Could not parse chat message');

    const { platformId, name, message, channel } = groups;

    if (platformId === '-non-player-' && name !== 'Server') {
      return;
    }

    const trimmedMessage = message.trim();
    if (this.recentMessages.has(trimmedMessage)) {
      return; // Ignore if recently processed
    }
    this.recentMessages.add(trimmedMessage);
    setTimeout(() => this.recentMessages.delete(trimmedMessage), 1000);

    const xboxLiveId = platformId.startsWith('XBL_') ? platformId.replace('XBL_', '') : undefined;
    const steamId = platformId.startsWith('Steam_') ? platformId.replace('Steam_', '') : undefined;

    if (steamId || xboxLiveId) {
      const id = steamId || xboxLiveId || '';
      const player = await this.sdtd.steamIdOrXboxToGameId(id);

      let detectedChannel: ChatChannel = ChatChannel.GLOBAL;

      switch (channel) {
        case 'Global':
          detectedChannel = ChatChannel.GLOBAL;
          break;
        case 'Party':
          detectedChannel = ChatChannel.TEAM;
          break;
        case 'Friends':
          detectedChannel = ChatChannel.FRIENDS;
          break;
        default:
          break;
      }

      if (player) {
        return new EventChatMessage({
          player,
          channel: detectedChannel,
          msg: trimmedMessage.trim(),
        });
      }
    }
  }

  private async handlePlayerDeath(logLine: I7DaysToDieEvent) {
    if (logLine.msg.includes('[CSMM_Patrons]') && !this.config.useCPM) return;
    if (logLine.msg.includes('GMSG') && this.config.useCPM) return;

    const match = EventRegexMap[GameEvents.PLAYER_DEATH].exec(logLine.msg);
    if (!match) throw new Error('Could not parse player death message');
    const { groups } = match;
    if (!groups) throw new Error('Could not parse player death message');

    const { xCoord, yCoord, zCoord, steamOrXboxId } = groups;

    const player = await this.sdtd.steamIdOrXboxToGameId(steamOrXboxId);

    return new EventPlayerDeath({
      msg: logLine.msg,
      player,
      position: {
        x: parseFloat(xCoord),
        y: parseFloat(yCoord),
        z: parseFloat(zCoord),
      },
    });
  }

  private async handleEntityKilled(logLine: I7DaysToDieEvent) {
    if (logLine.msg.includes('[CSMM_Patrons]') && !this.config.useCPM) return;
    if (logLine.msg.includes('killed by') && this.config.useCPM) return;

    const match = EventRegexMap[GameEvents.ENTITY_KILLED].exec(logLine.msg);
    if (!match) throw new Error('Could not parse entity killed message');
    const { groups } = match;
    if (!groups) throw new Error('Could not parse entity killed message');

    // Extracting the relevant details from the named groups
    const { entityName, entityName2, weapon, steamOrXboxId } = groups;

    const player = await this.sdtd.steamIdOrXboxToGameId(steamOrXboxId);

    // Constructing the EventEntityKilled object with the parsed data
    return new EventEntityKilled({
      msg: logLine.msg,
      entity: entityName || entityName2,
      player,
      weapon: weapon || undefined, // Assuming that 'weapon' might not be present in some log lines
    });
  }

  async listener(data: MessageEvent) {
    this.lastMessageTimestamp = Date.now();

    const parsed = JSON.parse(data.data);
    const messageMatch = this.SSERegex.exec(parsed.msg);
    if (messageMatch && messageMatch[1]) {
      parsed.msg = messageMatch[1];
    }

    await this.parseMessage(parsed);
  }
}
