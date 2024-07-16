import { Config, IBaseConfig } from '@takaro/config';

interface ILoggerConfig extends IBaseConfig {
  logging: {
    level: string;
    json: boolean;
    minimal: boolean;
  };
  sentry: {
    dsn: string;
  };
  posthog: {
    enabled: boolean;
    apiKey: string;
    host: string;
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
  },
  sentry: {
    dsn: {
      default: '',
      doc: 'The Sentry DSN to use.',
      env: 'SENTRY_DSN',
      format: String,
    },
  },
  posthog: {
    enabled: {
      doc: 'Whether to enable Posthog analytics',
      format: Boolean,
      default: false,
      env: 'POSTHOG_ENABLED',
    },
    apiKey: {
      doc: 'The API key for Posthog',
      format: String,
      default: '',
      env: 'POSTHOG_API_KEY',
    },
    host: {
      doc: 'The host for Posthog',
      format: String,
      default: 'https://eu.i.posthog.com',
      env: 'POSTHOG_HOST',
    },
  },
};

export const config = new Config<ILoggerConfig>([configSchema]);
