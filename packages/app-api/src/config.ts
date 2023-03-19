import { Config, IBaseConfig } from '@takaro/config';
import { queuesConfigSchema, IQueuesConfig } from '@takaro/queues';
import { IDbConfig, configSchema as dbConfigSchema } from '@takaro/db';
import { errors } from '@takaro/util';

enum CLUSTER_MODE {
  SINGLE = 'single',
  CLUSTER = 'cluster',
}

interface IHttpConfig extends IBaseConfig {
  http: {
    port: number;
    allowedOrigins: string[];
  };
  auth: {
    adminSecret: string;
    jwtSecret: string;
    jwtExpiresIn: string;
    cookieName: string;
  };
  takaro: {
    clusterMode: CLUSTER_MODE;
    maxVariables: number;
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
  },
  auth: {
    adminSecret: {
      doc: 'The secret used to authenticate admin requests',
      format: String,
      default: null,
      env: 'ADMIN_SECRET',
    },
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
    cookieName: {
      doc: 'The name of the cookie used to store the JWT',
      format: String,
      default: 'takaro-token',
      env: 'COOKIE_NAME',
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
  },
};

export const config = new Config<IHttpConfig & IQueuesConfig & IDbConfig>([
  configSchema,
  queuesConfigSchema,
  dbConfigSchema,
]);
