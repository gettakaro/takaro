import { logger } from '@takaro/util';
import { MockConnectionInfo } from './connectionInfo.js';
import { IEventMap, TakaroEmitter } from '../../TakaroEmitter.js';
import { Socket } from 'socket.io-client';

const log = logger('Mock');
export class MockEmitter extends TakaroEmitter {
  private scopedListener = this.listener.bind(this);

  constructor(private config: MockConnectionInfo, private io: Socket) {
    super();
  }

  async start(): Promise<void> {
    this.io.onAny(this.scopedListener);
  }

  async stop(): Promise<void> {
    this.io.offAny(this.scopedListener);
  }

  private listener(event: keyof IEventMap, args: Parameters<IEventMap[keyof IEventMap]>[0]) {
    log.debug(`Transmitting event ${event}`);
    this.emit(event, args);
  }
}
