import playwright from '@playwright/test';
import { test } from '../fixtures/index.js';
import { navigateTo } from '../helpers.js';

const { expect } = playwright;

test('Can view users', async ({ page, takaro }) => {
  await page.getByRole('link', { name: 'Users' }).click();
  await expect(page.getByText(takaro.rootUser.email)).toBeVisible();
});

test.describe('Role assignment', () => {
  test('Can assign a role to a user', async ({ page, takaro }) => {
    await navigateTo(page, 'global-users');

    const { usersPage, testUser } = takaro;

    await usersPage.goto();
    await usersPage.action({ action: 'profile', email: testUser.email });

    await page.getByRole('button', { name: 'Assign role' }).click();

    await page.locator('#roleId').click();
    await page.getByRole('option', { name: 'Player' }).click();
    await page.getByRole('button', { name: 'Save changes' }).click();
    await expect(page.getByRole('cell', { name: 'Player', exact: true })).toBeVisible();
  });

  test('Can remove a role from a user', async ({ page, takaro }) => {
    const { usersPage } = takaro;
    await usersPage.goto();

    await usersPage.action({ action: 'profile', email: takaro.testUser.email });

    await page.getByRole('button', { name: 'Assign role' }).click();
    await page.locator('#roleId').click();
    await page.getByRole('option', { name: 'Player' }).click();

    await page.getByRole('button', { name: 'Save changes' }).click();

    await expect(page.getByRole('cell', { name: 'Player', exact: true })).toBeVisible();

    await page
      .getByRole('row', { name: 'Player player-actions' })
      .getByRole('button', { name: 'player-actions' })
      .click();
    await page.getByRole('menuitem', { name: 'Unassign role' }).click();

    await expect(page.getByRole('cell', { name: 'Player', exact: true })).not.toBeVisible();
  });
});
