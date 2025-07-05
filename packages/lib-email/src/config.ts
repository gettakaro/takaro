import { Config, IBaseConfig } from '@takaro/config';

export interface IMailConfig extends IBaseConfig {
  mail: {
    postmarkApiKey: string;
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
}

export const configSchema = {
  mail: {
    postmarkApiKey: {
      doc: 'The API key for the Postmark mail service.',
      format: String,
      default: '',
      env: 'MAIL_POSTMARK_API_KEY',
    },
    host: {
      doc: 'The host of the mail server.',
      format: String,
      default: 'mailhog',
      env: 'MAIL_HOST',
    },
    port: {
      doc: 'The port of the mail server.',
      format: Number,
      default: 1025,
      env: 'MAIL_PORT',
    },
    secure: {
      doc: 'Whether to use TLS or not.',
      format: Boolean,
      default: false,
      env: 'MAIL_SECURE',
    },
    auth: {
      user: {
        doc: 'The username to use for authentication.',
        format: String,
        default: 'test',
        env: 'MAIL_USER',
      },
      pass: {
        doc: 'The password to use for authentication.',
        format: String,
        default: 'test',
        env: 'MAIL_PASS',
      },
    },
  },
};

export const config = new Config<IMailConfig>([configSchema]);
