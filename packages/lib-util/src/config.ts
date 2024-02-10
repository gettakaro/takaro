import { Config, IBaseConfig } from '@takaro/config';

interface ILoggerConfig extends IBaseConfig {
  logging: {
    level: string;
    json: boolean;
    minimal: boolean;
    testLoggingLevel: string;
  };
  sentry: {
    dsn: string;
  };
}

const configSchema = {
  logging: {
    json: {
      default: false,
      doc: 'Whether to log in JSON format.',
      env: 'LOGGING_JSON',
      format: Boolean,
    },
    level: {
      default: 'info',
      doc: 'The level to log at.',
      env: 'LOGGING_LEVEL',
      format: String,
    },
    minimal: {
      default: false,
      doc: 'Log minimal data, use for local development.',
      env: 'LOGGING_MINIMAL',
      format: Boolean,
    },
    testLoggingLevel: {
      doc: 'The logging level to use during tests',
      format: String,
      default: 'error',
      env: 'TEST_LOGGING_LEVEL',
    },
  },
  sentry: {
    dsn: {
      default: '',
      doc: 'The Sentry DSN to use.',
      env: 'SENTRY_DSN',
      format: String,
    },
  },
};

export const config = new Config<ILoggerConfig>([configSchema]);
