import 'reflect-metadata';
import { matchSnapshot } from './snapshots.js';
import { integrationConfig, sandbox } from './main.js';
import { expect } from './test/expect.js';
import { AdminClient, Client, AxiosResponse, isAxiosError, TakaroEventCommandExecuted } from '@takaro/apiclient';
import { randomUUID } from 'crypto';
import { before, it } from 'node:test';

export class IIntegrationTest<SetupData> {
  snapshot!: boolean;
  group!: string;
  name!: string;
  attempts?: number = 0;
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
  } catch {
    console.warn('Failed to clean up dangling domains');
  }
});

export class IntegrationTest<SetupData> {
  protected log = noopLog;

  public readonly adminClient: AdminClient = adminClient;
  public readonly client: Client;

  public standardDomainId: string | null = null;
  public domainRegistrationToken: string | null = null;
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
      maxGameservers: 100,
      maxUsers: 5,
    });
    this.standardDomainId = createdDomain.data.data.createdDomain.id;
    this.domainRegistrationToken = createdDomain.data.data.createdDomain.serverRegistrationToken!;

    this.client.username = createdDomain.data.data.rootUser.email;
    this.client.password = createdDomain.data.data.password;

    this.standardLogin = {
      username: createdDomain.data.data.rootUser.email,
      password: createdDomain.data.data.password,
    };

    await this.client.login();
  }

  async run() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const integrationTestContext = this;
    const maxRetries = this.test.attempts || integrationConfig.get('testRunner.attempts');

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
            `Setup failed: ${error.config?.method} ${error.config?.url} ${JSON.stringify(error.response?.data)}} (Domain ID: ${integrationTestContext.standardDomainId || 'not yet created'})`,
          );
        }
      }
    }

    async function teardown(): Promise<void> {
      if (integrationTestContext.test.teardown) {
        await integrationTestContext.test.teardown.bind(integrationTestContext)();
      }

      if (
        integrationTestContext.setupData &&
        typeof integrationTestContext.setupData === 'object' &&
        'mockservers' in integrationTestContext.setupData
      ) {
        const servers = integrationTestContext.setupData.mockservers as any[];
        for (const mockserver of servers) {
          await mockserver.shutdown();
        }
      }

      if (integrationTestContext.standardDomainId) {
        try {
          const failedFunctionsRes = await integrationTestContext.client.event.eventControllerGetFailedFunctions();

          if (failedFunctionsRes.data.data.length > 0) {
            console.warn(
              `There were ${failedFunctionsRes.data.data.length} failed functions (Domain ID: ${integrationTestContext.standardDomainId})`,
            );
            for (const failedFn of failedFunctionsRes.data.data) {
              const name = (failedFn.meta as TakaroEventCommandExecuted).command?.name;
              const msgs = (failedFn.meta as TakaroEventCommandExecuted)?.result.logs.map((l) => l.msg);
              console.log(`Function with name "${name}" failed with messages: ${msgs}`);
            }
          }
        } catch {
          // Ignore, just reporting
        }

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

    async function executeTest(): Promise<void> {
      let response;
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          if (attempt > 0) {
            console.log(
              `Retry attempt ${attempt}/${maxRetries} for test: ${integrationTestContext.test.name} (Domain ID: ${integrationTestContext.standardDomainId || 'not yet created'})`,
            );
          }

          await setup();

          response = await integrationTestContext.test.test.bind(integrationTestContext)();

          if (integrationTestContext.test.snapshot) {
            if (!response) {
              throw new Error('No response returned from test');
            }
            await matchSnapshot(integrationTestContext.test, response, integrationTestContext.standardDomainId);
            if (response.status !== integrationTestContext.test.expectedStatus) {
              if (integrationTestContext.test.expectedStatus === 200) {
                console.error(JSON.stringify(response.data));
              }
              throw new Error('Unexpected status code from snapshot match');
            }
          }

          // If we reach here, test passed
          return;
        } catch (error) {
          lastError = error as Error;

          if (isAxiosError(error)) {
            if (integrationTestContext.test.snapshot) {
              response = error.response;
              try {
                if (!response) throw new Error('No response returned from test');
                await matchSnapshot(integrationTestContext.test, response, integrationTestContext.standardDomainId);
                expect(response?.status).to.equal(integrationTestContext.test.expectedStatus);
                return; // Snapshot matched, test passed
              } catch (snapshotError) {
                console.log(JSON.stringify(snapshotError, null, 2));
                lastError = snapshotError as Error;
              }
            } else if (error.response?.data) {
              console.error(
                `Attempt ${attempt + 1} failed (Domain ID: ${integrationTestContext.standardDomainId || 'not yet created'}):`,
                error.response?.data,
              );
            }
          }

          // Clean up failed attempt
          await teardown();

          // If this was our last retry, throw the error
          if (attempt === maxRetries) {
            if (isAxiosError(lastError)) {
              console.log(
                `Request ${lastError.config?.method} ${lastError.config?.url} failed with status ${lastError.response?.status} (Domain ID: ${integrationTestContext.standardDomainId || 'not yet created'})`,
              );
              console.log('Response data:');
              console.log(JSON.stringify(lastError.response?.data, null, 2));
              console.log('Request data:');
              console.log(JSON.stringify(lastError.config?.data, null, 2));
              // Throw a sanitized error
              throw new Error(
                `Request ${lastError.config?.method} ${lastError.config?.url} failed with status ${lastError.response?.status} (Domain ID: ${integrationTestContext.standardDomainId || 'not yet created'})`,
              );
            }
            // Wrap non-Axios errors with domain ID information
            throw new Error(
              `${lastError.message} (Domain ID: ${integrationTestContext.standardDomainId || 'not yet created'})`,
            );
          }
        }
      }
    }

    it(integrationTestContext.test.name, async () => {
      try {
        await executeTest();
      } finally {
        await teardown();
      }
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
