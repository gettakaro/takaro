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

test.fixme('Can delete role', async ({ takaro, page }) => {
  const { rolesPage } = takaro;
  const roleName = 'Test role';
  await rolesPage.goto();
  await rolesPage.delete(roleName);
  await expect(page.getByText(roleName)).not.toBeVisible();
});

test('Can edit role', async ({ takaro }) => {
  const { rolesPage } = takaro;
  await rolesPage.goto();

  await rolesPage.edit('Test role', {
    name: 'Test role 2',
    permissions: ['Read Users'],
  });

  await expect(rolesPage.page.getByText('Test role 2')).toBeVisible();
  await rolesPage.view('Test role 2');
  await expect(rolesPage.page.getByLabel('Read Users')).toBeChecked();
});
