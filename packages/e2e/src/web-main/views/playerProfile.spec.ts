import playwright from '@playwright/test';
import { extendedTest } from '../fixtures/index.js';
const { expect } = playwright;

extendedTest('can view global player info', async ({ page, extended }) => {
  const { PlayerProfilePage } = extended;

  await PlayerProfilePage.goto();

  await expect(page.getByText(PlayerProfilePage.player.name)).toBeVisible();
  await expect(page.getByText(PlayerProfilePage.player.id)).toBeVisible();
});

extendedTest('can view player inventory', async ({ page, extended }) => {
  const { PlayerProfilePage } = extended;

  await PlayerProfilePage.gotoInventory();

  await expect(page.getByText('Wood')).toBeVisible();
  await expect(page.getByText('Stone')).toBeVisible();
});

extendedTest('can view player events', async ({ page, extended }) => {
  const { PlayerProfilePage } = extended;

  await PlayerProfilePage.gotoEvents();

  await expect(page.getByText('No events found')).toBeVisible();
});

extendedTest('can view player economy', async ({ page, extended }) => {
  const { PlayerProfilePage } = extended;

  await PlayerProfilePage.gotoEconomy();

  await expect(page.getByText('Coming soon')).toBeVisible();
});
