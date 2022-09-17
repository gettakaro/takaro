import { ITestWithSnapshot, matchSnapshot } from './snapshots';
import { integrationConfig } from './main';
import { expect } from './test/expect';
import { logger } from '@takaro/logger';
import { AdminClient, Client, AxiosError } from '@takaro/apiclient';

export class IntegrationTest<SetupData> {
  protected log = logger('IntegrationTest');

  public readonly adminClient: AdminClient;
  public readonly client: Client;

  public standardDomainId: string | null = null;
  public setupData!: Awaited<SetupData>;
  public standardLogin: { username: string; password: string } = {
    username: '',
    password: '',
  };

  constructor(public test: ITestWithSnapshot<SetupData>) {
    this.test.expectedStatus = this.test.expectedStatus ?? 200;
    this.test.filteredFields = this.test.filteredFields ?? [];
    this.test.standardEnvironment = this.test.standardEnvironment ?? true;

    this.adminClient = new AdminClient({
      url: integrationConfig.get('host'),
      auth: {
        adminSecret: integrationConfig.get('auth.adminSecret'),
      },
    });

    this.client = new Client({
      url: integrationConfig.get('host'),
      auth: {},
    });
  }

  private async setupStandardEnvironment() {
    const createdDomain = await this.adminClient.domain.domainControllerCreate({
      name: 'standard-integration-test-domain',
    });
    this.standardDomainId = createdDomain.data.data.domain.id;

    this.client.username = createdDomain.data.data.rootUser.email;
    this.client.password = createdDomain.data.data.password;

    this.standardLogin = {
      username: createdDomain.data.data.rootUser.email,
      password: createdDomain.data.data.password,
    };

    await this.client.login();
  }

  run() {
    describe(`${this.test.group} - ${this.test.name}`, () => {
      before(async () => {
        if (this.test.standardEnvironment) {
          await this.setupStandardEnvironment();
        }

        if (this.test.setup) {
          this.setupData = await this.test.setup.bind(this)();
        }
      });

      after(async () => {
        if (this.test.teardown) {
          await this.test.teardown.bind(this)();
        }

        if (this.standardDomainId) {
          try {
            await this.adminClient.domain.domainControllerRemove(
              this.standardDomainId
            );
          } catch (error) {
            if (!(error instanceof AxiosError)) {
              throw error;
            }
            if (error.response?.status !== 404) {
              throw error;
            }
          }
        }
      });

      it(this.test.name, async () => {
        let response;

        try {
          response = await this.test.test.bind(this)();
        } catch (error) {
          if (error instanceof AxiosError) {
            response = error.response;
          } else {
            throw error;
          }
        }

        if (!response) {
          throw new Error('No response returned from test');
        }

        await matchSnapshot(this.test, response);
        expect(response.status).to.equal(this.test.expectedStatus);
      });
    });
  }
}

export async function logInWithCapabilities(
  client: Client,
  capabilities: string[]
): Promise<Client> {
  const role = await client.role.roleControllerCreate({
    name: 'Test role',
    capabilities,
  });
  const user = await client.user.userControllerCreate({
    email: integrationConfig.get('auth.username'),
    password: integrationConfig.get('auth.password'),
    name: 'Test User',
  });

  await client.user.userControllerAssignRole(
    user.data.data.id,
    role.data.data.id
  );

  client.username = user.data.data.email;
  client.password = integrationConfig.get('auth.password');
  await client.login();

  return client;
}
