import { Config, IBaseConfig } from '@takaro/config';
import { errors } from '@takaro/util';

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
    scenarioInterval: number;
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
    scenarioInterval: {
      doc: 'The interval in which to run random scenarios',
      format: Number,
      default: 1200000,
      env: 'MOCK_SERVER_SCENARIO_INTERVAL',
    },
  },
};

export const config = new Config<IMockServerConfig>([configSchema]);
