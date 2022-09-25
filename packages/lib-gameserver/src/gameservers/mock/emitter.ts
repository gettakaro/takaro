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
import { MockConnectionInfo } from '.';

export class MockEmitter extends EventEmitter implements IGameEventEmitter {
  private logger = logger('Mock');
  private interval: NodeJS.Timer | null = null;

  constructor(private config: MockConnectionInfo) {
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
    return this.config.mockPlayers[
      Math.floor(Math.random() * this.config.mockPlayers.length)
    ];
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
