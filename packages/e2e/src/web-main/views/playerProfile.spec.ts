import playwright from '@playwright/test';
import { extendedTest } from '../fixtures/index.js';
const { expect } = playwright;

extendedTest('can view player info', async ({ page, extended }) => {
  const { PlayerProfilePage } = extended;

  await PlayerProfilePage.goto();
  await expect(page.getByText('IP History')).toBeVisible();
  await expect(page.getByText(PlayerProfilePage.player.name)).toBeVisible();
});

extendedTest('can view player events', async ({ extended }) => {
  const { PlayerProfilePage } = extended;

  await PlayerProfilePage.gotoEvents();
});

extendedTest('can view player economy', async ({ page, extended }) => {
  const { PlayerProfilePage } = extended;
  await PlayerProfilePage.gotoEconomy();
  await expect(page.getByText('Coming soon')).toBeVisible();
});
