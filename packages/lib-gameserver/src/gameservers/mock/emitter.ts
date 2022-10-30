import { logger } from '@takaro/util';
import {
  EventPlayerConnected,
  EventLogLine,
  EventPlayerDisconnected,
  GameEvents,
} from '../../interfaces/events';
import type { Faker } from '@faker-js/faker';
import { MockConnectionInfo } from '.';
import { TakaroEmitter } from '../../TakaroEmitter';

export class MockEmitter extends TakaroEmitter {
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

  private async fireEvent(faker: Faker) {
    const type = this.getRandomFromEnum();
    const data = this.getRandomEvent(faker, type);
    await this.emit(type, data);

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

    switch (type) {
      case GameEvents.PLAYER_CONNECTED:
        event = new EventPlayerConnected({ player: this.mockPlayer() });

        break;
      case GameEvents.PLAYER_DISCONNECTED:
        event = new EventPlayerDisconnected({ player: this.mockPlayer() });
        break;
      default:
        event = new EventLogLine({
          msg: `This is a log line :) - ${faker.random.words()}`,
        });
        break;
    }

    return event;
  }
}
