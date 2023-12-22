import { Config, IBaseConfig } from '@takaro/config';
import { queuesConfigSchema, IQueuesConfig } from '@takaro/queues';
import { IDbConfig, configSchema as dbConfigSchema } from '@takaro/db';
import { IAuthConfig, authConfigSchema } from '@takaro/auth';
import { errors } from '@takaro/util';

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
  discord: {
    botToken?: string;
  };
  takaro: {
    clusterMode: CLUSTER_MODE;
    maxVariables: number;
    url: string;
    startWorkers: boolean;
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
  },
};

export const config = new Config<IHttpConfig & IQueuesConfig & IDbConfig & Pick<IAuthConfig, 'kratos' | 'hydra'>>([
  configSchema,
  queuesConfigSchema,
  dbConfigSchema,
  { kratos: authConfigSchema.kratos, hydra: authConfigSchema.hydra },
]);
