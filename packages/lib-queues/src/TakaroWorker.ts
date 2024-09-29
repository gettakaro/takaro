import { Worker, Processor, WorkerOptions } from 'bullmq';
import { logger, ctx, addCounter } from '@takaro/util';
import { getRedisConnectionOptions } from './util/redisConnectionOptions.js';

type WorkerOptionsWithoutConnectionOptions = Omit<WorkerOptions, 'connection'>;

export abstract class TakaroWorker<T> {
  log = logger('worker');
  public bullWorker: Worker<T, unknown>;

  constructor(
    name: string,
    concurrency = 1,
    fn: Processor<T, unknown>,
    extraBullOpts: WorkerOptionsWithoutConnectionOptions = {},
  ) {
    const label = `worker:${name}`;

    const instrumentedProcessor = ctx.wrap(
      label,
      addCounter(fn, {
        name: label,
        help: `How many jobs were processed by ${name}`,
      }),
    );

    this.bullWorker = new Worker(name, instrumentedProcessor as Processor, {
      connection: getRedisConnectionOptions(),
      concurrency,
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 5000 },
      ...extraBullOpts,
    });
  }
}
