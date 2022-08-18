import { EventEmitter } from 'node:stream';
import { logger } from '@takaro/logger';
import { IGameEventEmitter } from '../interfaces/eventEmitter';

export class MockEmitter extends EventEmitter implements IGameEventEmitter {
  private logger = logger('Mock');

  constructor() {
    super();
  }

  async start(): Promise<void> {
    console.log('start');
  }

  async stop(): Promise<void> {
    console.log('stop');
  }
}
