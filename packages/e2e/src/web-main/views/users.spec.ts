import { expect } from '@playwright/test';
import { test } from '../fixtures/index.js';
import { navigateTo } from '../helpers.js';

test('Can view users', async ({ page, takaro }) => {
  await navigateTo(page, 'global-users');
  await expect(page.getByRole('row', { name: takaro.rootUser.name })).toBeVisible();
});

test('Can Delete a user', async ({ page, takaro }) => {
  const { usersPage, testUser } = takaro;
  await usersPage.goto();
  await usersPage.action({ action: 'delete', name: testUser.name });
  await page.getByRole('button', { name: 'delete user' }).click();
  await expect(page.getByRole('row', { name: testUser.email })).not.toBeVisible();
});
test.fixme('Can delete an invited user that has not accepted their invitation', async () => {});

test.describe('Role assignment', () => {
  test('Can assign a role to a user', async ({ page, takaro }) => {
    await navigateTo(page, 'global-users');

    const { usersPage, testUser } = takaro;

    await usersPage.goto();
    await usersPage.action({ action: 'profile', name: testUser.name });

    await page.getByRole('button', { name: 'Assign role' }).click();

    await page.locator('#roleId').click();
    await page.getByRole('option', { name: 'Moderator' }).click();

    await page.getByRole('button', { name: 'Assign role' }).click();
  });

  test.fixme('Can remove a role from a user', async ({ page, takaro }) => {
    const { usersPage } = takaro;
    await usersPage.goto();

    await usersPage.action({ action: 'profile', name: takaro.testUser.name });

    await page.getByRole('button', { name: 'Assign role' }).click();
    await page.locator('#roleId').click();
    await page.getByRole('option', { name: 'Moderator' }).click();
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Assign role' }).click();

    await page
      .getByRole('row', { name: 'Moderator Never player-actions' })
      .getByRole('button', { name: 'player-actions' })
      .click();
    await page.getByRole('menuitem', { name: 'Unassign role' }).click();

    await expect(page.getByRole('cell', { name: 'Moderator', exact: true })).not.toBeVisible();
  });
});
