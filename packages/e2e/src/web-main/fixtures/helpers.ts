import playwright, { Page } from '@playwright/test';
import { AdminClient } from '@takaro/apiclient';
import { integrationConfig } from '@takaro/test';

const { expect } = playwright;

export async function login(page: Page, username: string, password: string) {
  await page.goto('/login');
  const emailInput = page.getByPlaceholder('hi cutie');
  await emailInput.click();
  await emailInput.fill(username);
  emailInput.press('Tab');
  await emailInput.press('Tab');
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
