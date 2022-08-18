import { EventEmitter } from 'node:stream';
import { logger } from '@takaro/logger';
import EventSource from 'eventsource';
import { JsonObject } from 'type-fest';
import { IGameEventEmitter } from '../interfaces/eventEmitter';
import { GameEvents } from '../interfaces/events';


export class MockEmitter extends EventEmitter implements IGameEventEmitter {
  private logger = logger('Mock');

  constructor() {
    super();
  }

  async start(): Promise<void> { }

  async stop(): Promise<void> { }

}
