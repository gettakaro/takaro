import { Config, IBaseConfig } from '@takaro/config';
import { queuesConfigSchema, IQueuesConfig } from './workers/queuesConfig.js';
import { IDbConfig, configSchema as dbConfigSchema } from '@takaro/db';
import { IAuthConfig, authConfigSchema } from '@takaro/auth';
import { IRedisConfig, redisConfigSchema } from '@takaro/queues';
import { errors } from '@takaro/util';
import ms from 'ms';

interface IApiConfig extends IBaseConfig, IQueuesConfig, IRedisConfig {
  http: {
    port: number;
    allowedOrigins: string[];
    baseUrl: string;
    frontendHost: string;
    domainCookie: {
      secure: boolean;
      sameSite: string;
      domain: string;
    };
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
    handleEvents: boolean;
  };
  takaro: {
    maxVariables: number;
    url: string;
    startWorkers: boolean;
    kpiInterval: number;
    connector: {
      host: string;
    };
  };
  steam: {
    apiKey: string;
    refreshOlderThanMs: number;
    refreshBatchSize: number;
  };
  metrics: {
    prometheusUrl: string;
    pushgatewayUrl: string;
  };
}

const configSchema = {
  http: {
    port: {
      doc: 'The port to bind.',
      // This value can be ANYTHING because it is user provided

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
    domainCookie: {
      secure: {
        doc: 'Whether the domain cookie is secure',
        format: Boolean,
        default: false,
        env: 'DOMAIN_COOKIE_SECURE',
      },
      sameSite: {
        doc: 'The SameSite attribute of the domain cookie',
        format: String,
        default: 'strict',
        env: 'DOMAIN_COOKIE_SAME_SITE',
      },
      domain: {
        doc: 'The domain of the domain cookie',
        format: String,
        default: '127.0.0.1',
        env: 'DOMAIN_COOKIE_DOMAIN',
      },
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
    handleEvents: {
      doc: 'Whether to handle discord events. When running multiple instances, only one should handle events',
      format: Boolean,
      default: true,
      env: 'DISCORD_HANDLE_EVENTS',
    },
  },
  takaro: {
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
    connector: {
      host: {
        doc: 'The host of the connector',
        format: String,
        default: 'http://localhost:3003',
        env: 'CONNECTOR_HOST',
      },
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
  metrics: {
    prometheusUrl: {
      doc: 'The URL of the Prometheus server',
      format: String,
      default: 'http://prometheus:9090',
      env: 'PROMETHEUS_URL',
    },
    pushgatewayUrl: {
      doc: 'The URL of the Prometheus pushgateway',
      format: String,
      default: 'http://pushgateway:9091',
      env: 'PUSHGATEWAY_URL',
    },
  },
};

export const config = new Config<IApiConfig & IDbConfig & Pick<IAuthConfig, 'kratos' | 'adminClientSecret'>>([
  configSchema,
  queuesConfigSchema,
  redisConfigSchema,
  dbConfigSchema,
  { kratos: authConfigSchema.kratos, adminClientSecret: authConfigSchema.adminClientSecret },
]);
