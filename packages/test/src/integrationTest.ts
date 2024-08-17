import 'reflect-metadata';
import { matchSnapshot } from './snapshots.js';
import { integrationConfig, sandbox } from './main.js';
import { expect } from './test/expect.js';
import { AdminClient, Client, AxiosResponse, isAxiosError, TakaroEventCommandExecuted } from '@takaro/apiclient';
import { randomUUID } from 'crypto';
import { retry } from '@takaro/util';

export class IIntegrationTest<SetupData> {
  snapshot!: boolean;
  group!: string;
  name!: string;
  standardEnvironment?: boolean = true;
  setup?: (this: IntegrationTest<SetupData>) => Promise<SetupData>;
  teardown?: (this: IntegrationTest<SetupData>) => Promise<void>;
  test!: (this: IntegrationTest<SetupData>) => Promise<AxiosResponse | void>;
  expectedStatus?: number = 200;
  filteredFields?: string[];
}

const noopLog = {
  info: () => {},
  error: () => {},
  warn: () => {},
  debug: () => {},
};

const testDomainPrefix = 'integration-';

const adminClient = new AdminClient({
  url: integrationConfig.get('host'),
  auth: {
    clientSecret: integrationConfig.get('auth.adminClientSecret'),
  },
  log: noopLog,
});

before(async () => {
  try {
    const danglingDomains = await adminClient.domain.domainControllerSearch({
      search: {
        name: [testDomainPrefix],
      },
    });

    await Promise.allSettled(
      danglingDomains.data.data.map((domain) => adminClient.domain.domainControllerRemove(domain.id)),
    );

    if (danglingDomains.data.data.length > 0) {
      console.log(
        `Removed ${danglingDomains.data.data.length} dangling domains. Your previous test run probably failed to clean up properly.`,
      );
    }
  } catch (_error) {
    console.warn('Failed to clean up dangling domains');
  }
});

export class IntegrationTest<SetupData> {
  protected log = noopLog;

  public readonly adminClient: AdminClient = adminClient;
  public readonly client: Client;

  public standardDomainId: string | null = null;
  public setupData!: Awaited<SetupData>;
  public standardLogin: { username: string; password: string } = {
    username: '',
    password: '',
  };

  constructor(public test: IIntegrationTest<SetupData>) {
    if (test.snapshot) {
      this.test.expectedStatus ??= 200;
      this.test.filteredFields ??= [];
    }
    this.test.standardEnvironment ??= true;
    this.client = new Client({
      url: integrationConfig.get('host'),
      auth: {},
      log: this.log,
    });
  }

  private async setupStandardEnvironment() {
    const createdDomain = await this.adminClient.domain.domainControllerCreate({
      name: `${testDomainPrefix}-${randomUUID()}`.slice(0, 49),
    });
    this.standardDomainId = createdDomain.data.data.createdDomain.id;

    this.client.username = createdDomain.data.data.rootUser.email;
    this.client.password = createdDomain.data.data.password;

    this.standardLogin = {
      username: createdDomain.data.data.rootUser.email,
      password: createdDomain.data.data.password,
    };

    await this.client.login();
  }

  run() {
    // Mocha has no way to access mocha context from a arrow function
    // see: https://mochajs.org/#arrow-functions
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const integrationTestContext = this;

    describe(`${this.test.group} - ${this.test.name}`, function () {
      this.retries(integrationConfig.get('mocha.retries'));

      async function setup(): Promise<void> {
        sandbox.restore();

        if (integrationTestContext.test.standardEnvironment) {
          await integrationTestContext.setupStandardEnvironment();
        }

        if (integrationTestContext.test.setup) {
          try {
            integrationTestContext.setupData = await integrationTestContext.test.setup.bind(integrationTestContext)();
          } catch (error) {
            if (!isAxiosError(error)) {
              throw error;
            }

            console.error(error.response?.data);
            throw new Error(
              `Setup failed: ${error.config?.method} ${error.config?.url} ${JSON.stringify(error.response?.data)}}`,
            );
          }
        }
      }

      async function teardown(): Promise<void> {
        const failedFunctionsRes = await integrationTestContext.client.event.eventControllerGetFailedFunctions();

        if (failedFunctionsRes.data.data.length > 0) {
          console.error(`There were ${failedFunctionsRes.data.data.length} failed functions`);
          for (const failedFn of failedFunctionsRes.data.data) {
            const name = (failedFn.meta as TakaroEventCommandExecuted).command?.name;
            const msgs = (failedFn.meta as TakaroEventCommandExecuted)?.result.logs.map((l) => l.msg);
            console.log(`Function with name "${name}" failed with messages: ${msgs}`);
          }
        }

        if (integrationTestContext.test.teardown) {
          await integrationTestContext.test.teardown.bind(integrationTestContext)();
        }

        if (integrationTestContext.standardDomainId) {
          try {
            await integrationTestContext.adminClient.domain.domainControllerRemove(
              integrationTestContext.standardDomainId,
            );
          } catch (error) {
            if (!isAxiosError(error)) {
              throw error;
            }
            if (error.response?.status !== 404) {
              throw error;
            }
          }
        }
      }

      async function test(): Promise<void> {
        let response;

        try {
          response = await integrationTestContext.test.test.bind(integrationTestContext)();
        } catch (error) {
          if (!isAxiosError(error)) {
            throw error;
          }

          if (integrationTestContext.test.snapshot) {
            response = error.response;
          } else if (error.response?.data) {
            console.error(error.response?.data);
            throw new Error(`Test failed: ${error.response.config.url} ${JSON.stringify(error.response?.data)}}`);
          }
        }

        if (integrationTestContext.test.snapshot) {
          if (!response) {
            throw new Error('No response returned from test');
          }
          await matchSnapshot(integrationTestContext.test, response);
          expect(response.status).to.equal(integrationTestContext.test.expectedStatus);
        }
      }

      const retryableSetup = () =>
        retry(
          setup,
          integrationConfig.get('mocha.waitBetweenRetries'),
          integrationConfig.get('mocha.retries'),
          teardown,
        );
      const retryableTeardown = () =>
        retry(
          teardown,
          integrationConfig.get('mocha.waitBetweenRetries'),
          integrationConfig.get('mocha.retries'),
          async () => {},
        );

      beforeEach(retryableSetup);
      afterEach(retryableTeardown);

      it(integrationTestContext.test.name, () =>
        retry(
          test,
          integrationConfig.get('mocha.waitBetweenRetries'),
          integrationConfig.get('mocha.retries'),
          async () => {
            await retryableTeardown();
            await retryableSetup();
          },
        ),
      );
    });
  }
}

export async function logInWithPermissions(client: Client, permissions: string[]): Promise<Client> {
  const permissionRecords = await client.role.roleControllerGetPermissions();
  const permissionInputs = permissionRecords.data.data
    .filter((p) => permissions.includes(p.permission))
    .map((p) => ({
      permissionId: p.id,
    }));

  const role = await client.role.roleControllerCreate({
    name: 'Test role',
    permissions: permissionInputs,
  });
  const user = await client.user.userControllerCreate({
    email: integrationConfig.get('auth.username'),
    password: integrationConfig.get('auth.password'),
    name: 'Test User',
  });

  await client.user.userControllerAssignRole(user.data.data.id, role.data.data.id);

  client.username = user.data.data.email;
  client.password = integrationConfig.get('auth.password');
  await client.login();

  return client;
}
