import { Config, IBaseConfig } from '@takaro/config';

export enum EXECUTION_MODE {
  CONTAINERD = 'containerd',
  LOCAL = 'local',
}

interface IAgentConfig extends IBaseConfig {
  http: {
    port: number;
  };
  takaro: {
    url: string;
  };
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
  };
  redis: {
    host: string;
    port: number;
    username: string;
    password: string;
    tlsCa: string;
  };
  functions: {
    executionMode: EXECUTION_MODE;
  };
  containerd: {
    executablePath: string;
    namespace: string;
  };
}

const configSchema = {
  http: {
    port: {
      doc: 'The port to bind.',
      // This value can be ANYTHING because it is user provided
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      format: (value: any) => {
        if (process.env.NODE_ENV === 'test') {
          // This allows us to pass 'undefined' as the port
          // Which lets the tests run without needed to open an actual port
          return value;
        }
        value = parseInt(value, 10);

        if (value < 0 || value > 65535) {
          throw new Error('ports must be within range 0 - 65535');
        }
      },
      default: 3001,
      env: 'PORT',
    },
  },
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
    tlsCa: {
      doc: 'Optional TLS certificate, if the redis server is using TLS',
      format: String,
      default: '',
      env: 'REDIS_TLS_CA',
    },
  },
  functions: {
    executionMode: {
      doc: 'The mode to use when executing functions. Setting to "local" is VERY INSECURE! Only do it if you know what you are doing',
      format: [EXECUTION_MODE.CONTAINERD, EXECUTION_MODE.LOCAL],
      default: EXECUTION_MODE.CONTAINERD,
      env: 'FUNCTIONS_EXECUTION_MODE',
    },
  },
  containerd: {
    executablePath: {
      doc: 'The path to the nerdctl executable',
      format: String,
      default: '/home/catalysm/.local/bin/nerdctl',
      env: 'CONTAINERD_EXECUTABLE_PATH',
    },
    namespace: {
      doc: 'The namespace to use for containerd',
      format: String,
      default: 'takaro',
      env: 'CONTAINERD_NAMESPACE',
    },
  },
  takaro: {
    url: {
      doc: 'The URL of the Takaro server',
      format: String,
      default: 'http://localhost:3000',
      env: 'TAKARO_HOST',
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
  },
};

export const config = new Config<IAgentConfig>([configSchema]);
