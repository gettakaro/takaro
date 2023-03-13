import { Processor, Queue, Worker, QueueEvents, QueueScheduler } from 'bullmq';
import { config } from './config.js';
import { logger, ctx, addCounter } from '@takaro/util';
import { getRedisConnectionOptions } from './util/redisConnectionOptions.js';
import { GameEvents, EventMapping } from '@takaro/gameserver';

const log = logger('queue');

export class TakaroQueue<T> extends Queue<T> {
  constructor(name: string) {
    super(name, { connection: getRedisConnectionOptions() });
  }
}

export abstract class TakaroWorker<T> extends Worker<T, unknown> {
  log = logger('worker');

  constructor(name: string, fn: Processor<T, unknown>) {
    super(
      name,
      ctx.wrap(
        addCounter(fn, {
          name: `worker:${name}`,
          help: `How many jobs were processed by ${name}`,
        })
      ),
      {
        connection: getRedisConnectionOptions(),
      }
    );
  }
}
export interface IJobData {
  function: string;
  domainId: string;
  token: string;
  /**
   * The id of the item that triggered this job (cronjobId, commandId or hookId)
   */
  itemId: string;

  /**
   * The id of the gameserver that triggered this job
   */
  gameServerId: string;
  /**
   * Additional data that can be passed to the job
   * Typically, this depends on what triggered the job
   */
  data?: EventMapping[GameEvents];
}

export interface IEventQueueData {
  type: GameEvents;
  domainId: string;
  gameServerId: string;
  event: EventMapping[GameEvents];
}

export class QueuesService {
  private static instance: QueuesService;

  public static getInstance(): QueuesService {
    if (!QueuesService.instance) {
      QueuesService.instance = new QueuesService();
    }
    return QueuesService.instance;
  }

  private workers: (TakaroWorker<IJobData> | TakaroWorker<IEventQueueData>)[] =
    [];

  private queuesMap = {
    commands: {
      queue: new TakaroQueue<IJobData>(config.get('queues.commands.name')),
      scheduler: new QueueScheduler(config.get('queues.commands.name'), {
        connection: getRedisConnectionOptions(),
      }),
      events: new QueueEvents(config.get('queues.commands.name'), {
        connection: getRedisConnectionOptions(),
      }),
    },
    cronjobs: {
      queue: new TakaroQueue<IJobData>(config.get('queues.cronjobs.name')),
      scheduler: new QueueScheduler(config.get('queues.cronjobs.name'), {
        connection: getRedisConnectionOptions(),
      }),
      events: new QueueEvents(config.get('queues.cronjobs.name'), {
        connection: getRedisConnectionOptions(),
      }),
    },
    hooks: {
      queue: new TakaroQueue<IJobData>(config.get('queues.hooks.name')),
      scheduler: new QueueScheduler(config.get('queues.hooks.name'), {
        connection: getRedisConnectionOptions(),
      }),
      events: new QueueEvents(config.get('queues.hooks.name'), {
        connection: getRedisConnectionOptions(),
      }),
    },
    events: {
      queue: new TakaroQueue<IEventQueueData>(config.get('queues.events.name')),
      scheduler: new QueueScheduler(config.get('queues.events.name'), {
        connection: getRedisConnectionOptions(),
      }),
      events: new QueueEvents(config.get('queues.events.name'), {
        connection: getRedisConnectionOptions(),
      }),
    },
  };

  constructor() {
    this.initQueues();
  }

  get queues() {
    return this.queuesMap;
  }

  async registerWorker(
    worker: TakaroWorker<IJobData> | TakaroWorker<IEventQueueData>
  ) {
    this.workers.push(worker);
    log.info(`Registered worker ${worker.name}`);
  }

  private initQueues() {
    Object.values(this.queuesMap).forEach((queueInfo) => {
      queueInfo.events.on('completed', ({ jobId }) => {
        log.info(`Job ${jobId} completed!`);
      });

      queueInfo.events.on(
        'failed',
        ({ jobId, failedReason }: { jobId: string; failedReason: string }) => {
          log.error(`Job ${jobId} failed :(`, { failedReason });
        }
      );

      log.info(`Initialized queue ${queueInfo.queue.name}`);
    });
  }
}
