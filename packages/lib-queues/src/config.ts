import { Config, IBaseConfig } from '@takaro/config';
import ms from 'ms';

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
    itemsSync: {
      name: string;
      interval: number;
    };
    bansSync: {
      name: string;
      interval: number;
    };
    steamSync: {
      name: string;
      interval: number;
    };
    playerSync: {
      name: string;
      interval: number;
      concurrency: number;
    };
    kpi: {
      name: string;
      interval: number;
      concurrency: number;
    };
    csmmImport: {
      name: string;
    };
    system: {
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
        default: 10,
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
        default: 10,
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
        default: 10,
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
        default: 10,
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
    itemsSync: {
      name: {
        doc: 'The name of the queue to use for items sync',
        format: String,
        default: 'itemsSync',
        env: 'ITEMS_SYNC_QUEUE_NAME',
      },
      interval: {
        doc: 'The interval to run the items sync',
        format: Number,
        default: ms('1hour'),
        env: 'ITEMS_SYNC_QUEUE_INTERVAL',
      },
    },
    bansSync: {
      name: {
        doc: 'The name of the queue to use for bans sync',
        format: String,
        default: 'bansSync',
        env: 'BANS_SYNC_QUEUE_NAME',
      },
      interval: {
        doc: 'The interval to run the bans sync',
        format: Number,
        default: ms('1hour'),
        env: 'BANS_SYNC_QUEUE_INTERVAL',
      },
    },
    steamSync: {
      name: {
        doc: 'The name of the queue to use for steam sync',
        format: String,
        default: 'steamSync',
        env: 'STEAM_SYNC_QUEUE_NAME',
      },
      interval: {
        doc: 'The interval to run the steam sync',
        format: Number,
        default: ms('60minutes'),
        env: 'STEAM_SYNC_QUEUE_INTERVAL',
      },
    },
    playerSync: {
      name: {
        doc: 'The name of the queue to use for player sync',
        format: String,
        default: 'playerSync',
        env: 'PLAYER_SYNC_QUEUE_NAME',
      },
      interval: {
        doc: 'The interval to run the player sync',
        format: Number,
        default: ms('30seconds'),
        env: 'PLAYER_SYNC_QUEUE_INTERVAL',
      },
      concurrency: {
        doc: 'Job concurrency',
        format: Number,
        default: 5,
        env: 'PLAYER_SYNC_QUEUE_CONCURRENCY',
      },
    },
    kpi: {
      name: {
        doc: 'The name of the queue',
        format: String,
        default: 'kpi',
        env: 'KPI_QUEUE_NAME',
      },
      interval: {
        doc: 'The interval to run',
        format: Number,
        default: ms('60m'),
        env: 'KPI_QUEUE_INTERVAL',
      },
      concurrency: {
        doc: 'Job concurrency',
        format: Number,
        default: 5,
        env: 'KPI_QUEUE_CONCURRENCY',
      },
    },
    csmmImport: {
      name: {
        doc: 'The name of the queue to use for csmm import',
        format: String,
        default: 'csmmImport',
        env: 'CSMM_IMPORT_QUEUE_NAME',
      },
    },
    system: {
      name: {
        doc: 'The name of the queue to use for system',
        format: String,
        default: 'system',
        env: 'SYSTEM_QUEUE_NAME',
      },
    },
  },
};

export const config = new Config<IQueuesConfig>([queuesConfigSchema]);
