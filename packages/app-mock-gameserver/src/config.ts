import { Config, IBaseConfig } from '@takaro/config';
import { errors } from '@takaro/util';

export enum EXECUTION_MODE {
  LOCAL = 'local',
}

interface IMockServerConfig extends IBaseConfig {
  http: {
    port: number;
    allowedOrigins: string[];
  };
  ws: {
    url: string;
    maxReconnectAttempts: number;
    reconnectIntervalMs: number;
    heartbeatIntervalMs: number;
  };
  mockserver: {
    name: string;
    registrationToken: string;
    identityToken: string;
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
  ws: {
    url: {
      doc: 'The URL of the WebSocket server',
      format: String,
      default: 'ws://127.0.0.1:3004',
      env: 'T_WS_URL',
    },
    maxReconnectAttempts: {
      doc: 'The maximum number of reconnection attempts before giving up',
      format: Number,
      default: 10,
      env: 'T_WS_MAX_RECONNECT_ATTEMPTS',
    },
    reconnectIntervalMs: {
      doc: 'The interval in milliseconds between reconnection attempts',
      format: Number,
      default: 5000,
      env: 'T_WS_RECONNECT_INTERVAL_MS',
    },
    heartbeatIntervalMs: {
      doc: 'The interval in milliseconds between ping messages',
      format: Number,
      default: 30000,
      env: 'T_WS_HEARTBEAT_INTERVAL_MS',
    },
  },
  mockserver: {
    name: {
      doc: 'The name of the mock server',
      format: String,
      default: 'default-mock',
      env: 'MOCK_SERVER_NAME',
    },
    registrationToken: {
      doc: 'The registration token for the mock server',
      format: String,
      default: 'default-token',
      env: 'TAKARO_MOCK_REGISTRATION_TOKEN',
    },
    identityToken: {
      doc: 'The identity token for the mock server',
      format: String,
      default: 'default-mock',
      env: 'TAKARO_MOCK_IDENTITY_TOKEN',
    },
  },
};

export const config = new Config<IMockServerConfig>([configSchema]);
