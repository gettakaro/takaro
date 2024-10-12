import { logger } from '@takaro/util';
import { MinecraftConnectionInfo } from './connectionInfo.js';
import { TakaroEmitter } from '../../TakaroEmitter.js';
import { Socket } from 'socket.io-client';
import { EventMapping, GameEventTypes } from '@takaro/modules';

const log = logger('Mock');
export class MinecraftEmitter extends TakaroEmitter {
  private scopedListener = this.listener.bind(this);

  constructor(
    private config: MinecraftConnectionInfo,
    private io: Socket,
  ) {
    super();
  }

  async start(): Promise<void> {
    this.io.onAny(this.scopedListener);
  }

  async stop(): Promise<void> {
    this.io.removeAllListeners();
    this.io.disconnect();
  }

  private async listener(event: GameEventTypes, args: any) {
    log.debug(`Transmitting event ${event}`);
    const dto = EventMapping[event];

    if (dto) {
      this.emit(event, new dto(args));
    } else {
      this.emit(event, args);
    }
  }
}
