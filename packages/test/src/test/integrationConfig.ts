import { Config, IBaseConfig } from '@takaro/config';

interface IIntegrationTestConfig extends IBaseConfig {
  host: string;
  auth: {
    adminSecret: string;
    username: string;
    password: string;
  };
}

const configSchema = {
  host: {
    doc: 'The host to connect to',
    format: String,
    default: 'http://localhost:3000',
    env: 'TEST_HTTP_TARGET',
  },
  auth: {
    adminSecret: {
      doc: 'The secret used to authenticate admin requests',
      format: String,
      default: null,
      env: 'ADMIN_SECRET',
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
  },
};

export const integrationConfig = new Config<IIntegrationTestConfig>([
  configSchema,
]);
