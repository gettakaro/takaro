import { expect } from '@playwright/test';
import { test } from '../fixtures/index.js';
import { navigateTo } from '../helpers.js';
import { getMockServer } from '@takaro/mock-gameserver';

test('Can set global settings', async ({ page }) => {
  await navigateTo(page, 'global-settings');
  const serverName = 'My cool server';
  await page.getByLabel('server chat name').fill(serverName);
  await page.getByRole('button', { name: 'Save' }).click();
  await page.reload();
  await expect(page.getByLabel('server chat name')).toHaveValue(serverName);
  // TODO: check if the server chat name is also updated in the server settings
});

test('Can set server-scoped settings', async ({ page, takaro }) => {
  await takaro.GameServersPage.goto();
  await page.getByText('Test server').click();

  const serverName = 'My cool server';
  await navigateTo(page, 'server-settings');

  const inheritSelect = page.getByRole('combobox').nth(1);
  await inheritSelect.click();
  await page.getByRole('option', { name: 'override' }).click();
  await page.getByLabel('Server Chat Name').fill('My cool server');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.reload();

  await expect(page.getByLabel('server chat name')).toHaveValue(serverName);
});

test('Setting server-scoped setting for server A does not affect server B', async ({ page, takaro }) => {
  const secondMockServer = await getMockServer({
    mockserver: {
      registrationToken: takaro.domain.createdDomain.serverRegistrationToken,
      identityToken: 'Second server',
    },
  });

  await takaro.GameServersPage.goto();

  // make sure we click on the server card, and not the select
  await page.getByRole('heading', { name: 'Test server' }).click();

  // open server settings
  await navigateTo(page, 'server-settings');

  // Change the server name
  const inheritSelect = page.getByRole('combobox').nth(2);
  await inheritSelect.click();
  await page.getByRole('option', { name: 'override' }).click();
  await page.getByLabel('Server Chat Name').fill('My cool server');
  await page.getByRole('button', { name: 'Save' }).click();

  await takaro.GameServersPage.goto();
  await page.getByRole('heading', { name: 'Second Server' }).click();

  await navigateTo(page, 'server-settings');
  await expect(page.getByText('Takaro').nth(1)).toBeVisible();

  // Clean up the second mock server
  try {
    await secondMockServer.shutdown();
  } catch (error) {
    console.warn('Failed to shutdown second mock server:', error);
  }
});
