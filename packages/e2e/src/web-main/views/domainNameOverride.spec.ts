import { expect } from '@playwright/test';
import { test } from '../fixtures/index.js';
import { navigateTo } from '../helpers.js';
import { humanId } from 'human-id';
import { Client, DomainCreateOutputDTO } from '@takaro/apiclient';
import { integrationConfig } from '@takaro/test';

test.describe('Domain Name Override Feature', () => {
  let secondDomain: DomainCreateOutputDTO;

  test.beforeEach(async ({ takaro }) => {
    // Create a second domain so we can access the domain select page
    secondDomain = (
      await takaro.adminClient.domain.domainControllerCreate({
        name: `e2e-second-${humanId()}`.slice(0, 49),
        maxGameservers: 5,
        maxUsers: 5,
        maxModules: 100,
        maxVariables: 100,
      })
    ).data.data;

    const secondDomainUser = {
      username: secondDomain.rootUser.email,
      password: secondDomain.password,
    };

    const secondDomainClient = new Client({
      url: integrationConfig.get('host'),
      auth: {
        username: secondDomainUser.username,
        password: secondDomainUser.password,
      },
    });

    await secondDomainClient.login();
    // Invite the user from domain #1 to the second domain
    const createduser = await secondDomainClient.user.userControllerInvite({
      email: takaro.rootUser.email,
    });

    await secondDomainClient.user.userControllerAssignRole(createduser.data.data.id, secondDomain.rootRole.id);
  });

  test.afterEach(async ({ takaro }) => {
    // Clean up second domain
    if (secondDomain) {
      await takaro.adminClient.domain.domainControllerRemove(secondDomain.createdDomain.id);
    }
  });

  test('can override domain name in settings and see it reflected in domain select page', async ({ page, takaro }) => {
    // Reload the page to ensure the frontend knows about the second domain
    await page.reload();
    await page.waitForLoadState('networkidle');

    // First, navigate to domain select page to see the original domain name
    await page.getByRole('button', { name: new RegExp(takaro.rootUser.name || takaro.rootUser.email, 'i') }).click();
    await page.getByRole('menuitem', { name: 'Switch domain' }).click();
    await page.waitForURL((url) => url.pathname === '/domain/select');

    // Verify the original domain name is displayed
    const originalDomainName = takaro.domain.createdDomain.name;
    await expect(page.getByRole('heading', { name: new RegExp(originalDomainName, 'i') })).toBeVisible();

    // Also verify the domain ID is shown in a chip
    await expect(page.getByText(takaro.domain.createdDomain.id)).toBeVisible();

    // Navigate back to dashboard
    await page.getByRole('link', { name: new RegExp(originalDomainName, 'i') }).click();
    await page.waitForURL((url) => url.pathname === '/dashboard', { waitUntil: 'domcontentloaded' });

    // Navigate to global settings
    await navigateTo(page, 'global-settings');

    // Set a custom domain name
    const customDomainName = 'My Custom Domain Name';
    await page.getByLabel('domain name').fill(customDomainName);
    await page.getByText('Save settings').click();

    // Wait for save to complete and verify it persisted
    await page.waitForTimeout(1000); // Give it time to save
    await page.reload();
    await expect(page.getByLabel('domain name')).toHaveValue(customDomainName);

    // Navigate back to domain select page
    await page.getByRole('button', { name: new RegExp(takaro.rootUser.name || takaro.rootUser.email, 'i') }).click();
    await page.getByRole('menuitem', { name: 'Switch domain' }).click();
    await page.waitForURL((url) => url.pathname === '/domain/select');

    // Verify the custom domain name is now displayed instead of the original
    await expect(page.getByRole('heading', { name: customDomainName })).toBeVisible();

    // The original domain name should not be visible anymore
    await expect(page.getByRole('heading', { name: new RegExp(originalDomainName, 'i') })).not.toBeVisible();

    // But the domain ID should still be visible in the chip
    await expect(page.getByText(takaro.domain.createdDomain.id)).toBeVisible();
  });

  test('empty domain name setting falls back to original domain name', async ({ page, takaro }) => {
    // Navigate to global settings
    await navigateTo(page, 'global-settings');

    // Clear any existing domain name override
    await page.getByLabel('domain name').clear();
    await page.getByText('Save settings').click();

    // Wait for save to complete
    await page.waitForTimeout(1000);

    // Navigate to domain select page
    await page.getByRole('button', { name: new RegExp(takaro.rootUser.name || takaro.rootUser.email, 'i') }).click();
    await page.getByRole('menuitem', { name: 'Switch domain' }).click();
    await page.waitForURL((url) => url.pathname === '/domain/select');

    // Should show the original domain name since override is empty
    const originalDomainName = takaro.domain.createdDomain.name;
    await expect(page.getByRole('heading', { name: new RegExp(originalDomainName, 'i') })).toBeVisible();
  });
});
