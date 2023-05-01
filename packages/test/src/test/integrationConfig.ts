import { Config, IBaseConfig } from '@takaro/config';

interface IIntegrationTestConfig extends IBaseConfig {
  host: string;
  auth: {
    adminClientId: string;
    adminClientSecret: string;
    username: string;
    password: string;
    OAuth2URL: string;
  };
  mockGameserver: {
    host: string;
  };
  overwriteSnapshots: boolean;
}

const configSchema = {
  host: {
    doc: 'The host to connect to',
    format: String,
    default: 'http://localhost:3000',
    env: 'TEST_HTTP_TARGET',
  },
  auth: {
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
    username: {
      doc: 'The username used to authenticate requests',
      format: String,
      default: 'takaro-integration-test@test.takaro.io',
      env: 'TEST_USERNAME',
    },
    password: {
      doc: 'The password used to authenticate requests',
      format: String,
      default: 'takaro-test-password',
      env: 'TEST_PASSWORD',
    },
    OAuth2URL: {
      doc: 'The URL of the Takaro OAuth server',
      format: String,
      default: 'http://hydra:4444',
      env: 'TAKARO_OAUTH_HOST',
    },
  },
  mockGameserver: {
    host: {
      doc: 'The host of the mock gameserver',
      format: String,
      default: 'http://127.0.0.1:3002',
      env: 'MOCK_GAMESERVER_HOST',
    },
  },
  overwriteSnapshots: {
    doc: 'Setting this to true will overwrite the snapshots with the current test results instead of reporting errors',
    format: Boolean,
    default: false,
    env: 'OVERWRITE_SNAPSHOTS',
  },
};

export const integrationConfig = new Config<IIntegrationTestConfig>([
  configSchema,
]);
