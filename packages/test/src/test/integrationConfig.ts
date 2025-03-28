import { Config, IBaseConfig } from '@takaro/config';

interface IIntegrationTestConfig extends IBaseConfig {
  host: string;
  frontendHost: string;
  auth: {
    adminClientSecret: string;
    username: string;
    password: string;
  };
  mockGameserver: {
    host: string;
  };
  mailhog: {
    url: string;
  };
  overwriteSnapshots: boolean;
  waitForEventsTimeout: number;
  testRunner: {
    attempts: number;
  };
}

const configSchema = {
  host: {
    doc: 'The host to connect to',
    format: String,
    default: 'http://localhost:3000',
    env: 'TEST_HTTP_TARGET',
  },
  frontendHost: {
    doc: 'The host to connect to',
    format: String,
    default: 'http://localhost:3000',
    env: 'TEST_FRONTEND_TARGET',
  },
  auth: {
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
  },
  mockGameserver: {
    host: {
      doc: 'The host of the mock gameserver',
      format: String,
      default: 'http://takaro:3002',
      env: 'MOCK_GAMESERVER_HOST',
    },
  },
  mailhog: {
    url: {
      doc: 'The URL of the Mailhog server',
      format: String,
      default: 'http://mailhog:8025',
      env: 'MAILHOG_URL',
    },
  },
  overwriteSnapshots: {
    doc: 'Setting this to true will overwrite the snapshots with the current test results instead of reporting errors',
    format: Boolean,
    default: false,
    env: 'OVERWRITE_SNAPSHOTS',
  },
  waitForEventsTimeout: {
    doc: 'During tests, we often wait for a certain event to occur to "solve" the async nature of the tests. This is the timeout for that.',
    format: Number,
    default: 10000,
    env: 'WAIT_FOR_EVENTS_TIMEOUT',
  },
  testRunner: {
    attempts: {
      doc: 'The default number of attempts to run the tests',
      format: Number,
      default: 3,
      env: 'TAKARO_TEST_RUNNER_ATTEMPTS',
    },
  },
};

export const integrationConfig = new Config<IIntegrationTestConfig>([configSchema]);
