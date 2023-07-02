import playwright, { Page } from '@playwright/test';
import {
  AdminClient,
  Client,
  GameServerCreateDTOTypeEnum,
} from '@takaro/apiclient';
import { integrationConfig } from '@takaro/test';
import humanId from 'human-id/dist/index.js';

const { expect, test: base } = playwright;

export async function login(page: Page, username: string, password: string) {
  await page.goto('/login');
  await page.getByPlaceholder('hi cutie').click();
  await page.getByPlaceholder('hi cutie').fill(username);
  await page.getByPlaceholder('hi cutie').press('Tab');
  await page.getByLabel('PasswordRequired').fill(password);
  await page.getByRole('button', { name: 'Log in with Email' }).click();
  await expect(page.getByRole('link', { name: 'Takaro' })).toBeVisible();
}

export const getAdminClient = () => {
  return new AdminClient({
    url: integrationConfig.get('host'),
    auth: {
      clientId: integrationConfig.get('auth.adminClientId'),
      clientSecret: integrationConfig.get('auth.adminClientSecret'),
    },
    OAuth2URL: integrationConfig.get('auth.OAuth2URL'),
  });
};

interface IFixtures {
  adminPage: { client: Client; adminClient: AdminClient };
}

export const minimalTest = base.extend<IFixtures>({
  adminPage: [
    async ({ page }, use) => {
      // fixture setup
      const adminClient = getAdminClient();
      const createdDomainRes = await adminClient.domain.domainControllerCreate({
        name: `e2e-${humanId.default()}`.slice(0, 49),
      });

      const data = createdDomainRes.data.data;
      await login(page, data.rootUser.email, data.password);

      const client = new Client({
        url: integrationConfig.get('host'),
        auth: {
          username: data.rootUser.email,
          password: data.password,
        },
      });
      await client.login();

      await use({ client, adminClient });

      // fixture teardown
      await adminClient.domain.domainControllerRemove(data.createdDomain.id);
    },
    { auto: true },
  ],
});

export const test = base.extend<IFixtures>({
  adminPage: [
    async ({ page }, use) => {
      const adminClient = getAdminClient();
      const createdDomainRes = await adminClient.domain.domainControllerCreate({
        name: `e2e-${humanId.default()}`.slice(0, 49),
      });

      const data = createdDomainRes.data.data;
      await login(page, data.rootUser.email, data.password);

      const client = new Client({
        url: integrationConfig.get('host'),
        auth: {
          username: data.rootUser.email,
          password: data.password,
        },
      });
      await client.login();

      await client.gameserver.gameServerControllerCreate({
        name: 'Test server',
        type: GameServerCreateDTOTypeEnum.Mock,
        connectionInfo: JSON.stringify({
          host: 'http://127.0.0.1:3002',
        }),
      });

      await client.module.moduleControllerCreate({
        name: 'Test module',
        configSchema: JSON.stringify({}),
        description: 'Test module',
      });

      /* TODO: should probably add more custom modules with complex config schemas
       * probably a good idea to add one for each type of config field
       */

      await use({ client, adminClient });

      // fixture teardown
      await adminClient.domain.domainControllerRemove(data.createdDomain.id);
    },
    { auto: true },
  ],
});
