import { Config, IBaseConfig } from '@takaro/config';

export interface IAuthConfig extends IBaseConfig {
  kratos: {
    publicUrl: string;
    adminUrl: string;
  };
  hydra: {
    publicUrl: string;
    adminUrl: string;
    adminClientId: string;
    adminClientSecret: string;
  };
  takaro: {
    url: string;
  };
}

export const configSchema = {
  kratos: {
    publicUrl: {
      doc: 'The URL of the Kratos public API',
      format: String,
      default: 'http://kratos:4433',
      env: 'KRATOS_URL',
    },
    adminUrl: {
      doc: 'The URL of the Kratos admin API',
      format: String,
      default: 'http://kratos:4434',
      env: 'KRATOS_ADMIN_URL',
    },
  },
  hydra: {
    publicUrl: {
      doc: 'The URL of the Takaro OAuth server',
      format: String,
      default: 'http://hydra:4444',
      env: 'TAKARO_OAUTH_HOST',
    },
    adminUrl: {
      doc: 'The URL of the Takaro OAuth admin server',
      format: String,
      default: 'http://hydra:4445',
      env: 'TAKARO_OAUTH_ADMIN_HOST',
    },
    adminClientId: {
      doc: 'The client ID to use when authenticating with the Takaro server',
      format: String,
      default: null,
      env: 'ADMIN_CLIENT_ID',
    },
    adminClientSecret: {
      doc: 'The client secret to use when authenticating with the Takaro server',
      format: String,
      default: null,
      env: 'ADMIN_CLIENT_SECRET',
    },
  },
  takaro: {
    url: {
      doc: 'The URL of the Takaro server',
      format: String,
      default: 'http://localhost:3000',
      env: 'TAKARO_HOST',
    },
  },
};

export const config = new Config<IAuthConfig>([configSchema]);
