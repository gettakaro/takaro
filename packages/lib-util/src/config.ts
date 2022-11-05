import { Config, IBaseConfig } from '@takaro/config';

interface ILoggerConfig extends IBaseConfig {
  logging: {
    level: string;
    json: boolean;
    minimal: boolean;
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
};

export const config = new Config<ILoggerConfig>([configSchema]);
