import { expect } from '@playwright/test';
import { test } from '../fixtures/index.js';
import { HookCreateDTOEventTypeEnum } from '@takaro/apiclient';

test('Can view module', async ({ takaro, page }) => {
  const { moduleDefinitionsPage } = takaro;
  await moduleDefinitionsPage.goto();
  await moduleDefinitionsPage.view('Module without functions');
  await expect(page.getByLabel('Name')).not.toBeEditable();
});

test('Can tag a module', async () => {
  // todo
});

test('Can create module', async ({ page, takaro }) => {
  const { moduleDefinitionsPage } = takaro;
  await moduleDefinitionsPage.goto();

  const newModuleName = 'My new module';
  const newModuleDescription = 'My module description';
  await moduleDefinitionsPage.create({
    name: newModuleName,
    description: newModuleDescription,
  });
  await expect(page.getByText(newModuleName)).toBeVisible();
  await expect(page.getByText(newModuleDescription)).toBeVisible();
});

test('Can create module with permissions', async ({ page, takaro }) => {
  const { moduleDefinitionsPage } = takaro;
  const newModuleName = 'My new module';

  await moduleDefinitionsPage.goto();
  await moduleDefinitionsPage.create({
    name: newModuleName,
    description: 'This is the description',
    permissions: [
      {
        name: 'MY_PERMISSION',
        description: 'Informative description',
        friendlyName: 'My first permission',
      },
      {
        name: 'MY_PERMISSION2',
        description: 'Informative description 2',
        friendlyName: 'My second permission',
      },
    ],
  });
  await expect(page.getByText(newModuleName)).toBeVisible();
});

test('Creating module with config, saves the config', async ({ page, takaro }) => {
  const { moduleDefinitionsPage } = takaro;
  await moduleDefinitionsPage.goto();

  const moduleName = 'My new module name';
  const moduleDescription = 'My new module description';

  await moduleDefinitionsPage.create({
    name: moduleName,
    description: moduleDescription,
    save: false,
  });

  await page.getByRole('button', { name: 'Config Field' }).click();
  await page.locator('input[name="configFields\\.0\\.name"]').fill('Cool string');

  await page.locator('textarea[name="configFields\\.0\\.description"]').fill('config field description');
  await page.getByLabel('Default value').fill('my string default value');

  await page.locator('input[name="configFields\\.0\\.minLength"]').fill('1');
  await page.locator('input[name="configFields\\.0\\.maxLength"]').fill('20');

  await page.getByRole('button', { name: 'Save changes' }).click();

  await expect(page.getByText(moduleName)).toBeVisible();
  await moduleDefinitionsPage.view(moduleName);
  await expect(page.getByText('Cool string')).toBeVisible();
});

test('Creating a module but providing too short name, shows an error', async ({ page, takaro }) => {
  const { moduleDefinitionsPage } = takaro;
  await moduleDefinitionsPage.goto();
  await moduleDefinitionsPage.create({
    name: 'a',
  });
  await expect(page.getByText('Module name requires a minimum length of 4 characters')).toBeVisible();
});

test('Can edit module', async ({ page, takaro }) => {
  const oldModuleName = 'edit this module';
  const newModuleName = 'My new module';

  // Create a module
  await takaro.rootClient.module.moduleControllerCreate({
    name: oldModuleName,
    latestVersion: {
      description: 'Modules are the building blocks of your game server',
      configSchema: JSON.stringify({}),
    },
  });

  const { moduleDefinitionsPage } = takaro;
  await moduleDefinitionsPage.goto();
  await moduleDefinitionsPage.edit({
    oldName: oldModuleName,
    name: newModuleName,
    description: 'New description',
  });
  await expect(page.getByTestId(newModuleName)).toBeVisible();
});

test('Can delete module', async ({ page, takaro }) => {
  const moduleName = 'delete this module';
  await takaro.rootClient.module.moduleControllerCreate({
    name: moduleName,
    latestVersion: {
      description: 'Modules are the building blocks of your game server.',
      configSchema: JSON.stringify({}),
    },
  });

  const { moduleDefinitionsPage } = takaro;
  await moduleDefinitionsPage.goto();
  await moduleDefinitionsPage.delete(moduleName);
  await expect(page.getByText(moduleName)).toHaveCount(0);
});

test('Can copy module', async ({ page, takaro }) => {
  const { moduleDefinitionsPage } = takaro;
  await moduleDefinitionsPage.goto();
  const copyName = 'copy-name';
  await moduleDefinitionsPage.copy('Module without functions', copyName);
  await expect(page.getByText(copyName)).toBeVisible();
});

test('Can install module with empty config', async ({ page, takaro }) => {
  const modRes = await takaro.rootClient.module.moduleControllerSearch({
    filters: { name: ['Module without functions'] },
  });

  const mod = modRes.data.data[0];
  const testId = `module-installation-${mod.name}-card`;

  expect(mod).toBeDefined();
  await page.goto(`/gameserver/${takaro.gameServer.id}/modules`);

  const card = page.getByTestId(testId);
  await card.getByText('Select version...').click();
  await page.getByRole('option', { name: 'latest' }).click();
  await card.getByRole('button', { name: 'Install' }).click();
  // automatically installs
  await expect(page.getByText('Successfully installed')).toBeVisible();
});

test('Can install a module with a discord hook', async ({ page, takaro }) => {
  const mod = (
    await takaro.rootClient.module.moduleControllerCreate({
      name: 'Module with Discord hook',
      latestVersion: {
        configSchema: JSON.stringify({}),
        description: 'aaa',
      },
    })
  ).data.data;

  const { moduleInstallationsPage } = takaro;

  const hookName = 'My hook';
  await takaro.rootClient.hook.hookControllerCreate({
    name: hookName,
    eventType: HookCreateDTOEventTypeEnum.DiscordMessage,
    versionId: mod.latestVersion.id,
    regex: 'test',
  });

  await page.getByRole('link', { name: 'Servers' }).click();
  await page.getByText('Test server').click();
  await page.getByTestId('server-nav').getByRole('link', { name: 'Modules' }).click();

  const card = moduleInstallationsPage.getModuleCard(mod.name);
  await card.getByText('Select version...').click();
  await page.getByRole('option', { name: 'latest' }).click();
  await card.getByRole('button', { name: 'Install' }).click();
  await page.getByRole('button').filter({ hasText: hookName }).click();
  await page.getByLabel('DiscordChannelId').fill('123');
  await page.getByRole('button', { name: 'Install module' }).click();

  await expect(moduleInstallationsPage.getModuleCard(mod.name).getByRole('button', { name: 'Settings' })).toBeVisible();
});
