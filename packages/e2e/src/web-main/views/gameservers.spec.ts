import playwright from '@playwright/test';
import { integrationConfig } from '@takaro/test';
import { test } from '../fixtures/index.js';
const { expect } = playwright;

test('Can use call to action if there are no gameservers', async ({ page, takaro }) => {
  // by default we always create 1 gameserver in the test setup
  // lets delete it so we can test the call to action popup in navbar
  const { GameServersPage } = takaro;
  await GameServersPage.goto();
  await GameServersPage.action('Delete');
  await expect(page.getByText(takaro.gameServer.name)).toHaveCount(0);
  await page.getByRole('button').getByText('Add a server').click();
  expect(page).toHaveURL(`${integrationConfig.get('frontendHost')}/servers/create`);
});

// currently broken because when server is created the selectedGameServerId is set to the newly created server
// But for some reason this redirects the page to the server specific dashboard instead of staying on the gameservers page.
test('Can create gameserver', async ({ page, takaro }) => {
  await page.goto('/');

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

  await expect(page.getByRole('heading', { name: serverName })).toBeVisible();
});

test('Should show error when creating a gameserver with name that already exists', async ({ page, takaro }) => {
  const { GameServersPage } = takaro;
  const serverName = 'My new server';

  await GameServersPage.create();
  await GameServersPage.nameCreateEdit(serverName);
  await GameServersPage.selectGameServerType('Mock (testing purposes)');
  const hostInputs1 = page.getByPlaceholder('Http://127.0.0.1:3002');
  await hostInputs1.click();
  await hostInputs1.fill(integrationConfig.get('mockGameserver.host'));
  await GameServersPage.clickTestConnection();
  await GameServersPage.clickSave();
  await expect(page.getByRole('heading', { name: serverName })).toBeVisible();

  await GameServersPage.create();
  await GameServersPage.nameCreateEdit(serverName);
  await GameServersPage.selectGameServerType('Mock (testing purposes)');
  const hostInputs2 = page.getByPlaceholder('Http://127.0.0.1:3002');
  await hostInputs2.click();
  await hostInputs2.fill(integrationConfig.get('mockGameserver.host'));
  await GameServersPage.clickTestConnection();
  await GameServersPage.clickSave();
  await expect(page.getByText('Game server with this name already exists')).toBeVisible();
});

test('Should show error when updating a gameserver with name that already exists', async ({ page, takaro }) => {
  const { GameServersPage } = takaro;
  const serverName = 'My new server';

  // create secondary server
  await GameServersPage.create();
  await GameServersPage.nameCreateEdit(serverName);
  await GameServersPage.selectGameServerType('Mock (testing purposes)');
  const hostInputs1 = page.getByPlaceholder('Http://127.0.0.1:3002');
  await hostInputs1.click();
  await hostInputs1.fill(integrationConfig.get('mockGameserver.host'));
  await GameServersPage.clickTestConnection();
  await GameServersPage.clickSave();
  await expect(page.getByRole('heading', { name: serverName })).toBeVisible();

  // this will edit the first server and try to set the name to the same as the second server
  await GameServersPage.action('Edit');
  await GameServersPage.nameCreateEdit(serverName);
  await GameServersPage.clickTestConnection();
  await GameServersPage.clickSave();
  await expect(page.getByText('Game server with this name already exists')).toBeVisible();
});

test('Can edit gameserver', async ({ page, takaro }) => {
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

test('Can delete gameserver', async ({ page, takaro }) => {
  const { GameServersPage } = takaro;
  await GameServersPage.goto();
  await GameServersPage.action('Delete');
  await expect(page.getByText(GameServersPage.gameServer.name)).toHaveCount(0);
});

test.describe('Dashboard', () => {
  test.describe('Command history', () => {
    test('Pressing arrow up should show last command', async ({ takaro }) => {
      const { GameServersPage } = takaro;
      await GameServersPage.gotoGameServerConsole();

      await GameServersPage.page.getByPlaceholder('Type here to execute a command..').type('Command 1');
      await GameServersPage.page.keyboard.press('Enter');

      await expect(GameServersPage.page.getByPlaceholder('Type here to execute a command..')).toHaveValue('');

      await GameServersPage.page.getByPlaceholder('Type here to execute a command..').click();
      await GameServersPage.page.keyboard.press('ArrowUp');
      await expect(GameServersPage.page.getByPlaceholder('Type here to execute a command..')).toHaveValue('Command 1');
    });
    test('Pressing up arrow twice should show the command before the last', async ({ takaro }) => {
      const { GameServersPage } = takaro;

      await GameServersPage.gotoGameServerConsole();
      await GameServersPage.page.getByPlaceholder('Type here to execute a command..').type('Command 1');
      await GameServersPage.page.keyboard.press('Enter');

      await GameServersPage.page.getByPlaceholder('Type here to execute a command..').type('Command 2');
      await GameServersPage.page.keyboard.press('Enter');

      await GameServersPage.page.getByPlaceholder('Type here to execute a command..').click();
      await GameServersPage.page.keyboard.press('ArrowUp');
      await GameServersPage.page.keyboard.press('ArrowUp');

      await expect(GameServersPage.page.getByPlaceholder('Type here to execute a command..')).toHaveValue('Command 1');
    });

    test('Pressing down arrow after pressing up arrow should return to last command', async ({ takaro }) => {
      const { GameServersPage } = takaro;

      await GameServersPage.gotoGameServerConsole();
      await GameServersPage.page.getByPlaceholder('Type here to execute a command..').type('Command 1');
      await GameServersPage.page.keyboard.press('Enter');

      await GameServersPage.page.getByPlaceholder('Type here to execute a command..').click();
      await GameServersPage.page.keyboard.press('ArrowUp');
      await GameServersPage.page.keyboard.press('ArrowDown');

      await expect(GameServersPage.page.getByPlaceholder('Type here to execute a command..')).toHaveValue('');
    });

    test('Reaching top of history and pressing up arrow again should not change input', async ({ takaro }) => {
      const { GameServersPage } = takaro;

      await GameServersPage.gotoGameServerConsole();
      await GameServersPage.page.getByPlaceholder('Type here to execute a command..').type('Command 1');
      await GameServersPage.page.keyboard.press('Enter');

      await GameServersPage.page.getByPlaceholder('Type here to execute a command..').click();
      await GameServersPage.page.keyboard.press('ArrowUp');
      await GameServersPage.page.keyboard.press('ArrowUp');

      await expect(GameServersPage.page.getByPlaceholder('Type here to execute a command..')).toHaveValue('Command 1');
    });

    test('Reaching bottom or empty command and pressing down arrow should not change input', async ({ takaro }) => {
      const { GameServersPage } = takaro;

      await GameServersPage.gotoGameServerConsole();
      await GameServersPage.page.getByPlaceholder('Type here to execute a command..').click();
      await GameServersPage.page.keyboard.press('ArrowDown');

      await expect(GameServersPage.page.getByPlaceholder('Type here to execute a command..')).toHaveValue('');
    });

    test('Command history should have a cap of 50 commands', async ({ takaro }) => {
      const { GameServersPage } = takaro;

      await GameServersPage.gotoGameServerConsole();

      for (let i = 1; i <= 52; i++) {
        await GameServersPage.page.getByPlaceholder('Type here to execute a command..').type(`Command ${i}`);
        await GameServersPage.page.keyboard.press('Enter');
      }

      await GameServersPage.page.getByPlaceholder('Type here to execute a command..').click();
      await GameServersPage.page.keyboard.press('ArrowUp');
      for (let i = 0; i < 49; i++) {
        await GameServersPage.page.keyboard.press('ArrowUp'); // Traversing all the way to the top
      }

      // The very first command 'Command 1' and 'Command 2' should be gone as it exceeded the cap of 50
      await expect(GameServersPage.page.getByPlaceholder('Type here to execute a command..')).not.toHaveValue(
        'Command 1'
      );
      await expect(GameServersPage.page.getByPlaceholder('Type here to execute a command..')).not.toHaveValue(
        'Command 2'
      );
    });
  });
});
