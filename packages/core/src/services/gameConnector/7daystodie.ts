import { database, EVENTS, games, IJsonMap, logger } from '@takaro/shared';
import EventSource from 'eventsource';

import { GameConnector } from './base';

interface I7DaysToDieEvent {
  msg: string;
}

const connectedRegex = /(Player connected,)/;
const disconnectedRegex = /(Player disconnected: )/;
const chatRegex = /Chat \(from '(?<steamId>[\w\d-]+)', entity id '(?<entityId>[-\d]+)', to '(?<channel>\w+)'\): '(?<playerName>.+)':(?<messageText>.+)/;


export class SevenDaysToDieGameConnector extends GameConnector {
  private eventSource: EventSource;
  private logger = logger('7D2D:SSE');
  private gameServer: games.SevenDaysToDie;
  private SSERegex = /\d+-\d+-\d+T\d+:\d+:\d+ \d+\.\d+ INF (.+)/;

  constructor(id: string) {
    super(id);
    this.gameServer = new games.SevenDaysToDie(this.id);
  }


  protected async startListening(): Promise<void> {
    this.eventSource = new EventSource('this needs to be the server URL');

    this.eventSource.addEventListener('logLine', this.listener);

    this.eventSource.onerror = e => {
      this.logger.error(e);
    };
    this.eventSource.onopen = () => {
      this.logger.debug('Opened a SSE channel for server');
    };
  }

  protected async stopListening(): Promise<void> {
    this.eventSource.removeEventListener('logLine', this.listener);
    this.eventSource.close();
  }

  async parseMessage(logLine: IJsonMap) {

    if (!logLine.msg || typeof logLine.msg !== 'string') {
      throw new Error('Invalid logLine');
    }

    if (connectedRegex.test(logLine.msg)) {
      return this.handlePlayerConnected(logLine as unknown as I7DaysToDieEvent);
    }

    if (disconnectedRegex.test(logLine.msg)) {
      return this.handlePlayerDisconnected(logLine as unknown as I7DaysToDieEvent);
    }

    if (chatRegex.test(logLine.msg)) {
      return this.handleChatMessage(logLine as unknown as I7DaysToDieEvent);
    }


    return {
      type: EVENTS.LOG_LINE,
      data: logLine
    };
  }

  private async handlePlayerConnected(logLine: I7DaysToDieEvent) {
    const steamIdMatches = /pltfmid=Steam_(\d{17})|steamid=(\d{17})/.exec(logLine.msg);
    const steamId = steamIdMatches[1] || steamIdMatches[2];
    const playerName = /name=(.+), (pltfmid=|steamid=)/.exec(logLine.msg)[1];
    const entityId = /entityid=(\d+)/.exec(logLine.msg)[1];
    //const ip = /ip=([\d.]+)/.exec(logLine.msg)[1];

    const player = await database.Player.findOrCreate({
      gameId: entityId,
      steamId,
      name: playerName,
      server: this.id,
    });

    return {
      type: EVENTS.PLAYER_CONNECTED,
      data: {
        player,
      }
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
    const steamIdMatches = /PltfmId='Steam_(\d{17})|PlayerID='(\d{17})/.exec(logLine.msg);
    const playerNameMatch = /PlayerName='(.+)'/.exec(logLine.msg);
    const entityIDMatch = /EntityID=(\d+)/.exec(logLine.msg);

    if (!steamIdMatches) {
      throw new Error('Could not find steamId');
    }

    const steamId = steamIdMatches[1] || steamIdMatches[2];
    //const ownerID = /OwnerID='(Steam_)?(\d+)/.exec(logLine.msg)[2];

    const player = await database.Player.findOrCreate({
      gameId: entityIDMatch ? entityIDMatch[1] : null,
      steamId,
      name: playerNameMatch ? playerNameMatch[1] : null,
      server: this.id,
    });

    return {
      type: EVENTS.PLAYER_DISCONNECTED,
      data: {
        player,
      }
    };
  }
  private async handleChatMessage(logLine: I7DaysToDieEvent) {
    /*
{
   date: '2018-11-20',
   time: '14:38:03',
   uptime: '2274.494',
   msg: 'Chat (from 'Steam_123456789', entity id '171', to 'Global'): 'Catalysm': $help',
   trace: '',
   type: 'Log'
}
*/


    const { groups: { steamId, entityId, channel, playerName, messageText } } = chatRegex.exec(logLine.msg);

    const data = {
      msg: logLine.msg,
      steamId: steamId.replace('Steam_', ''),
      entityId,
      channel,
      playerName,
      messageText: messageText.trim()
    };

    // Filter out chatmessages that have been handled by some API mod already
    if ((data.steamId === '-non-player-' && data.playerName !== 'Server') || data.entityId === '-1') {
      return {
        type: EVENTS.LOG_LINE,
        data: logLine
      };
    } else {
      return {
        type: EVENTS.CHAT_MESSAGE,
        data: data
      };
    }
  }

  async listener(data: MessageEvent) {
    try {
      const parsed = JSON.parse(data.data);
      const messageMatch = this.SSERegex.exec(parsed.msg);
      if (messageMatch && messageMatch[1]) {
        parsed.msg = messageMatch[1];
      }
      const parsedData = await this.parseMessage(parsed);
      return this.handleMessage(parsedData);
    } catch (error) {
      this.logger.error(error.stack);
    }
  }
}