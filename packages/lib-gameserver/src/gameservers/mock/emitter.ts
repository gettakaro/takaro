import { EventEmitter } from 'node:stream';
import { logger } from '@takaro/logger';
import { IGameEventEmitter } from '../../interfaces/eventEmitter';
import {
  EventPlayerConnected,
  EventLogLine,
  EventPlayerDisconnected,
  GameEvents,
} from '../../interfaces/events';
import type { Faker } from '@faker-js/faker';
import { IGamePlayer } from '../../interfaces/GamePlayer';

class IMockConfig {
  eventInterval = 60000;

  constructor(config?: Partial<IMockConfig>) {
    if (!config) return;
    Object.assign(this, config);
  }
}

const MockPlayers: IGamePlayer[] = [
  {
    gameId: '1',
    name: 'Jefke',
    steamId: '76561198000000000',
  },
  {
    gameId: '2',
    name: 'Jefke2',
    xboxLiveId: '1234567890123456',
  },
];

export class MockEmitter extends EventEmitter implements IGameEventEmitter {
  private logger = logger('Mock');
  private interval: NodeJS.Timer | null = null;

  constructor(private config: IMockConfig) {
    super();
  }

  async start(): Promise<void> {
    const { faker } = await import('@faker-js/faker');

    setTimeout(() => this.fireEvent(faker), 1000);
    this.interval = setInterval(
      () => this.fireEvent(faker),
      this.config.eventInterval
    );
  }

  async stop(): Promise<void> {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  private fireEvent(faker: Faker) {
    const type = this.getRandomFromEnum();
    const data = this.getRandomEvent(faker, type);
    this.emit(type, data);

    this.logger.debug(`Emitted ${type}`, data);
  }

  private mockPlayer() {
    return MockPlayers[Math.floor(Math.random() * MockPlayers.length)];
  }

  private getRandomFromEnum() {
    const values = Object.values(GameEvents);
    const randomValue = values[Math.floor(Math.random() * values.length)];
    return randomValue;
  }

  private getRandomEvent(faker: Faker, type: string) {
    let event;

    if (type === GameEvents.PLAYER_CONNECTED) {
      event = new EventPlayerConnected({ player: this.mockPlayer() });
    }

    if (type === GameEvents.PLAYER_DISCONNECTED) {
      event = new EventPlayerDisconnected({ player: this.mockPlayer() });
    }

    if (type === GameEvents.LOG_LINE) {
      event = new EventLogLine({
        msg: `This is a log line :) - ${faker.random.words()}`,
      });
    }

    return event;
  }
}
