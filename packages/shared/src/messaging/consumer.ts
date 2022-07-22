import { Job, Processor, Worker } from 'bullmq';
import winston from 'winston';

import { logger } from '../util';
import { EVENTS } from './events';

export abstract class Consumer<T_DATA, T_RETURN> {
  private logger: winston.Logger;
  private fn: Processor<T_DATA, T_RETURN, string>;
  private bullWorker: Worker<T_DATA, T_RETURN>;
  constructor(eventName: EVENTS, fn: Processor<T_DATA, T_RETURN, string>) {
    this.bullWorker = new Worker(`takaro:queue:${eventName}`, this.process);
    this.fn = fn;

    this.logger = logger(`messaging:consumer:${eventName}`);

    this.bullWorker.on('completed', this.onComplete);
    this.bullWorker.on('failed', this.onFail);
    this.bullWorker.on('error', this.onError);
  }

  onFail(job: Job, failedReason: string) {
    this.logger.error(`Job failed: ${failedReason}`, { jobId: job.id });
  }

  onComplete(job: Job, returnvalue: T_RETURN) {
    this.logger.info(`Job completed: ${returnvalue}`, { jobId: job.id });
  }

  onError(err: Error) {
    this.logger.error(err);
  }

  async process(job: Job) {
    // TODO: We can add tracing here or something...
    const result = await this.fn(job);
    return result;
  }
}
