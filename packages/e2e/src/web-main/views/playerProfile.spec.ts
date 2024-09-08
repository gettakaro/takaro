import { expect } from '@playwright/test';
import { extendedTest } from '../fixtures/index.js';

extendedTest('can view player info', async ({ page, extended }) => {
  const { PlayerProfilePage } = extended;

  await PlayerProfilePage.goto();
  await expect(page.getByText('IP History')).toBeVisible();
  await expect(page.getByText(PlayerProfilePage.player.name)).toBeVisible();
});

extendedTest('Can assign role to player', async ({ page, extended }) => {
  const { PlayerProfilePage } = extended;
  await PlayerProfilePage.assignRole({ roleName: 'Test role' });
  await expect(page.getByText('Test role')).toBeVisible();
});

extendedTest('Can remove role from player', async ({ page, extended }) => {
  const { PlayerProfilePage } = extended;
  await PlayerProfilePage.goto();
  await PlayerProfilePage.assignRole({ roleName: 'Test role' });
  await PlayerProfilePage.unassignRole({ roleName: 'Test role' });
  await expect(page.getByText('Test role')).not.toBeVisible();
});

extendedTest('can view player events', async ({ extended }) => {
  const { PlayerProfilePage } = extended;
  await PlayerProfilePage.gotoEvents();
});
