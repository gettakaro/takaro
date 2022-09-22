import { EventEmitter } from 'node:stream';
import { logger } from '@takaro/logger';
import { IGameEventEmitter } from '../../interfaces/eventEmitter';
import {
  EventPlayerConnected,
  EventLogLine,
  EventPlayerDisconnected,
  GameEvents,
} from '../../interfaces/events';
import { JsonObject } from 'type-fest';
import { Faker } from '@faker-js/faker';

const allEvents = Object.keys(GameEvents);

class IMockConfig {
  allowedEvents = allEvents;
  interval = 60000;

  constructor(config?: Partial<IMockConfig>) {
    if (!config) return;
    Object.assign(this, config);
  }
}

export class MockEmitter extends EventEmitter implements IGameEventEmitter {
  private logger = logger('Mock');
  private interval: NodeJS.Timer | null = null;

  async start(config: JsonObject): Promise<void> {
    const { faker } = await import('@faker-js/faker');

    const mockConfig = new IMockConfig(config);

    setTimeout(() => this.fireEvent(faker), 1000);
    this.interval = setInterval(
      () => this.fireEvent(faker),
      mockConfig.interval
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

  private mockPlayer(faker: Faker) {
    return {
      name: faker.internet.userName(),
      platformId: faker.random.words(),
    };
  }

  private getRandomFromEnum() {
    const values = Object.values(GameEvents);
    const randomValue = values[Math.floor(Math.random() * values.length)];
    return randomValue;
  }

  private getRandomEvent(faker: Faker, type: string) {
    let event;

    if (type === GameEvents.PLAYER_CONNECTED) {
      event = new EventPlayerConnected();
      event.player = this.mockPlayer(faker);
    }

    if (type === GameEvents.PLAYER_DISCONNECTED) {
      event = new EventPlayerDisconnected();
      event.player = this.mockPlayer(faker);
    }

    if (type === GameEvents.LOG_LINE) {
      event = new EventLogLine();
      event.msg = `This is a log line :) - ${faker.random.words()}`;
    }

    return event;
  }
  public executeRawCommand(command: string): string {
    // TODO: implement
    return command;
  }
}
