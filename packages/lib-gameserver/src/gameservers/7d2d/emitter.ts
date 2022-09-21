import { EventEmitter } from 'node:stream';
import { logger } from '@takaro/logger';
import EventSource from 'eventsource';
import { JsonObject } from 'type-fest';
import { IGameEventEmitter } from '../../interfaces/eventEmitter';
import { GameEvents } from '../../interfaces/events';

interface I7DaysToDieEvent {
  msg: string;
}

const EventRegexMap = {
  [GameEvents.PLAYER_CONNECTED]: /(Player connected,)/,
  [GameEvents.PLAYER_DISCONNECTED]: /(Player disconnected: )/,
};

export class SevenDaysToDieEmitter
  extends EventEmitter
  implements IGameEventEmitter {
  // TODO: also listen to other loglevels
  private SSERegex = /\d+-\d+-\d+T\d+:\d+:\d+ \d+\.\d+ INF (.+)/;
  private eventSource!: EventSource;
  private logger = logger('7D2D:SSE');

  constructor() {
    super();
  }

  async start(): Promise<void> {
    this.eventSource = new EventSource('this needs to be the server URL');

    this.eventSource.addEventListener('logLine', this.listener);

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

  async parseMessage(logLine: JsonObject) {
    if (!logLine.msg || typeof logLine.msg !== 'string') {
      throw new Error('Invalid logLine');
    }

    if (EventRegexMap[GameEvents.PLAYER_CONNECTED].test(logLine.msg)) {
      const data = this.handlePlayerConnected(
        logLine as unknown as I7DaysToDieEvent
      );
      this.emit(GameEvents.PLAYER_CONNECTED, data);
    }

    if (EventRegexMap[GameEvents.PLAYER_DISCONNECTED].test(logLine.msg)) {
      const data = this.handlePlayerDisconnected(
        logLine as unknown as I7DaysToDieEvent
      );
      this.emit(GameEvents.PLAYER_DISCONNECTED, data);
    }

    this.emit(GameEvents.LOG_LINE, {
      timestamp: new Date(),
      msg: logLine.msg,
    });

    return {
      type: GameEvents.LOG_LINE,
      data: logLine,
    };
  }

  private async handlePlayerConnected(logLine: I7DaysToDieEvent) {
    /*     const steamIdMatches = /pltfmid=Steam_(\d{17})|steamid=(\d{17})/.exec(
          logLine.msg
        ); */
    // const steamId = steamIdMatches[1] || steamIdMatches[2];
    // const playerName = /name=(.+), (pltfmid=|steamid=)/.exec(logLine.msg)[1];
    // const entityId = /entityid=(\d+)/.exec(logLine.msg)[1];
    //const ip = /ip=([\d.]+)/.exec(logLine.msg)[1];

    return {
      player: logLine,
    };
  }
  private async handlePlayerDisconnected(logLine: I7DaysToDieEvent) {
    /*
{
  "date": "2017-11-14",
  "time": "14:51:40",
  "uptime": "184.829",
  "msg": "Player disconnected: EntityID=171, PlayerID='76561198028175941', OwnerID='76561198028175941', PlayerName='Catalysm'",
  "trace": "",
  "type": "Log"
}
*/
    /*     const steamIdMatches = /PltfmId='Steam_(\d{17})|PlayerID='(\d{17})/.exec(
          logLine.msg
        );
        const playerNameMatch = /PlayerName='(.+)'/.exec(logLine.msg);
        const entityIDMatch = /EntityID=(\d+)/.exec(logLine.msg);

        if (!steamIdMatches) {
          throw new Error('Could not find steamId');
        }

        const steamId = steamIdMatches[1] || steamIdMatches[2]; */
    //const ownerID = /OwnerID='(Steam_)?(\d+)/.exec(logLine.msg)[2];

    /*     const player = await database.Player.findOrCreate({
          gameId: entityIDMatch ? entityIDMatch[1] : null,
          steamId,
          name: playerNameMatch ? playerNameMatch[1] : null,
          server: this.id,
        }); */

    return {
      player: logLine,
    };
  }

  async listener(data: MessageEvent) {
    try {
      const parsed = JSON.parse(data.data);
      const messageMatch = this.SSERegex.exec(parsed.msg);
      if (messageMatch && messageMatch[1]) {
        parsed.msg = messageMatch[1];
      }

      await this.parseMessage(parsed);
    } catch (error) {
      this.logger.error('Error handling message from game server', error);
    }
  }
}
