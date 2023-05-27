/* eslint-disable @typescript-eslint/no-empty-function */
import 'reflect-metadata';

import { matchSnapshot } from './snapshots.js';
import { integrationConfig } from './main.js';
import { expect } from './test/expect.js';
import {
  AdminClient,
  Client,
  AxiosResponse,
  RoleCreateInputDTOPermissionsEnum,
  isAxiosError,
} from '@takaro/apiclient';

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

export class IntegrationTest<SetupData> {
  protected log = {
    info: () => {},
    error: () => {},
    warn: () => {},
    debug: () => {},
  };

  public readonly adminClient: AdminClient;
  public readonly client: Client;

  public standardDomainId: string | null = null;
  public setupData!: Awaited<SetupData>;
  public standardLogin: { username: string; password: string } = {
    username: '',
    password: '',
  };

  constructor(public test: IIntegrationTest<SetupData>) {
    if (test.snapshot) {
      this.test.expectedStatus = this.test.expectedStatus ?? 200;
      this.test.filteredFields = this.test.filteredFields ?? [];
    }
    this.test.standardEnvironment = this.test.standardEnvironment ?? true;

    this.adminClient = new AdminClient({
      url: integrationConfig.get('host'),
      auth: {
        clientId: integrationConfig.get('auth.adminClientId'),
        clientSecret: integrationConfig.get('auth.adminClientSecret'),
      },
      OAuth2URL: integrationConfig.get('auth.OAuth2URL'),
      log: this.log,
    });

    this.client = new Client({
      url: integrationConfig.get('host'),
      auth: {},
      log: this.log,
    });
  }

  private async setupStandardEnvironment() {
    const createdDomain = await this.adminClient.domain.domainControllerCreate({
      name: `integration-${this.test.name}`.slice(0, 49),
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
    describe(`${this.test.group} - ${this.test.name}`, () => {
      before(async () => {
        if (this.test.standardEnvironment) {
          await this.setupStandardEnvironment();
        }

        if (this.test.setup) {
          try {
            this.setupData = await this.test.setup.bind(this)();
          } catch (error) {
            if (!isAxiosError(error)) {
              throw error;
            }

            console.error(error.response?.data);
            throw new Error(
              `Setup failed: ${JSON.stringify(error.response?.data)}}`
            );
          }
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
            if (!isAxiosError(error)) {
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
          if (!isAxiosError(error)) {
            throw error;
          }

          if (this.test.snapshot) {
            response = error.response;
          } else {
            if (error.response?.data) {
              console.error(error.response?.data);
              throw new Error(
                `Test failed: ${JSON.stringify(error.response?.data)}}`
              );
            }
          }
        }

        if (this.test.snapshot) {
          if (!response) {
            throw new Error('No response returned from test');
          }
          await matchSnapshot(this.test, response);
          expect(response.status).to.equal(this.test.expectedStatus);
        }
      });
    });
  }
}

export async function logInWithPermissions(
  client: Client,
  permissions: RoleCreateInputDTOPermissionsEnum[]
): Promise<Client> {
  const role = await client.role.roleControllerCreate({
    name: 'Test role',
    permissions,
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
