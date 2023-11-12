import { PERMISSIONS, basicTest } from '../fixtures/index.js';
import playwright from '@playwright/test';
import { login } from '../fixtures/helpers.js';

const { expect } = playwright;

basicTest('Cannot see anything in navbar ', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'dashboard', exact: true })).toBeVisible();
});

// When a user certain specific READ_* permissions, they should be able to see the page
basicTest.describe('smoke', () => {
  const items = [
    { permission: PERMISSIONS.READ_GAMESERVERS, linkName: 'Servers' },
    { permission: PERMISSIONS.READ_EVENTS, linkName: 'Events' },
    { permission: PERMISSIONS.READ_PLAYERS, linkName: 'Players' },
    { permission: PERMISSIONS.READ_USERS, linkName: 'Users' },
    { permission: PERMISSIONS.READ_MODULES, linkName: 'Modules' },
    { permission: PERMISSIONS.READ_VARIABLES, linkName: 'variables' },
    { permission: PERMISSIONS.READ_SETTINGS, linkName: 'Settings' },
  ];

  items.forEach(({ permission, linkName }) => {
    basicTest(`Can see ${linkName}`, async ({ takaro, page }) => {
      login(page, takaro.testUser.email, takaro.testUser.password);

      expect(page.getByRole('link', { name: linkName, exact: true })).toHaveCount(0);

      const { rootClient, testUser } = takaro;

      // TODO: swap this with the permission controller
      await rootClient.role.roleControllerUpdate(testUser.role.id, {
        permissions: [permission],
        name: testUser.role.name,
      });

      await page.reload();
      await page.getByRole('link', { name: linkName }).click();

      expect(page.getByRole('link', { name: linkName, exact: true })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'dashboard', exact: true })).toBeVisible();
    });
  });
});
