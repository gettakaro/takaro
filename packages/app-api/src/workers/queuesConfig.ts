import ms from 'ms';

export interface IQueuesConfig {
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
}

export const queuesConfigSchema = {
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
