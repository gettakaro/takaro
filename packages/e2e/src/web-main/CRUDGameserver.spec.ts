import playwright from '@playwright/test';
import { integrationConfig } from '@takaro/test';
import { test } from './fixtures/index.js';

const { expect } = playwright;

test('Can create gameserver', async ({ page }) => {
  await page.getByRole('link', { name: 'Servers' }).click();
  const serverName = 'My mock server';

  // click create gameserver card
  await page.getByText('Gameserver').click();

  expect(page.url()).toBe(`${process.env.TAKARO_FRONTEND_HOST}/servers/create`);

  // fill in gameserver name
  await page.getByPlaceholder('My cool server').click();
  await page.getByPlaceholder('My cool server').fill(serverName);

  // select gameserver type
  await page.getByText('Select...').click();
  await page
    .getByRole('option', { name: 'Mock (testing purposes)' })
    .locator('div')
    .click();

  // set mock gameserver url
  await page.getByPlaceholder('http://127.0.0.1:3002').click();
  await page
    .getByPlaceholder('http://127.0.0.1:3002')
    .fill('http://127.0.0.1:3002');

  // test connection
  await page.getByRole('button', { name: 'Test connection' }).click();

  // save gameserver
  await page.getByRole('button', { name: 'Save changes' }).click();

  // check if gameserver is in list and has correct name
  await expect(page.getByText(serverName)).toBeVisible();
});

test('Can edit gameserver', async ({ takaroHelpers, page }) => {
  const apiClient = takaroHelpers.client;

  await apiClient.gameserver.gameServerControllerCreate({
    name: 'My cool server',
    type: 'MOCK',
    connectionInfo: JSON.stringify({ host: 'http://127.0.0.1:3002' }),
  });

  await expect(page.getByText('My cool server')).toBeVisible();

  const newServerName = 'My edited mock server';

  // click edit gameserver card
  await page.getByRole('list').getByRole('button').click();
  await page.getByText('Edit server').click();

  expect(page.url()).toBe(
    `${integrationConfig.get('frontendHost')}/servers/edit`
  );

  // edit gameserver name
  await page.getByText('My cool server').click();
  await page.getByPlaceholder('My cool server').fill(newServerName);

  // save gameserver
  await page.getByRole('button', { name: 'Test connection' }).click();
  await page.getByRole('button', { name: 'Save changes' }).click();

  await expect(page.getByText(newServerName)).toBeVisible();
});

test('Can delete gameserver', async ({ page }) => {
  await page.getByRole('link', { name: 'Servers' }).click();

  // wait for gameserver list to load
  await page.waitForSelector('ul > div');

  await page.getByRole('list').getByRole('button').click();
  await page.getByText('Delete server').click();
  await page.getByRole('button', { name: 'Delete gameserver' }).click();

  expect(page.getByRole('list')).not.toHaveText('My edited mock server');
});
