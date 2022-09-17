import {
  Processor,
  Queue,
  Worker,
  QueueEvents,
  Job,
  QueueScheduler,
} from 'bullmq';
import { config } from './config';
import { logger } from '@takaro/logger';
import { getRedisConnectionOptions } from './util/redisConnectionOptions';

const log = logger('queue');

export class TakaroQueue<T> extends Queue<T> {
  constructor(name: string) {
    super(name, { connection: getRedisConnectionOptions() });
  }
}

export abstract class TakaroWorker<T> extends Worker<T> {
  log = logger('worker');

  constructor(name: string, fn: Processor<T>) {
    super(name, fn, { connection: getRedisConnectionOptions() });

    this.on('error', (err) => {
      this.log.error(err);
    });

    this.on('completed', (job: Job<T>) => {
      this.log.info(`Job ${job.id} completed`);
    });
  }
}

export interface IJobData {
  function: {
    code: string;
  };
  domainId: string;
  token: string;
}

export class QueuesService {
  private static instance: QueuesService;

  public static getInstance(): QueuesService {
    if (!QueuesService.instance) {
      QueuesService.instance = new QueuesService();
    }
    return QueuesService.instance;
  }

  private workers: TakaroWorker<IJobData>[] = [];

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
  };

  constructor() {
    this.initQueues();
  }

  get queues() {
    return this.queuesMap;
  }

  async registerWorker(worker: TakaroWorker<any>) {
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
