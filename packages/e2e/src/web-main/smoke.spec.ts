import playwright from '@playwright/test';
import { integrationConfig } from '@takaro/test';
import { basicTest } from './fixtures/index.js';

const { test, expect } = playwright;

test('has title', async ({ page }) => {
  await page.goto(`${integrationConfig.get('frontendHost')}/`);
  await expect(page).toHaveTitle(/Takaro/);
});

basicTest('Can go to dashboard', async ({ page }) => {
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
});

basicTest('Can go to servers', async ({ page }) => {
  await page.getByRole('link', { name: 'Servers' }).click();
  await expect(page.getByRole('heading', { name: 'Servers' })).toBeVisible();
});

basicTest('Can go to players', async ({ page }) => {
  await page.getByRole('link', { name: 'Players' }).click();
  await expect(page.getByRole('heading', { name: 'Players' })).toBeVisible();
});

basicTest('Can go to modules', async ({ page }) => {
  await page.getByRole('link', { name: 'Modules' }).click();
  await expect(page.getByRole('heading', { name: 'Modules' })).toBeVisible();
});

basicTest('Can go to settings', async ({ page }) => {
  await page.getByRole('link', { name: 'Settings' }).click();
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
});
