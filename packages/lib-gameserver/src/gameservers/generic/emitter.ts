import { errors, logger } from '@takaro/util';
import { GenericConnectionInfo } from './connectionInfo.js';
import { TakaroEmitter } from '../../TakaroEmitter.js';
import { EventMapping, GameEventTypes } from '@takaro/modules';
import EventEmitter from 'events';

const log = logger('Generic');
export class GenericEmitter extends TakaroEmitter {
  private scopedListener = this.listener.bind(this);
  private nodeEventEmitter: EventEmitter;

  constructor(private config: GenericConnectionInfo) {
    super();
  }

  async start(nodeEventEmitter?: EventEmitter): Promise<void> {
    if (!nodeEventEmitter) {
      log.error('No nodeEventEmitter provided, required for generic emitter');
      throw new errors.InternalServerError();
    }
    this.nodeEventEmitter = nodeEventEmitter;

    this.nodeEventEmitter.on('gameEvent', this.scopedListener);
  }

  async stop(): Promise<void> {
    this.nodeEventEmitter.removeAllListeners();
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
