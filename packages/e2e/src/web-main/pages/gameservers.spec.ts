import playwright from '@playwright/test';
import { integrationConfig } from '@takaro/test';
import { basicTest } from '../fixtures/index.js';
const { expect } = playwright;

basicTest('Can create gameserver', async ({ page, takaro }) => {
  const { GameServersPage } = takaro;

  const serverName = 'My new server';
  await GameServersPage.create();
  await GameServersPage.nameCreateEdit(serverName);

  await GameServersPage.selectGameServerType('Mock (testing purposes)');

  const hostInput = page.getByPlaceholder('Http://127.0.0.1:3002');
  await hostInput.click();
  await hostInput.fill(integrationConfig.get('mockGameserver.host'));

  // test connection
  await GameServersPage.clickTestConnection();
  await GameServersPage.clickSave();

  await expect(page.getByText(serverName)).toBeVisible();
});

basicTest('Can edit gameserver', async ({ page, takaro }) => {
  const { GameServersPage } = takaro;
  await GameServersPage.goto();
  await expect(page.getByText(GameServersPage.gameServer.name)).toBeVisible();
  await GameServersPage.action('Edit');

  expect(page.url()).toBe(`${integrationConfig.get('frontendHost')}/servers/update/${GameServersPage.gameServer.id}`);

  const newGameServerName = 'My edited mock server';
  await GameServersPage.nameCreateEdit(newGameServerName);
  await GameServersPage.clickTestConnection();
  await GameServersPage.clickSave();
  await expect(page.getByText(newGameServerName)).toBeVisible();
});

basicTest('Can delete gameserver', async ({ page, takaro }) => {
  const gameServerName = 'My gameserver';
  const { GameServersPage } = takaro;
  await GameServersPage.goto();
  await GameServersPage.action('Delete');
  await expect(page.getByText(gameServerName)).toHaveCount(0);
});
