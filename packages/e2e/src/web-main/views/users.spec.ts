import { expect } from '@playwright/test';
import { test } from '../fixtures/index.js';
import { navigateTo } from '../helpers.js';

test('Can view users', async ({ page, takaro }) => {
  await navigateTo(page, 'global-users');
  await expect(page.getByRole('row', { name: takaro.rootUser.email })).toBeVisible();
});

test('Can Delete a user', async ({ page, takaro }) => {
  const { usersPage, testUser } = takaro;
  await usersPage.goto();
  await usersPage.action({ action: 'delete', email: testUser.email });
  await page.getByRole('button', { name: 'delete user' }).click();
  await expect(page.getByRole('row', { name: testUser.email })).not.toBeVisible();
});
test.fixme('Can delete an invited user that has not accepted their invitation', async () => {});

test.describe('Role assignment', () => {
  test('Can assign a role to a user', async ({ page, takaro }) => {
    await navigateTo(page, 'global-users');

    const { usersPage, testUser } = takaro;

    await usersPage.goto();
    await usersPage.action({ action: 'profile', email: testUser.email });

    await page.getByRole('button', { name: 'Assign role' }).click();

    await page.locator('#roleId').click();
    await page.getByRole('option', { name: 'Moderator' }).click();

    await page.getByRole('button', { name: 'Save changes' }).click();
  });

  test('Can remove a role from a user', async ({ page, takaro }) => {
    const { usersPage } = takaro;
    await usersPage.goto();

    await usersPage.action({ action: 'profile', email: takaro.testUser.email });

    await page.getByRole('button', { name: 'Assign role' }).click();
    await page.locator('#roleId').click();
    await page.getByRole('option', { name: 'Moderator' }).click();

    await page.getByRole('button', { name: 'Save changes' }).click();

    await expect(page.getByRole('cell', { name: 'Moderator', exact: true })).toBeVisible();

    await page
      .getByRole('row', { name: 'Moderator Never player-actions' })
      .getByRole('button', { name: 'player-actions' })
      .click();
    await page.getByRole('menuitem', { name: 'Unassign role' }).click();

    await expect(page.getByRole('cell', { name: 'Moderator', exact: true })).not.toBeVisible();
  });
});
