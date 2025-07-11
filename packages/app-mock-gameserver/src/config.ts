import { Config, IBaseConfig } from '@takaro/config';
import { errors } from '@takaro/util';

export interface IMockServerConfig extends IBaseConfig {
  http: {
    port: number;
    allowedOrigins: string[];
  };
  ws: {
    url: string;
    maxReconnectAttempts: number;
    reconnectIntervalMs: number;
    maxReconnectIntervalMs: number;
    heartbeatIntervalMs: number;
    continuousReconnect: boolean;
  };
  mockserver: {
    name: string;
    registrationToken: string;
    identityToken: string;
  };
  simulation: {
    autoStart: boolean;
    chatFrequency: number;
    chatEnabled: boolean;
    movementFrequency: number;
    movementEnabled: boolean;
    connectionFrequency: number;
    connectionEnabled: boolean;
    deathFrequency: number;
    deathEnabled: boolean;
    killFrequency: number;
    killEnabled: boolean;
    itemFrequency: number;
    itemEnabled: boolean;
  };
  population: {
    totalPlayers: number;
    weekendBoost: number;
    variance: number;
    minThreshold: number;
    maxThreshold: number;
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
      doc: 'The base interval in milliseconds between reconnection attempts',
      format: Number,
      default: 5000,
      env: 'T_WS_RECONNECT_INTERVAL_MS',
    },
    maxReconnectIntervalMs: {
      doc: 'The maximum interval in milliseconds between reconnection attempts (for exponential backoff)',
      format: Number,
      default: 60000,
      env: 'T_WS_MAX_RECONNECT_INTERVAL_MS',
    },
    heartbeatIntervalMs: {
      doc: 'The interval in milliseconds between ping messages',
      format: Number,
      default: 30000,
      env: 'T_WS_HEARTBEAT_INTERVAL_MS',
    },
    continuousReconnect: {
      doc: 'Whether to continuously reconnect indefinitely during initial connection phase',
      format: Boolean,
      default: true,
      env: 'T_WS_CONTINUOUS_RECONNECT',
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
      doc: 'The registration token for the mock server. This is a secret value used to identify into the Takaro domain',
      format: String,
      default: 'default-token',
      env: 'TAKARO_MOCK_REGISTRATION_TOKEN',
    },
    identityToken: {
      doc: 'The identity token for the mock server. This should stay stable, when this changes Takaro will create a new server',
      format: String,
      default: 'default-mock',
      env: 'TAKARO_MOCK_IDENTITY_TOKEN',
    },
  },
  simulation: {
    autoStart: {
      doc: 'Automatically start the activity simulation when the server initializes',
      format: Boolean,
      default: false,
      env: 'MOCK_SIM_AUTO_START',
    },
    chatFrequency: {
      doc: 'Chat message event frequency (0-100%)',
      format: Number,
      default: 50,
      env: 'MOCK_SIM_CHAT_FREQUENCY',
    },
    chatEnabled: {
      doc: 'Enable/disable chat message events',
      format: Boolean,
      default: true,
      env: 'MOCK_SIM_CHAT_ENABLED',
    },
    movementFrequency: {
      doc: 'Player movement event frequency (0-100%)',
      format: Number,
      default: 50,
      env: 'MOCK_SIM_MOVEMENT_FREQUENCY',
    },
    movementEnabled: {
      doc: 'Enable/disable player movement events',
      format: Boolean,
      default: true,
      env: 'MOCK_SIM_MOVEMENT_ENABLED',
    },
    connectionFrequency: {
      doc: 'Connection/disconnection event frequency (0-100%)',
      format: Number,
      default: 50,
      env: 'MOCK_SIM_CONNECTION_FREQUENCY',
    },
    connectionEnabled: {
      doc: 'Enable/disable connection events',
      format: Boolean,
      default: true,
      env: 'MOCK_SIM_CONNECTION_ENABLED',
    },
    deathFrequency: {
      doc: 'Player death event frequency (0-100%)',
      format: Number,
      default: 50,
      env: 'MOCK_SIM_DEATH_FREQUENCY',
    },
    deathEnabled: {
      doc: 'Enable/disable death events',
      format: Boolean,
      default: true,
      env: 'MOCK_SIM_DEATH_ENABLED',
    },
    killFrequency: {
      doc: 'Entity kill event frequency (0-100%)',
      format: Number,
      default: 50,
      env: 'MOCK_SIM_KILL_FREQUENCY',
    },
    killEnabled: {
      doc: 'Enable/disable kill events',
      format: Boolean,
      default: true,
      env: 'MOCK_SIM_KILL_ENABLED',
    },
    itemFrequency: {
      doc: 'Item interaction event frequency (0-100%)',
      format: Number,
      default: 50,
      env: 'MOCK_SIM_ITEM_FREQUENCY',
    },
    itemEnabled: {
      doc: 'Enable/disable item interaction events',
      format: Boolean,
      default: true,
      env: 'MOCK_SIM_ITEM_ENABLED',
    },
  },
  population: {
    totalPlayers: {
      doc: 'Total number of players in the player pool',
      format: Number,
      default: 10,
      env: 'MOCK_TOTAL_PLAYERS',
    },
    weekendBoost: {
      doc: 'Weekend population boost percentage',
      format: Number,
      default: 15,
      env: 'MOCK_POPULATION_WEEKEND_BOOST',
    },
    variance: {
      doc: 'Random variance in population targets (±%)',
      format: Number,
      default: 5,
      env: 'MOCK_POPULATION_VARIANCE',
    },
    minThreshold: {
      doc: 'Minimum population percentage threshold',
      format: Number,
      default: 5,
      env: 'MOCK_POPULATION_MIN_THRESHOLD',
    },
    maxThreshold: {
      doc: 'Maximum population percentage threshold',
      format: Number,
      default: 95,
      env: 'MOCK_POPULATION_MAX_THRESHOLD',
    },
  },
};

export const config = new Config<IMockServerConfig>([configSchema]);
