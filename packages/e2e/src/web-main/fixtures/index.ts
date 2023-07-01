import playwright, { Page } from '@playwright/test';
import { AdminClient } from '@takaro/apiclient';
import { integrationConfig } from '@takaro/test';
import humanId from 'human-id/dist/index.js';

const { expect, test: base } = playwright;

async function login(page: Page, username: string, password: string) {
  await page.goto('/login');
  await page.getByPlaceholder('hi cutie').click();
  await page.getByPlaceholder('hi cutie').fill(username);
  await page.getByPlaceholder('hi cutie').press('Tab');
  await page.getByLabel('PasswordRequired').fill(password);
  await page.getByRole('button', { name: 'Log in with Email' }).click();
  await expect(page.getByRole('link', { name: 'Takaro' })).toBeVisible();
}

interface IFixtures {
  page: Page;
}

export const test = base.extend<IFixtures>({
  page: async ({ page }, use) => {
    const adminClient = new AdminClient({
      url: integrationConfig.get('host'),
      auth: {
        clientId: integrationConfig.get('auth.adminClientId'),
        clientSecret: integrationConfig.get('auth.adminClientSecret'),
      },
      OAuth2URL: integrationConfig.get('auth.OAuth2URL'),
    });

    const createdDomainRes = await adminClient.domain.domainControllerCreate({
      name: `e2e-${humanId.default()}`.slice(0, 49),
    });

    const data = createdDomainRes.data.data;

    await login(page, data.rootUser.email, data.password);

    await use(page);

    await adminClient.domain.domainControllerRemove(data.createdDomain.id);
  },
});
