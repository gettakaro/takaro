import playwright from '@playwright/test';
import { test } from '../fixtures/index.js';
import { GameServerCreateDTOTypeEnum } from '@takaro/apiclient';
import { integrationConfig } from '@takaro/test';
import { navigateTo } from '../helpers.js';

const { expect } = playwright;

test('Can set global settings', async ({ page }) => {
  navigateTo(page, 'global-settings');
  const serverName = 'My cool server';
  await page.getByLabel('server chat name').fill(serverName);
  await page.getByRole('button', { name: 'Save' }).click();
  await page.reload();
  await expect(page.getByLabel('server chat name')).toHaveValue(serverName);
});

test('Can set server-scoped settings', async ({ page, takaro }) => {
  await takaro.GameServersPage.goto();
  await page.getByText('Test server').click();

  const serverName = 'My cool server';
  await navigateTo(page, 'server-settings');
  await page.getByLabel('server chat name').fill('My cool server');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.reload();

  await expect(page.getByLabel('server chat name')).toHaveValue(serverName);
});

test.fixme('Setting server-scoped setting for server A does not affect server B', async ({ page, takaro }) => {
  await takaro.rootClient.gameserver.gameServerControllerCreate({
    name: 'Second server',
    type: GameServerCreateDTOTypeEnum.Mock,
    connectionInfo: JSON.stringify({
      host: integrationConfig.get('mockGameserver.host'),
    }),
  });

  await takaro.GameServersPage.goto();

  // make sure we click on the server card, and not the select
  await page.getByRole('heading', { name: 'Test server' }).click();

  // open server settings
  await navigateTo(page, 'server-settings');

  // Change the server name
  await page.getByLabel('server chat name').fill('My cool server');
  await page.getByRole('button', { name: 'Save' }).click();

  await takaro.GameServersPage.goto();
  await page.getByRole('heading', { name: 'Second Server' }).click();

  await navigateTo(page, 'server-settings');
  await expect(page.getByLabel('server chat name')).toHaveValue('Takaro');
});
