import playwright from '@playwright/test';
import { test } from './fixtures/index.js';

const { test: pwTest, expect } = playwright;

pwTest('has title', async ({ page }) => {
  await page.goto(`${process.env.TAKARO_FRONTEND_HOST}/`);
  await expect(page).toHaveTitle(/Takaro/);
});

test('Can go to dashboard', async ({ page }) => {
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
});

test('Can go to servers', async ({ page }) => {
  await page.getByRole('link', { name: 'Servers' }).click();
  await expect(page.getByRole('heading', { name: 'Servers' })).toBeVisible();
});

test('Can go to players', async ({ page }) => {
  await page.getByRole('link', { name: 'Players' }).click();
  await expect(page.getByRole('heading', { name: 'Players' })).toBeVisible();
});

test('Can go to modules', async ({ page }) => {
  await page.getByRole('link', { name: 'Modules' }).click();
  await expect(page.getByRole('heading', { name: 'Modules' })).toBeVisible();
});

test('Can go to settings', async ({ page }) => {
  await page.getByRole('link', { name: 'Settings' }).click();
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
});
