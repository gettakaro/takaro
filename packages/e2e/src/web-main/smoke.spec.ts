import { expect } from '@playwright/test';
import { test, userTest } from './fixtures/index.js';
import { PERMISSIONS } from '@takaro/apiclient';
import { login } from './helpers.js';
import { TEST_IDS } from './testIds.js';

// When a user certain specific READ_* permissions, they should be able to see the page
const items = [
  {
    permission: [PERMISSIONS.ReadEvents, PERMISSIONS.ReadPlayers, PERMISSIONS.ReadUsers],
    linkName: 'Events',
    path: 'events',
  },
  { permission: [PERMISSIONS.ReadPlayers], linkName: 'Players', path: 'players' },
  { permission: [PERMISSIONS.ReadUsers], linkName: 'Users', path: 'users' },
  { permission: [PERMISSIONS.ReadModules], linkName: 'Modules', path: 'modules' },
  { permission: [PERMISSIONS.ReadVariables], linkName: 'Variables', path: 'variables' },
  { permission: [PERMISSIONS.ReadSettings], linkName: 'Settings', path: 'settings' },
  { permission: [PERMISSIONS.ReadRoles], linkName: 'Roles', path: 'roles' },

  // TODO: gameserver specific permissions are not fully implemented yet.
  // Once this has landed, extra tests should be added for these.
  // { permission: PERMISSIONS.READ_GAMESERVERS, linkName: 'Dashboard', path: '' },

  // TODO: since dashboard only requires the PERMISSIONS.READ_GAMESERVERS permission,
  // the second login will not redirect to the forbidden page, so we cannot use this test
  //{ permission: PERMISSIONS.READ_GAMESERVERS, linkName: 'Servers', path: 'servers' },
];

test('has title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Takaro/);
});

for (const { linkName, path, permission } of items) {
  test(`Can go to ${linkName}`, async ({ page }) => {
    const nav = page.getByTestId(TEST_IDS.GLOBAL_NAV);
    await nav.getByRole('link', { name: linkName }).click();
    await expect(page).toHaveURL(new RegExp(`${path}.*`));
  });

  userTest.fixme(`Can go to ${linkName} with permissions`, async ({ takaro, page }) => {
    const route = `/${path}`;

    // check if link redirects to Forbidden page
    await page.goto(route);
    await expect(page).toHaveURL('/forbidden');
    await expect(page.getByRole('heading', { name: 'Forbidden' })).toBeVisible();

    // add permissions
    const { rootClient, testUser } = takaro;
    const permissions = await rootClient.permissionCodesToInputs(permission);

    await rootClient.role.roleControllerUpdate(testUser.role.id, {
      permissions,
    });

    // because we are adding a role using the api, react query will not know about this change
    // we need to get rid of the cached user data. We do this by logging out.
    await page.goto('/logout');
    await page.waitForLoadState('domcontentloaded');
    await login(page, testUser.email, testUser.password);

    await page.goto(route);
    await page.waitForSelector(`[data-testid="${TEST_IDS.GLOBAL_NAV}"]`);
    // since the dom is reloaded, we need to locate the nav again.
    const navLink = page.getByTestId(TEST_IDS.GLOBAL_NAV).getByRole('link', { name: linkName, exact: true });
    await expect(navLink).toBeVisible();
    await navLink.click();

    await expect(page).toHaveURL(new RegExp(`${path}.*`));
  });
}
