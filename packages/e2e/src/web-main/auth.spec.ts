import playwright from '@playwright/test';
import { basicTest } from './fixtures/index.js';
import { integrationConfig } from '@takaro/test';

const { expect, test: pwTest } = playwright;

basicTest('can logout', async ({ page, takaro }) => {
  const user = (await takaro.client.user.userControllerMe()).data.data;

  await page.getByRole('button').filter({ hasText: user.email }).click();
  await page.getByText('Logout').click();
  await page.waitForURL(`${integrationConfig.get('frontendHost')}/login`);
  expect(page.url()).toBe(`${integrationConfig.get('frontendHost')}/login`);
});

pwTest('should redirect to login when not logged in', async ({ page }) => {
  await page.goto('/servers');
  await page.waitForURL(`${integrationConfig.get('frontendHost')}/login`);
  expect(page.url()).toBe(`${integrationConfig.get('frontendHost')}/login`);
});
