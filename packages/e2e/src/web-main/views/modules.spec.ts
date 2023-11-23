import playwright from '@playwright/test';
import { test } from '../fixtures/index.js';
import { HookCreateDTOEventTypeEnum } from '@takaro/apiclient';

const { expect, test: pwTest } = playwright;

test('Can create module', async ({ page, takaro }) => {
  const { moduleDefinitionsPage } = takaro;
  await moduleDefinitionsPage.goto();

  const newModuleName = 'My new module';
  await moduleDefinitionsPage.create({
    name: newModuleName,
  });
  await expect(page.getByText(newModuleName)).toBeVisible();
});

test('Can create module with permissions', async ({ page, takaro }) => {
  const { moduleDefinitionsPage } = takaro;
  const newModuleName = 'My new module';

  await moduleDefinitionsPage.goto();
  await moduleDefinitionsPage.create({
    name: newModuleName,
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
  /*   
    await page.getByRole('link', { name: 'My new module Edit module Delete module No description provided.' }).getByRole('button', { name: 'Edit module' }).click();
    await expect(page.getByText('MY_PERMISSION')).toBeVisible();
    await expect(page.getByText('MY_PERMISSION2')).toBeVisible(); */
});

test('Creating module with config, saves the config', async ({ page }) => {
  await page.getByRole('link', { name: 'Modules' }).click();
  await page.getByText('new module').click();

  const moduleName = 'My new module';

  await page.getByPlaceholder('My cool module').fill(moduleName);

  await page.getByRole('button', { name: 'Config Field' }).click();
  await page.locator('input[name="configFields\\.0\\.name"]').fill('Cool string');

  await page.locator('textarea[name="configFields\\.0\\.description"]').fill('config field description');

  await page.getByLabel('Default value').fill('my string default value');

  await page.getByRole('button', { name: 'Save changes' }).click();

  await page.getByRole('link', { name: 'Modules' }).click();

  await expect(page.getByText(moduleName)).toBeVisible();
  await page
    .getByRole('link', { name: 'My new module Edit module Delete module No description provided.' })
    .getByRole('button', { name: 'Edit module' })
    .click();

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

test('Creating a module with config but not providing a default value, shows an error', async ({ page }) => {
  await page.getByRole('link', { name: 'Modules' }).click();
  await page.getByText('new module').click();

  await page.getByPlaceholder('My cool module').fill('My new module');

  await page.getByRole('button', { name: 'Config Field' }).click();
  await page.locator('input[name="configFields\\.0\\.name"]').fill('Cool string');
  await page.locator('textarea[name="configFields\\.0\\.description"]').fill('config field description');

  await page.getByRole('button', { name: 'Save changes' }).click();

  await expect(
    page
      .locator('div')
      .filter({ hasText: /^Required$/ })
      .locator('span')
  ).toBeVisible();
});

test('Can edit module', async ({ page, takaro }) => {
  const oldModuleName = 'edit this module';
  const newModuleName = 'My new module';

  // Create a module
  await takaro.rootClient.module.moduleControllerCreate({
    name: oldModuleName,
    description: 'Modules are the building blocks of your game server. They consist of commands, c',
    configSchema: JSON.stringify({}),
  });

  const { moduleDefinitionsPage } = takaro;
  await moduleDefinitionsPage.goto();
  await moduleDefinitionsPage.edit({
    name: newModuleName,
    description: 'New description',
  });
  await expect(page.getByRole('link', { name: newModuleName })).toBeVisible();
});

test('Can delete module', async ({ page, takaro }) => {
  const moduleName = 'delete this module';
  await takaro.rootClient.module.moduleControllerCreate({
    name: moduleName,
    description: 'Modules are the building blocks of your game server. They consist of commands, c',
    configSchema: JSON.stringify({}),
  });

  // open modules page
  await page.getByRole('link', { name: 'Modules' }).click();
  const cardDeleteButton = page.getByRole('link', { name: moduleName }).getByRole('button', { name: 'Delete module' });
  await cardDeleteButton.click();

  // dialog
  await page.getByRole('button', { name: 'Delete module' }).click();

  await expect(page.getByText(moduleName)).toHaveCount(0);
});

test('Can install module with empty config', async ({ page, takaro }) => {
  const modRes = await takaro.rootClient.module.moduleControllerSearch({
    filters: { name: ['Module without functions'] },
  });

  const mod = modRes.data.data[0];

  expect(mod).toBeDefined();

  await page.getByRole('link', { name: 'Servers' }).click();
  await page.getByText('Test server').click();
  await page
    .getByRole('navigation')
    .filter({ hasText: 'ServerDashboardModulesSettings' })
    .getByRole('link', { name: 'Modules' })
    .click();

  await page.getByTestId(`module-${mod.id}`).getByRole('button', { name: 'Install' }).click();

  await page.getByRole('button', { name: 'Install' }).click();

  await expect(page.getByTestId(`module-${mod.id}`).getByRole('button', { name: 'Uninstall module' })).toBeVisible();
});

test('Can install a module with a discord hook', async ({ page, takaro }) => {
  const mod = await takaro.rootClient.module.moduleControllerCreate({
    name: 'Module with Discord hook',
    configSchema: JSON.stringify({}),
    description: 'aaa',
  });

  await takaro.rootClient.hook.hookControllerCreate({
    name: 'My hook',
    eventType: HookCreateDTOEventTypeEnum.DiscordMessage,
    moduleId: mod.data.data.id,
    regex: 'test',
  });

  await page.getByRole('link', { name: 'Servers' }).click();
  await page.getByText('Test server').click();
  await page
    .getByRole('navigation')
    .filter({ hasText: 'ServerDashboardModulesSettings' })
    .getByRole('link', { name: 'Modules' })
    .click();

  await page.getByTestId(`module-${mod.data.data.id}`).getByRole('button', { name: 'Install' }).click();

  await page.getByLabel('My hook Discord channel IDRequired').type('123');

  await page.getByRole('button', { name: 'Install' }).click();

  await expect(
    page.getByTestId(`module-${mod.data.data.id}`).getByRole('button', { name: 'Uninstall module' })
  ).toBeVisible();
});

pwTest.describe('Module config', () => {
  pwTest.fixme('Can create string field', async ({}) => {
    /*
    await page.getByRole('link', { name: 'Modules' }).click();

    await page.locator('a').filter({ hasText: 'new module' }).click();

    const newModuleName = 'My new module';
    const moduleNameInput = page.getByPlaceholder('My cool module');

    await moduleNameInput.click();
    await moduleNameInput.fill(newModuleName);

    const moduleDescriptionInput = page.getByPlaceholder(
      'This module does cool stuff'
    );
    moduleDescriptionInput.click();
    moduleDescriptionInput.fill('My module description');

    const configFieldNameInput = page.locator(
      'input[name="configFields.0.name"]'
    );
    await configFieldNameInput.click();
    await configFieldNameInput.fill('My string field');

    const configFieldDescriptionInput = page.locator(
      'input[name="configFields.0.description"]'
    );
    await configFieldDescriptionInput.click();
    await configFieldDescriptionInput.fill('My string description');

    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: 'string' }).click();

    const configFieldDefaultValueInput = page.getByLabel('Default value');
    await configFieldDefaultValueInput.click();
    await configFieldDefaultValueInput.fill('my string default value');

    const configFieldMinLength = page.getByLabel('Minimum length');
    await configFieldMinLength.click();
    await configFieldMinLength.fill('0');

    const configFieldMaxLength = page.getByLabel('Maximum length');
    configFieldMaxLength.click();
    configFieldMaxLength.fill('20');

    const configFieldRequired = page.getByRole('checkbox');
    configFieldRequired.click();

    await page.getByRole('button', { name: 'Save changes' }).click();

    // we add a button press here because the cache for the moduleData is not updated yet.
    await page.getByRole('link', { name: 'Modules' }).click();

    await expect(page.getByText(newModuleName)).toBeVisible();

    // open edit module page
    await page
      .locator('a', { hasText: newModuleName })
      .getByRole('button')
      .first()
      .click();

    await expect(page.getByPlaceholder('My cool module')).toHaveValue(
      newModuleName
    );

    await expect(configFieldNameInput).toHaveValue('My string field');

    await expect(
      page.locator('input[name="configFields.0.description"]')
    ).toHaveValue('My string description');

    await expect(page.getByRole('combobox')).toHaveValue('string');
    await expect(page.getByLabel('Default value')).toHaveValue(
      'my string default value'
    );
    await expect(page.getByLabel('Minimum length')).toHaveValue('0');
    await expect(page.getByLabel('Maximum length')).toHaveValue('20');
    */
  });

  pwTest.fixme('Can create number field', async ({}) => {});

  pwTest.fixme('Can create boolean field', async ({}) => {});

  pwTest.fixme('Can create array field', async ({}) => {});

  pwTest.fixme('Can create enum field', async ({}) => {});
});
