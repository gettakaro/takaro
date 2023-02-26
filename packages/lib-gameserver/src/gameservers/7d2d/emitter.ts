import { logger } from '@takaro/util';
import EventSource from 'eventsource';
import { JsonObject } from 'type-fest';
import {
  EventChatMessage,
  EventLogLine,
  EventPlayerConnected,
  EventPlayerDisconnected,
  GameEvents,
} from '../../interfaces/events';
import { SdtdConnectionInfo } from '.';
import { TakaroEmitter } from '../../TakaroEmitter';
import { IGamePlayer } from '../../main';

interface I7DaysToDieEvent extends JsonObject {
  msg: string;
}

const EventRegexMap = {
  [GameEvents.PLAYER_CONNECTED]: /(Player connected,)/,
  [GameEvents.PLAYER_DISCONNECTED]: /(Player disconnected: )/,
  [GameEvents.CHAT_MESSAGE]:
    /Chat \(from '(?<platformId>[\w\d-]+)', entity id '(?<entityId>[-\d]+)', to '(?<channel>\w+)'\): '(?<name>.+)':(?<message>.+)/,
};

export class SevenDaysToDieEmitter extends TakaroEmitter {
  private SSERegex = /\d+-\d+-\d+T\d+:\d+:\d+ \d+\.\d+ INF (.+)/;
  private eventSource!: EventSource;
  private logger = logger('7D2D:SSE');

  constructor(private config: SdtdConnectionInfo) {
    super();
  }

  get url() {
    return `${this.config.useTls ? 'https' : 'http'}://${
      this.config.host
    }/sse/log?adminuser=${this.config.adminUser}&admintoken=${
      this.config.adminToken
    }`;
  }

  async start(): Promise<void> {
    this.eventSource = new EventSource(this.url);

    this.eventSource.addEventListener('logLine', (data) => this.listener(data));

    this.eventSource.onerror = (e) => {
      this.logger.error('Event source error', e);
    };
    this.eventSource.onopen = () => {
      this.logger.debug('Opened a SSE channel for server');
    };
  }

  async stop(): Promise<void> {
    this.eventSource.removeEventListener('logLine', this.listener);
    this.eventSource.close();
  }

  async parseMessage(logLine: I7DaysToDieEvent) {
    this.logger.debug(`Received message from game server: ${logLine.msg}`);
    if (!logLine.msg || typeof logLine.msg !== 'string') {
      throw new Error('Invalid logLine');
    }

    if (EventRegexMap[GameEvents.PLAYER_CONNECTED].test(logLine.msg)) {
      const data = this.handlePlayerConnected(logLine);
      await this.emit(GameEvents.PLAYER_CONNECTED, data);
    }

    if (EventRegexMap[GameEvents.PLAYER_DISCONNECTED].test(logLine.msg)) {
      const data = this.handlePlayerDisconnected(logLine);
      await this.emit(GameEvents.PLAYER_DISCONNECTED, data);
    }

    if (EventRegexMap[GameEvents.CHAT_MESSAGE].test(logLine.msg)) {
      const data = this.handleChatMessage(logLine);
      if (data) {
        await this.emit(GameEvents.CHAT_MESSAGE, data);
      }
    }

    await this.emit(
      GameEvents.LOG_LINE,
      new EventLogLine({
        timestamp: new Date().toISOString(),
        msg: logLine.msg,
      })
    );
  }

  private handlePlayerConnected(logLine: I7DaysToDieEvent) {
    const nameMatches = /name=(.+), (pltfmid=|steamid=)/.exec(logLine.msg);
    const gameIdMatches = /entityid=([\d]+),/.exec(logLine.msg);
    const platformIdMatches = /pltfmid=(.+), crossid=/.exec(logLine.msg);
    const crossIdMatches = /crossid=(.+), steamOwner/.exec(logLine.msg);

    const name = nameMatches ? nameMatches[1] : 'Unknown name';
    const gameId = gameIdMatches ? gameIdMatches[1] : null;
    const platformId = platformIdMatches ? platformIdMatches[1] : null;
    const epicOnlineServicesId = crossIdMatches
      ? crossIdMatches[1].replace('EOS_', '')
      : undefined;

    const steamId =
      platformId && platformId.startsWith('Steam_')
        ? platformId.replace('Steam_', '')
        : undefined;
    const xboxLiveId =
      platformId && platformId.startsWith('XBL_')
        ? platformId.replace('XBL_', '')
        : undefined;

    if (!gameId) throw new Error('Could not find gameId');

    return new EventPlayerConnected({
      player: new IGamePlayer({
        name,
        gameId,
        steamId,
        xboxLiveId,
        epicOnlineServicesId,
      }),
    });
  }
  private handlePlayerDisconnected(logLine: I7DaysToDieEvent) {
    const nameMatch = /PlayerName='(.+)'/.exec(logLine.msg);
    const entityIDMatch = /EntityID=(\d+)/.exec(logLine.msg);
    const platformIdMatches = /PltfmId='(.+)', OwnerID=/.exec(logLine.msg);

    const name = nameMatch ? nameMatch[1] : 'Unknown name';
    const gameId = entityIDMatch ? entityIDMatch[1] : null;
    const platformId = platformIdMatches ? platformIdMatches[1] : null;

    const steamId =
      platformId && platformId.startsWith('Steam_')
        ? platformId.replace('Steam_', '')
        : undefined;
    const xboxLiveId =
      platformId && platformId.startsWith('XBL_')
        ? platformId.replace('XBL_', '')
        : undefined;

    if (!gameId) throw new Error('Could not find gameId');

    return new EventPlayerDisconnected({
      player: new IGamePlayer({
        name,
        gameId,
        steamId,
        xboxLiveId,
      }),
    });
  }

  private handleChatMessage(logLine: I7DaysToDieEvent) {
    const match = EventRegexMap[GameEvents.CHAT_MESSAGE].exec(logLine.msg);
    if (!match) throw new Error('Could not parse chat message');

    const { groups } = match;
    if (!groups) throw new Error('Could not parse chat message');

    const { platformId, entityId, name, message } = groups;

    const xboxLiveId = platformId.startsWith('XBL_')
      ? platformId.replace('XBL_', '')
      : undefined;
    const steamId = platformId.startsWith('Steam_')
      ? platformId.replace('Steam_', '')
      : undefined;

    if (
      (platformId === '-non-player-' && name !== 'Server') ||
      entityId === '-1'
    ) {
      return;
    }

    return new EventChatMessage({
      player: new IGamePlayer({
        name,
        steamId,
        xboxLiveId,
        gameId: entityId,
      }),
      msg: message.trim(),
    });
  }

  async listener(data: MessageEvent) {
    const parsed = JSON.parse(data.data);
    const messageMatch = this.SSERegex.exec(parsed.msg);
    if (messageMatch && messageMatch[1]) {
      parsed.msg = messageMatch[1];
    }

    await this.parseMessage(parsed);
  }
}
