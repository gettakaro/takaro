import { logger } from '@takaro/util';
import { GenericConnectionInfo } from './connectionInfo.js';
import { TakaroEmitter } from '../../TakaroEmitter.js';
import { EventMapping, GameEventTypes } from '@takaro/modules';

const log = logger('Generic');
export class GenericEmitter extends TakaroEmitter {
  private scopedListener = this.privateListener.bind(this);

  constructor(private config: GenericConnectionInfo) {
    super();
  }

  async start(): Promise<void> {
    // No-op, generic connectors initiate the connection
  }

  async stop(): Promise<void> {
    // No-op, generic connectors initiate the connection
  }

  get listener() {
    return this.scopedListener;
  }

  private async privateListener(event: GameEventTypes, args: any) {
    log.debug(`Transmitting event ${event}`);
    const dto = EventMapping[event];

    if (dto) {
      this.emit(event, new dto(args));
    } else {
      this.emit(event, args);
    }
  }
}
