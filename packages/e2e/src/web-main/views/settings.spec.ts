import playwright from '@playwright/test';
import { test } from '../fixtures/index.js';
import { GameServerCreateDTOTypeEnum } from '@takaro/apiclient';
import { integrationConfig } from '@takaro/test';
import { navigateTo } from '../helpers.js';

const { expect } = playwright;

test('Can set global settings', async ({ page }) => {
  navigateTo(page, 'global-settings');
  const serverName = 'My cool server';
  await page.getByLabel('serverChatName').fill(serverName);
  await page.getByRole('button', { name: 'Save' }).click();
  await page.reload();

  await expect(page.getByLabel('serverChatName')).toHaveValue(serverName);
});

test('Can set server-scoped settings', async ({ page, takaro }) => {
  await takaro.GameServersPage.goto();
  await page.getByText('Test server').click();
  await page
    .getByRole('navigation')
    .filter({ hasText: 'ServerDashboardModulesSettings' })
    .getByRole('link', { name: 'Settings' })
    .click();

  await page.getByLabel('serverChatName').fill('My cool server');
  await page.getByRole('button', { name: 'Save' }).click();

  await page.reload();

  await expect(page.getByLabel('serverChatName')).toHaveValue('My cool server');
});

test('Setting server-scoped setting for server A does not affect server B', async ({ page, takaro }) => {
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
  await page
    .getByRole('navigation')
    .filter({ hasText: 'ServerDashboardModulesSettings' })
    .getByRole('link', { name: 'Settings' })
    .click();

  // Change the server name
  await page.getByLabel('serverChatName').fill('My cool server');
  await page.getByRole('button', { name: 'Save' }).click();

  await takaro.GameServersPage.goto();
  await page.getByRole('heading', { name: 'Second Server' }).click();
  await page
    .getByRole('navigation')
    .filter({ hasText: 'ServerDashboardModulesSettings' })
    .getByRole('link', { name: 'Settings' })
    .click();

  await expect(page.getByLabel('serverChatName')).toHaveValue('Takaro');
});
