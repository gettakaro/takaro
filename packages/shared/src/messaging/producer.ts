import { JobsOptions, Queue } from 'bullmq';
import { Logger } from 'winston';

import { logger } from '../util';
import { EVENTS } from './events';

export class Producer<T_DATA, T_RETURN> {
  private logger: Logger;
  private bullQueue: Queue<T_DATA, T_RETURN>;

  constructor(eventName: EVENTS) {
    this.bullQueue = new Queue(`takaro:queue:${eventName}`);

    this.logger = logger(`messaging:producer:${eventName}`);
  }

  public async destroy() {
    return this.bullQueue.close();
  }

  public async add(data: T_DATA, opts: JobsOptions = {}) {
    const result = await this.bullQueue.add('job name',data, opts);
    this.logger.info(`Added to bull queue: ${JSON.stringify(data)}`);
    return result;
  }
}
