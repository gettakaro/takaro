import playwright from '@playwright/test';
import { basicTest } from '../fixtures/index.js';

const { expect } = playwright;

basicTest('Can create gameserver', async ({ page }) => {
  await page.getByRole('link', { name: 'Servers' }).click();
  const serverName = 'My mock server';

  // click create gameserver card
  await page.getByText('Gameserver').click();

  expect(page.url()).toBe(`${process.env.TAKARO_FRONTEND_HOST}/servers/create`);

  // fill in gameserver name
  const serverNameInput = page.getByPlaceholder('My cool server');
  await serverNameInput.click();
  await serverNameInput.fill(serverName);

  // select gameserver type
  await page.getByText('Select...').click();
  await page
    .getByRole('option', { name: 'Mock (testing purposes)' })
    .locator('div')
    .click();

  const hostInput = page.getByPlaceholder('Http://127.0.0.1:3002');
  await hostInput.click();
  await hostInput.fill('http://127.0.0.1:3002');

  // test connection
  await page.getByRole('button', { name: 'Test connection' }).click();

  // save gameserver
  await page.getByRole('button', { name: 'Save changes' }).click();

  // check if gameserver is in list and has correct name
  await expect(page.getByText(serverName)).toBeVisible();
});

basicTest('Can edit gameserver', async ({ page, takaro }) => {
  const oldGameServerName = 'My old mock server';

  await takaro.client.gameserver.gameServerControllerCreate({
    name: oldGameServerName,
    type: 'MOCK',
    connectionInfo: JSON.stringify({ host: 'http://127.0.0.1:3002' }),
  });

  await page.getByRole('link', { name: 'Servers' }).click();
  await expect(page.getByText(oldGameServerName)).toBeVisible();

  const newGameServerName = 'My edited mock server';

  // click edit gameserver card
  await page.getByRole('list').getByRole('button').click();
  await page.getByText('Edit server').click();

  // edit gameserver name
  const gameServerNameInput = page.getByPlaceholder('My cool server');
  await gameServerNameInput.click();
  await gameServerNameInput.fill(newGameServerName);

  await page.getByRole('button', { name: 'Test connection' }).click();
  await page.getByRole('button', { name: 'Save changes' }).click();

  await expect(page.getByText(newGameServerName)).toBeVisible();
});

basicTest('Can delete gameserver', async ({ page, takaro }) => {
  const gameServerName = 'My gameserver';

  await takaro.client.gameserver.gameServerControllerCreate({
    name: gameServerName,
    type: 'MOCK',
    connectionInfo: JSON.stringify({ host: 'http://127.0.0.1:3002' }),
  });

  await page.getByRole('link', { name: 'Servers' }).click();

  await page.getByRole('list').getByRole('button').click();
  await page.getByText('Delete server').click();
  await page.getByRole('button', { name: 'Delete gameserver' }).click();

  await expect(page.getByText(gameServerName)).toHaveCount(0);
});
