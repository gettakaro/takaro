import { expect } from '@playwright/test';
import { test } from '../fixtures/index.js';

test('Can view role', async ({ takaro, page }) => {
  const { rolesPage } = takaro;
  await rolesPage.goto();
  await rolesPage.view('Test role');

  await expect(page.getByLabel('Role name')).not.toBeEditable();
});

test('Can create role', async ({ takaro, page }) => {
  const { rolesPage } = takaro;
  await rolesPage.goto();
  const roleName = 'My new role';
  await rolesPage.create({ name: roleName });
  await expect(page.getByText(roleName)).toBeVisible();
});

test('Can delete role', async ({ takaro, page }) => {
  const { rolesPage } = takaro;
  await rolesPage.goto();
  await rolesPage.delete('Test role');

  await expect(page.getByText('Test role')).not.toBeVisible();
});

test.fixme('Can edit role', async ({}) => {});
