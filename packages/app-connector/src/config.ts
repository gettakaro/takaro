import { Config, IBaseConfig } from '@takaro/config';
import { queuesConfigSchema, IQueuesConfig } from '@takaro/queues';
import { IAuthConfig, authConfigSchema } from '@takaro/auth';
import { errors } from '@takaro/util';
import ms from 'ms';

interface IConnectorConfig extends IBaseConfig {
  http: {
    port: number;
    allowedOrigins: string[];
  };
  ws: {
    port: number;
    heartbeatIntervalMs: number;
    requestTimeoutMs: number;
  };
  gameServerManager: {
    reconnectAfterMs: number;
    syncIntervalMs: number;
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
      default: 3003,
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
    port: {
      doc: 'The port to bind the WebSocket server to',
      format: 'integer',
      default: 3004,
      env: 'T_WEBSOCKET_PORT',
    },
    heartbeatIntervalMs: {
      doc: 'How often we send a heartbeat to the clients',
      format: 'integer',
      default: ms('30s'),
      env: 'T_WEBSOCKET_HEARTBEAT_INTERVAL_MS',
    },
    requestTimeoutMs: {
      doc: 'How long we wait for a response to a request before timing out',
      format: 'integer',
      default: ms('10s'),
      env: 'T_WEBSOCKET_REQUEST_TIMEOUT_MS',
    },
  },
  gameServerManager: {
    reconnectAfterMs: {
      doc: "If we don't receive a message from a server in this time, we consider it dead and try to reconnect",
      format: 'integer',
      default: ms('5m'),
      env: 'GAMESERVER_MANAGER_RECONNECT_AFTER_MS',
    },
    syncIntervalMs: {
      doc: 'How often we check our current state against the backend',
      format: 'integer',
      default: ms('15m'),
      env: 'GAMESERVER_MANAGER_SYNC_INTERVAL_MS',
    },
  },
};

export const config = new Config<IConnectorConfig & IQueuesConfig & IAuthConfig>([
  configSchema,
  queuesConfigSchema,
  authConfigSchema,
]);
