import { Config, IBaseConfig } from '@takaro/config';
import { queuesConfigSchema, IQueuesConfig } from '@takaro/queues';
import { IDbConfig, configSchema as dbConfigSchema } from '@takaro/db';
import { IAuthConfig, authConfigSchema } from '@takaro/auth';
import { errors } from '@takaro/util';
import ms from 'ms';

enum CLUSTER_MODE {
  SINGLE = 'single',
  CLUSTER = 'cluster',
}

interface IHttpConfig extends IBaseConfig {
  http: {
    port: number;
    allowedOrigins: string[];
    baseUrl: string;
    frontendHost: string;
  };
  auth: {
    jwtSecret: string;
    jwtExpiresIn: string;
    discord: {
      clientId?: string;
      clientSecret?: string;
    };
  };
  influxdb: {
    host: string;
    port: number;
    org: string;
    token: string;
    bucket: string;
  };
  discord: {
    botToken?: string;
  };
  takaro: {
    clusterMode: CLUSTER_MODE;
    maxVariables: number;
    url: string;
    startWorkers: boolean;
    kpiInterval: number;
  };
  steam: {
    apiKey: string;
    refreshOlderThanMs: number;
    refreshBatchSize: number;
  };
}

const configSchema = {
  http: {
    port: {
      doc: 'The port to bind.',
      // This value can be ANYTHING because it is user provided
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      format: (value: unknown) => {
        if (process.env.NODE_ENV === 'test') {
          // This allows us to pass 'undefined' as the port
          // Which lets the tests run without needed to open an actual port
          return value;
        }

        if (typeof value !== 'string' && typeof value !== 'number') {
          throw new errors.ConfigError('Value must be a string or number');
        }

        const parsed = parseInt(value.toString(), 10);

        if (parsed < 0 || parsed > 65535) {
          throw new errors.ConfigError('ports must be within range 0 - 65535');
        }
      },
      default: 3000,
      env: 'PORT',
    },
    allowedOrigins: {
      doc: 'The origins that are allowed to access the API',
      format: Array,
      default: [],
      env: 'CORS_ALLOWED_ORIGINS',
    },
    baseUrl: {
      doc: 'The base URL of the API',
      format: String,
      default: 'http://127.0.0.1:13000',
      env: 'BASE_URL',
    },
    frontendHost: {
      doc: 'The host of the frontend',
      format: String,
      default: 'http://127.0.0.1:13001',
      env: 'TAKARO_FRONTEND_HOST',
    },
  },
  auth: {
    jwtSecret: {
      doc: 'The secret used to sign JWTs',
      format: String,
      default: null,
      env: 'JWT_SECRET',
    },
    jwtExpiresIn: {
      doc: 'The time until a JWT expires',
      format: String,
      default: '1 day',
      env: 'JWT_EXPIRES_IN',
    },
    discord: {
      clientId: {
        doc: 'The client ID for the discord OAuth app',
        format: String,
        default: undefined,
        env: 'DISCORD_CLIENT_ID',
      },
      clientSecret: {
        doc: 'The client secret for the discord OAuth app',
        format: String,
        default: undefined,
        env: 'DISCORD_CLIENT_SECRET',
      },
    },
  },
  discord: {
    botToken: {
      doc: 'The token for the discord bot',
      format: String,
      default: undefined,
      env: 'DISCORD_BOT_TOKEN',
    },
  },
  takaro: {
    clusterMode: {
      doc: 'The mode to run the app in',
      format: ['single', 'cluster'],
      default: CLUSTER_MODE.SINGLE,
      env: 'CLUSTER_MODE',
    },
    maxVariables: {
      doc: 'The maximum number of variables that can be stored per domain',
      format: Number,
      default: 100,
      env: 'MAX_VARIABLES',
    },
    url: {
      doc: 'The URL of the Takaro server',
      format: String,
      default: 'http://localhost:3000',
      env: 'TAKARO_HOST',
    },
    startWorkers: {
      doc: 'Whether to start the workers, this can be used to separate the workers from the API processes',
      format: Boolean,
      default: true,
      env: 'START_WORKERS',
    },
    kpiInterval: {
      doc: 'The interval at which to update the KPI metrics',
      format: Number,
      default: ms('60m'),
      env: 'KPI_INTERVAL',
    },
  },
  influxdb: {
    host: {
      doc: 'The Influxdb host to connect to',
      format: String,
      default: 'localhost',
      env: 'INFLUXDB_HOST',
    },
    port: {
      doc: 'The Influxdb port to connect to',
      format: Number,
      default: 8086,
      env: 'INFLUXDB_PORT',
    },
    org: {
      doc: 'The influxdb organisation to connect with',
      format: String,
      default: '',
      env: 'INFLUXDB_ORG',
    },
    token: {
      doc: 'The Influxdb token to connect with',
      format: String,
      default: '',
      env: 'INFLUXDB_ADMIN_TOKEN',
    },
    batchSize: {
      doc: 'The amount of points to write per batch. Points are only written when the batch is full',
      format: Number,
      default: 5000,
      env: 'INFLUXDB_BATCH_SIZE',
    },
    bucket: {
      doc: 'The Influxdb bucket to use. Temporary until we have multiple buckets',
      format: String,
      default: '',
      env: 'INFLUXDB_BUCKET',
    },
  },
  steam: {
    apiKey: {
      doc: 'The Steam API key',
      format: String,
      default: '',
      env: 'STEAM_API_KEY',
    },
    refreshOlderThanMs: {
      doc: 'Players whose Steam data is older than this will be refreshed',
      format: Number,
      default: ms('1day'),
      env: 'STEAM_REFRESH_OLDER_THAN_MS',
    },
    refreshBatchSize: {
      doc: 'The amount of players to refresh per time the sync runs',
      format: Number,
      default: 100,
      env: 'STEAM_REFRESH_BATCH_SIZE',
    },
  },
};

export const config = new Config<IHttpConfig & IQueuesConfig & IDbConfig & Pick<IAuthConfig, 'kratos' | 'hydra'>>([
  configSchema,
  queuesConfigSchema,
  dbConfigSchema,
  { kratos: authConfigSchema.kratos, hydra: authConfigSchema.hydra },
]);
