import { Config, IBaseConfig } from '@takaro/config';

export interface IQueuesConfig extends IBaseConfig {
  queues: {
    commands: {
      name: string;
      concurrency: number;
    };
    cronjobs: {
      name: string;
      concurrency: number;
    };
    hooks: {
      name: string;
      concurrency: number;
    };
    events: {
      name: string;
      concurrency: number;
    };
    connector: {
      name: string;
    };
  };
  redis: {
    host: string;
    port: number;
    username: string;
    password: string;
  };
}

export const queuesConfigSchema = {
  redis: {
    host: {
      doc: 'The host of the redis server',
      format: String,
      default: 'localhost',
      env: 'REDIS_HOST',
    },
    port: {
      doc: 'The port of the redis server',
      format: Number,
      default: 6379,
      env: 'REDIS_PORT',
    },
    username: {
      doc: 'The username of the redis server',
      format: String,
      default: '',
      env: 'REDIS_USERNAME',
    },
    password: {
      doc: 'The password of the redis server',
      format: String,
      default: '',
      env: 'REDIS_PASSWORD',
    },
  },
  queues: {
    commands: {
      name: {
        doc: 'The name of the queue to use for commands',
        format: String,
        default: 'commands',
        env: 'COMMANDS_QUEUE_NAME',
      },
      concurrency: {
        doc: 'The number of commands to run at once',
        format: Number,
        default: 1,
        env: 'COMMANDS_QUEUE_CONCURRENCY',
      },
    },
    cronjobs: {
      name: {
        doc: 'The name of the queue to use for cronjobs',
        format: String,
        default: 'cronjobs',
        env: 'CRONJOBS_QUEUE_NAME',
      },
      concurrency: {
        doc: 'The number of cronjobs to run at once',
        format: Number,
        default: 1,
        env: 'CRONJOBS_QUEUE_CONCURRENCY',
      },
    },
    hooks: {
      name: {
        doc: 'The name of the queue to use for hooks',
        format: String,
        default: 'hooks',
        env: 'HOOKS_QUEUE_NAME',
      },
      concurrency: {
        doc: 'The number of hooks to run at once',
        format: Number,
        default: 1,
        env: 'HOOKS_QUEUE_CONCURRENCY',
      },
    },
    events: {
      name: {
        doc: 'The name of the queue to use for events',
        format: String,
        default: 'events',
        env: 'EVENTS_QUEUE_NAME',
      },
      concurrency: {
        doc: 'The number of events to run at once',
        format: Number,
        default: 1,
        env: 'EVENTS_QUEUE_CONCURRENCY',
      },
    },
    connector: {
      name: {
        doc: 'The name of the queue to use for connector',
        format: String,
        default: 'connector',
        env: 'CONNECTOR_QUEUE_NAME',
      },
    },
  },
};

export const config = new Config<IQueuesConfig>([queuesConfigSchema]);
