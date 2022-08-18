import { Config, IBaseConfig } from '@takaro/config';

interface IIntegrationTestConfig extends IBaseConfig {
  host: string;
  auth: {
    adminSecret: string;
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
  },
};

export const integrationConfig = new Config<IIntegrationTestConfig>([
  configSchema,
]);
