import type { Page } from '@playwright/test';
import { test } from '@playwright/test';

import { AdminClient } from '@takaro/apiclient';
import { integrationConfig } from '@takaro/test';
import { TEST_IDS } from './testIds.js';

export async function login(page: Page, username: string, password: string) {
  await test.step('Login', async () => {
    await page.goto('/login');
    const emailInput = page.getByPlaceholder('hi cutie');
    await emailInput.click();
    await emailInput.fill(username);
    await page.getByLabel('PasswordRequired').fill(password);
    await page.getByRole('button', { name: 'Log in with Email' }).click();
    await page.waitForURL((url) => url.pathname !== '/login', {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(1000); // wait 1 second to ensure context is loaded?
  });
}

type toOptions =
  | 'global-settings'
  | 'global-servers'
  | 'global-events'
  | 'global-players'
  | 'global-users'
  | 'global-modules'
  | 'global-variables'
  | 'global-roles'
  | 'global-dashboard'
  | 'server-settings'
  | 'server-dashboard'
  | 'server-modules';
export async function navigateTo(page: Page, to: toOptions) {
  const [n, opt] = to.split('-');
  const nav = n === 'global' ? page.getByTestId(TEST_IDS.GLOBAL_NAV) : page.getByTestId(TEST_IDS.SERVER_NAV);
  const link = opt.charAt(0).toUpperCase() + opt.slice(1);
  await nav.getByRole('link', { name: link }).click();
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
