import playwright from '@playwright/test';
import { AdminClient } from '@takaro/apiclient';
import { integrationConfig } from '@takaro/test';
import { TEST_IDS } from './testIds.js';

export async function login(page: playwright.Page, username: string, password: string) {
  await page.goto('/login');
  const emailInput = page.getByPlaceholder('hi cutie');
  await emailInput.click();
  await emailInput.fill(username);
  emailInput.press('Tab');
  await emailInput.press('Tab');
  await page.getByLabel('PasswordRequired').fill(password);
  await page.getByRole('button', { name: 'Log in with Email' }).click();
  await page.waitForLoadState('networkidle');
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
export async function navigateTo(page: playwright.Page, to: toOptions) {
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
