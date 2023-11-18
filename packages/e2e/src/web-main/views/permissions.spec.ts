import { PERMISSIONS, basicTest } from '../fixtures/index.js';
import playwright from '@playwright/test';
import { login } from '../fixtures/helpers.js';
const { expect } = playwright;

basicTest('No permissions goes to NotAuthorized page', async ({}) => {
  //await expect(page.getByRole('heading', { name: 'dashboard', exact: true })).toBeVisible();
});

// When a user certain specific READ_* permissions, they should be able to see the page
basicTest.describe('smoke navbar', () => {
  const items = [
    { permission: PERMISSIONS.READ_GAMESERVERS, linkName: 'Servers' },
    { permission: PERMISSIONS.READ_EVENTS, linkName: 'Events' },
    { permission: PERMISSIONS.READ_PLAYERS, linkName: 'Players' },
    { permission: PERMISSIONS.READ_USERS, linkName: 'Users' },
    { permission: PERMISSIONS.READ_MODULES, linkName: 'Modules' },
    { permission: PERMISSIONS.READ_VARIABLES, linkName: 'Variables' },
    { permission: PERMISSIONS.READ_SETTINGS, linkName: 'Settings' },
  ];

  items.forEach(({ permission, linkName }) => {
    basicTest(`Can see ${linkName}`, async ({ takaro, page }) => {
      login(page, takaro.testUser.email, takaro.testUser.password);

      expect(page.getByRole('link', { name: linkName, exact: true })).toHaveCount(0);

      const { rootClient, testUser } = takaro;
      const permissions = await rootClient.permissionCodesToInputs([permission]);
      await rootClient.role.roleControllerUpdate(testUser.role.id, {
        permissions,
        name: testUser.role.name,
      });

      await page.reload();
      await page.getByRole('link', { name: linkName }).click();
      await expect(page.getByRole('link', { name: linkName, exact: true })).toBeVisible();
    });
  });
});
