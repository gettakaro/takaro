import playwright from '@playwright/test';
import { test } from '../fixtures/index.js';

const { expect } = playwright;

test('Can view users', async ({ page, takaro }) => {
  await page.getByRole('link', { name: 'Users' }).click();
  await expect(page.getByText(takaro.rootUser.email)).toBeVisible();
});

test.describe('Role assignment', () => {
  test('Can assign a role to a user', async ({ page }) => {
    await page.getByRole('link', { name: 'Users' }).click();

    await page.getByRole('button', { name: 'user-actions' }).click();
    await page.getByRole('menuitem', { name: 'Go to user profile' }).click();

    await page.getByRole('button', { name: 'Assign role' }).click();

    await page.locator('#roleId').click();
    await page.getByRole('option', { name: 'Moderator' }).click();

    await page.getByRole('button', { name: 'Save changes' }).click();

    await expect(page.getByRole('cell', { name: 'Moderator', exact: true })).toBeVisible();
  });

  test('Can remove a role from a user', async ({ page }) => {
    await page.getByRole('link', { name: 'Users' }).click();

    await page.getByRole('button', { name: 'user-actions' }).click();
    await page.getByRole('menuitem', { name: 'Go to user profile' }).click();

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
