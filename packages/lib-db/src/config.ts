import { Config, IBaseConfig, baseConfigConvict } from '@takaro/config';

export interface IDbConfig extends IBaseConfig {
  postgres: {
    connectionString: string;
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    ssl: boolean;
    ca: string;
  };
  redis: {
    host: string;
    port: number;
    username: string;
    password: string;
  };
  systemSchema: string;
  baseDomainSchema: string;
  encryptionKey: string;
}

export const configSchema = {
  postgres: {
    connectionString: {
      doc: 'The Postgres connection string to use',
      format: String,
      default: '',
      env: 'POSTGRES_CONNECTION_STRING',
    },
    host: {
      doc: 'The Postgres host to connect to',
      format: String,
      default: 'localhost',
      env: 'POSTGRES_HOST',
    },
    port: {
      doc: 'The Postgres port to connect to',
      format: Number,
      default: 5432,
      env: 'POSTGRES_PORT',
    },
    user: {
      doc: 'The Postgres user to connect as',
      format: String,
      default: 'postgres',
      env: 'POSTGRES_USER',
    },
    password: {
      doc: 'The Postgres password to use',
      format: String,
      default: 'postgres',
      env: 'POSTGRES_PASSWORD',
    },
    database: {
      doc: 'The Postgres database to use',
      format: String,
      default: 'postgres',
      env: 'POSTGRES_DB',
    },
    ssl: {
      doc: 'Whether to use SSL for the connection',
      format: Boolean,
      default: false,
      env: 'POSTGRES_SSL',
    },
    ca: {
      doc: 'The CA certificate to use for SSL connections',
      format: String,
      default: '',
      env: 'POSTGRES_CA',
    },
  },
  redis: {
    host: {
      doc: 'The host of the redis server',
      format: String,
      default: 'localhost',
      env: 'REDIS_HOST',
    },
    port: {
      doc: 'The port of the redis server',
      format: Number,
      default: 6379,
      env: 'REDIS_PORT',
    },
    username: {
      doc: 'The username of the redis server',
      format: String,
      default: '',
      env: 'REDIS_USERNAME',
    },
    password: {
      doc: 'The password of the redis server',
      format: String,
      default: '',
      env: 'REDIS_PASSWORD',
    },
  },
  systemSchema: {
    doc: 'The Postgres schema to use for system-related actions (like domain management)',
    format: String,
    default: 'takaro',
    env: 'POSTGRES_SYSTEM_SCHEMA',
  },
  baseDomainSchema: {
    doc: 'String used as base for creating name of domain-scoped schemas',
    format: String,
    default: 'domain_',
    env: 'POSTGRES_BASE_DOMAIN_SCHEMA',
  },
  encryptionKey: {
    doc: 'Encryption key used for encrypting sensitive data',
    format: String,
    default: null,
    env: 'POSTGRES_ENCRYPTION_KEY',
  },
};

export const config = new Config<IDbConfig>([configSchema, baseConfigConvict]);
