import { expect } from '@playwright/test';
import { integrationConfig } from '@takaro/test';
import { test } from '../fixtures/index.js';

test.describe('Module installations', () => {
  test('Can install module', async ({ takaro }) => {
    const { moduleInstallationsPage } = takaro;
    await moduleInstallationsPage.goto();
    await moduleInstallationsPage.openInstall('geoBlock', '0.0.1');
    await moduleInstallationsPage.clickInstall();
    await expect(
      moduleInstallationsPage.getModuleCard('geoBlock').getByRole('button', { name: 'Settings' }),
    ).toBeVisible();
  });

  test('Can uninstall module', async ({ takaro }) => {
    const { moduleInstallationsPage } = takaro;

    await moduleInstallationsPage.goto();
    await moduleInstallationsPage.uninstall('highPingKicker');
    await expect(
      moduleInstallationsPage.getModuleCard('highPingKicker').getByRole('button', { name: 'Settings' }),
    ).not.toBeVisible();
  });

  test('Can upgrade/downgrade module (automatically)', async ({ takaro }) => {
    const { moduleInstallationsPage } = takaro;
    await moduleInstallationsPage.goto();
    await moduleInstallationsPage.changeVersion('highPingKicker', 'latest');

    await expect(moduleInstallationsPage.getModuleCard('highPingKicker')).toHaveText('latest');
  });

  test('Can view module installation', async ({ page, takaro }) => {
    const { moduleInstallationsPage } = takaro;

    await moduleInstallationsPage.goto();
    await moduleInstallationsPage.viewConfig('utils');
    await expect(page.getByText('View configuration')).toBeVisible();
  });
});

test.describe('List of gameservers', () => {
  test('Can create gameserver', async ({ page, takaro }) => {
    const { GameServersPage } = takaro;

    const serverName = 'My new server';
    await GameServersPage.create();
    await GameServersPage.nameCreateEdit(serverName);

    await GameServersPage.selectGameServerType('Mock (testing purposes)');

    const hostInput = page.getByPlaceholder('Http://127.0.0.1:3002');
    await hostInput.click();
    await hostInput.fill(integrationConfig.get('mockGameserver.host'));
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
    await GameServersPage.clickSave();
    await expect(page.getByRole('heading', { name: serverName })).toBeVisible();

    await GameServersPage.create();
    await GameServersPage.nameCreateEdit(serverName);
    await GameServersPage.selectGameServerType('Mock (testing purposes)');
    const hostInputs2 = page.getByPlaceholder('Http://127.0.0.1:3002');
    await hostInputs2.click();
    await hostInputs2.fill(integrationConfig.get('mockGameserver.host'));
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
    await GameServersPage.clickSave();
    await expect(page.getByRole('heading', { name: serverName })).toBeVisible();

    // this will edit the first server and try to set the name to the same as the second server
    await GameServersPage.action('Edit');
    await GameServersPage.nameCreateEdit(serverName);
    await GameServersPage.clickSave();
    await expect(page.getByText('Game server with this name already exists')).toBeVisible();
  });

  test('Can edit gameserver', async ({ page, takaro }) => {
    const { GameServersPage } = takaro;
    await GameServersPage.goto();
    await expect(page.getByText(GameServersPage.gameServer.name)).toBeVisible();
    await GameServersPage.action('Edit');

    expect(page.url()).toBe(
      `${integrationConfig.get('frontendHost')}/gameservers/update/${GameServersPage.gameServer.id}`,
    );

    const newGameServerName = 'My edited mock server';
    await GameServersPage.nameCreateEdit(newGameServerName);
    await GameServersPage.clickSave();
    await expect(page.getByText(newGameServerName)).toBeVisible();
  });

  test('Can delete gameserver', async ({ page, takaro }) => {
    const { GameServersPage } = takaro;
    await GameServersPage.goto();
    await GameServersPage.delete(GameServersPage.gameServer.name);
    await expect(page.getByText(GameServersPage.gameServer.name)).toHaveCount(0);
  });
});

test.describe('Dashboard', () => {
  test.describe('Command history', () => {
    test('Pressing arrow up should show last command', async ({ takaro }) => {
      const { GameServersPage } = takaro;
      await GameServersPage.gotoGameServerConsole();

      await GameServersPage.page.getByPlaceholder('Type here to execute a command..').fill('Command 1');
      await GameServersPage.page.keyboard.press('Enter');

      await expect(GameServersPage.page.getByPlaceholder('Type here to execute a command..')).toHaveValue('');

      await GameServersPage.page.getByPlaceholder('Type here to execute a command..').click();
      await GameServersPage.page.keyboard.press('ArrowUp');
      await expect(GameServersPage.page.getByPlaceholder('Type here to execute a command..')).toHaveValue('Command 1');
    });
    test('Pressing up arrow twice should show the command before the last', async ({ takaro }) => {
      const { GameServersPage } = takaro;

      await GameServersPage.gotoGameServerConsole();
      await GameServersPage.page.getByPlaceholder('Type here to execute a command..').fill('Command 1');
      await GameServersPage.page.keyboard.press('Enter');

      await GameServersPage.page.getByPlaceholder('Type here to execute a command..').fill('Command 2');
      await GameServersPage.page.keyboard.press('Enter');

      await GameServersPage.page.getByPlaceholder('Type here to execute a command..').click();
      await GameServersPage.page.keyboard.press('ArrowUp');
      await GameServersPage.page.keyboard.press('ArrowUp');

      await expect(GameServersPage.page.getByPlaceholder('Type here to execute a command..')).toHaveValue('Command 1');
    });

    test('Pressing down arrow after pressing up arrow should return to last command', async ({ takaro }) => {
      const { GameServersPage } = takaro;

      await GameServersPage.gotoGameServerConsole();
      await GameServersPage.page.getByPlaceholder('Type here to execute a command..').fill('Command 1');
      await GameServersPage.page.keyboard.press('Enter');

      await GameServersPage.page.getByPlaceholder('Type here to execute a command..').click();
      await GameServersPage.page.keyboard.press('ArrowUp');
      await GameServersPage.page.keyboard.press('ArrowDown');

      await expect(GameServersPage.page.getByPlaceholder('Type here to execute a command..')).toHaveValue('');
    });

    test('Reaching top of history and pressing up arrow again should not change input', async ({ takaro }) => {
      const { GameServersPage } = takaro;

      await GameServersPage.gotoGameServerConsole();
      await GameServersPage.page.getByPlaceholder('Type here to execute a command..').fill('Command 1');
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
        await GameServersPage.page.getByPlaceholder('Type here to execute a command..').fill(`Command ${i}`);
        await GameServersPage.page.keyboard.press('Enter');
      }

      await GameServersPage.page.getByPlaceholder('Type here to execute a command..').click();
      await GameServersPage.page.keyboard.press('ArrowUp');
      for (let i = 0; i < 49; i++) {
        await GameServersPage.page.keyboard.press('ArrowUp'); // Traversing all the way to the top
      }

      // The very first command 'Command 1' and 'Command 2' should be gone as it exceeded the cap of 50
      await expect(GameServersPage.page.getByPlaceholder('Type here to execute a command..')).not.toHaveValue(
        'Command 1',
      );
      await expect(GameServersPage.page.getByPlaceholder('Type here to execute a command..')).not.toHaveValue(
        'Command 2',
      );
    });
  });
});
