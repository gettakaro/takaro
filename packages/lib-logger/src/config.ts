import { Config, IBaseConfig } from '@takaro/config';

interface ILoggerConfig extends IBaseConfig {
  logging: {
    level: string;
    json: boolean;
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
  },
};

export const config = new Config<ILoggerConfig>([configSchema]);
