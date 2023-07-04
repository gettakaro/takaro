import { Worker, Processor } from 'bullmq';
import { logger, ctx, addCounter } from '@takaro/util';
import { getRedisConnectionOptions } from './util/redisConnectionOptions.js';

export abstract class TakaroWorker<T> {
  log = logger('worker');
  public bullWorker: Worker<T, unknown>;

  constructor(name: string, concurrency = 1, fn: Processor<T, unknown>) {
    const label = `worker:${name}`;

    const instrumentedProcessor = ctx.wrap(
      label,
      addCounter(fn, {
        name: label,
        help: `How many jobs were processed by ${name}`,
      })
    );

    this.bullWorker = new Worker(name, instrumentedProcessor as Processor, {
      connection: getRedisConnectionOptions(),
      concurrency,
    });
  }
}
