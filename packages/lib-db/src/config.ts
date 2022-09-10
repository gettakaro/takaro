import { Config, IBaseConfig, baseConfigConvict } from '@takaro/config';

interface IDbConfig extends IBaseConfig {
  postgres: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  };
  systemSchema: string;
  baseDomainSchema: string;
  systemMigrationsPath: string;
  domainScopedMigrationsPath: string;
}

const configSchema = {
  postgres: {
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
};

export const config = new Config<IDbConfig>([configSchema, baseConfigConvict]);
