import playwright from '@playwright/test';
import { test } from './fixtures/index.js';

const { expect } = playwright;

test('Can create module', async ({ page }) => {
  // open modules page
  await page.getByRole('link', { name: 'Modules' }).click();
  await page.locator('a').filter({ hasText: 'new module' }).click();

  const newModuleName = 'My new module';
  const moduleNameInput = page.getByPlaceholder('My cool module');

  await moduleNameInput.click();
  await moduleNameInput.fill(newModuleName);

  // remove auto created config field
  await page.getByRole('button').nth(1).click();

  await page.getByRole('button', { name: 'Save changes' }).click();

  expect(page.getByText(newModuleName)).toBeVisible();
});

test('Can edit module', async ({ page, adminPage }) => {
  const oldModuleName = 'My module';
  await adminPage.client.module.moduleControllerCreate({
    name: oldModuleName,
    description:
      'Modules are the building blocks of your game server. They consist of commands, c',
    configSchema: JSON.stringify({}),
  });

  // open modules page
  await page.getByRole('link', { name: 'Modules' }).click();

  await page
    .locator('a', { hasText: oldModuleName })
    .getByRole('button')
    .first()
    .click();

  const newModuleName = 'My edited module';
  const moduleNameInput = page.getByPlaceholder('My cool module');
  await moduleNameInput.click();
  await moduleNameInput.fill(newModuleName);

  await page.getByRole('button', { name: 'Save changes' }).click();
  expect(page.getByText(newModuleName)).toBeVisible();
});

test('Can delete module', async ({ page, adminPage }) => {
  const moduleName = 'My module';
  await adminPage.client.module.moduleControllerCreate({
    name: moduleName,
    description:
      'Modules are the building blocks of your game server. They consist of commands, c',
    configSchema: JSON.stringify({}),
  });

  // open modules page
  await page.getByRole('link', { name: 'Modules' }).click();
  await page.getByRole('button').nth(1).click();
  await page.getByRole('button', { name: 'Delete module' }).click();

  expect(page.locator('a').filter({ hasText: moduleName })).toHaveCount(0);
});
