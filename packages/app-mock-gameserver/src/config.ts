import { Config, IBaseConfig } from '@takaro/config';
import { IAuthConfig, authConfigSchema } from '@takaro/auth';
import { errors } from '@takaro/util';
import { queuesConfigSchema, IQueuesConfig } from '@takaro/queues';

export enum EXECUTION_MODE {
  FIRECRACKER = 'firecracker',
  LOCAL = 'local',
}

interface IMockServerConfig extends IBaseConfig {
  http: {
    port: number;
    allowedOrigins: string[];
  };
  mockserver: {
    name: string;
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
      default: 3002,
      env: 'PORT',
    },
    allowedOrigins: {
      doc: 'The origins that are allowed to access the API',
      format: Array,
      default: [],
      env: 'CORS_ALLOWED_ORIGINS',
    },
  },
  mockserver: {
    name: {
      doc: 'The name of the mock server',
      format: String,
      default: 'default-mock',
      env: 'MOCK_SERVER_NAME',
    },
  },
};

export const config = new Config<
  IMockServerConfig & IQueuesConfig & IAuthConfig
>([configSchema, queuesConfigSchema, authConfigSchema]);
