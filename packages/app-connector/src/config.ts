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
  gameServerManager: {
    reconnectAfterMs: {
      // eslint-disable-next-line
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
