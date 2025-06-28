import { expect } from '@playwright/test';
import { test } from './fixtures/index.js';
import { integrationConfig } from '@takaro/test';
import { login } from './helpers.js';
import { humanId } from 'human-id';
import { Client, DomainCreateOutputDTO } from '@takaro/apiclient';

test.describe('Domain Memory Feature', () => {
  let secondDomain: DomainCreateOutputDTO;

  test.beforeEach(async ({ takaro }) => {
    // Create a second domain for multi-domain testing
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

  test('remembers last used domain after logout/login', async ({ page, takaro }) => {
    test.slow();

    // Clear any existing domain memory cookies
    await page.context().clearCookies({ name: 'takaro-last-used-domain' });

    // Login - backend should auto-select first domain (alphabetically first)
    await login(page, takaro.rootUser.email, takaro.domain.password);
    await page.waitForURL((url) => url.pathname === '/dashboard', { waitUntil: 'domcontentloaded' });

    // Verify we're on the auto-selected domain by checking the sidebar
    await expect(page.locator('text=Domain:')).toBeVisible();

    // Manually switch to the second domain via dropdown
    await page.getByRole('button', { name: new RegExp(takaro.rootUser.name || takaro.rootUser.email, 'i') }).click();
    await page.getByRole('menuitem', { name: 'Switch domain' }).click();
    await page.waitForURL((url) => url.pathname === '/domain/select');

    // Select the second domain
    await page.getByRole('link', { name: new RegExp(secondDomain.createdDomain.name, 'i') }).click();
    await page.waitForURL((url) => url.pathname === '/dashboard', { waitUntil: 'domcontentloaded' });

    // Verify we're on the second domain
    await expect(page.locator('text=Domain:').locator('..').getByText(secondDomain.createdDomain.id)).toBeVisible();

    // Logout via user dropdown
    await page.getByRole('button', { name: new RegExp(takaro.rootUser.name || takaro.rootUser.email, 'i') }).click();
    await page.getByRole('menuitem', { name: 'Logout' }).click();
    await page.waitForURL(`${integrationConfig.get('frontendHost')}/login`);

    // Login again - should remember and auto-select the second domain
    await login(page, takaro.rootUser.email, takaro.domain.password);
    await page.waitForURL((url) => url.pathname === '/dashboard', { waitUntil: 'domcontentloaded' });

    // Should auto-select the remembered second domain (not the alphabetically first one)
    await expect(page.locator('text=Domain:').locator('..').getByText(secondDomain.createdDomain.id)).toBeVisible();
  });

  test('remembers domain when switching via navbar dropdown', async ({ page, takaro }) => {
    test.slow();

    // Clear any existing domain memory cookies
    await page.context().clearCookies({ name: 'takaro-last-used-domain' });

    // Login - should auto-select first domain
    await login(page, takaro.rootUser.email, takaro.domain.password);
    await page.waitForURL((url) => url.pathname === '/dashboard', { waitUntil: 'domcontentloaded' });

    // Verify we're on the auto-selected domain
    await expect(page.locator('text=Domain:')).toBeVisible();

    // Switch domain via navbar dropdown
    await page.getByRole('button', { name: new RegExp(takaro.rootUser.name || takaro.rootUser.email, 'i') }).click();
    await page.getByRole('menuitem', { name: 'Switch domain' }).click();
    await page.waitForURL((url) => url.pathname === '/domain/select');

    // Select the second domain
    await page.getByRole('link', { name: new RegExp(secondDomain.createdDomain.name, 'i') }).click();
    await page.waitForURL((url) => url.pathname === '/dashboard', { waitUntil: 'domcontentloaded' });

    // Verify we switched to second domain
    await expect(page.locator('text=Domain:').locator('..').getByText(secondDomain.createdDomain.id)).toBeVisible();

    // Logout
    await page.getByRole('button', { name: new RegExp(takaro.rootUser.name || takaro.rootUser.email, 'i') }).click();
    await page.getByRole('menuitem', { name: 'Logout' }).click();
    await page.waitForURL(`${integrationConfig.get('frontendHost')}/login`);

    // Login again - should remember the second domain
    await login(page, takaro.rootUser.email, takaro.domain.password);
    await page.waitForURL((url) => url.pathname === '/dashboard', { waitUntil: 'domcontentloaded' });

    // Should auto-select the remembered second domain
    await expect(page.locator('text=Domain:').locator('..').getByText(secondDomain.createdDomain.id)).toBeVisible();
  });

  test('falls back to auto-selecting first domain when no last used domain cookie exists', async ({ page, takaro }) => {
    // Clear any existing domain memory cookies
    await page.context().clearCookies({ name: 'takaro-last-used-domain' });

    // Login - should auto-select first domain (alphabetically) and go to dashboard
    await login(page, takaro.rootUser.email, takaro.domain.password);
    await page.waitForURL((url) => url.pathname === '/dashboard', { waitUntil: 'domcontentloaded' });

    // Should be on dashboard with auto-selected domain (not domain selection page)
    await expect(page.locator('text=Domain:')).toBeVisible();

    // Verify one of the domains is selected (backend auto-selects first available)
    const domainText = await page.locator('text=Domain:').locator('..').textContent();
    const selectedDomainId = domainText?.split('Domain:')[1]?.trim();
    expect(selectedDomainId).toBeTruthy();
    expect([takaro.domain.createdDomain.id, secondDomain.createdDomain.id]).toContain(selectedDomainId);
  });

  test('handles invalid last used domain gracefully by auto-selecting first domain', async ({ page, takaro }) => {
    // Set an invalid domain ID in the last used cookie
    await page.context().addCookies([
      {
        name: 'takaro-last-used-domain',
        value: 'invalid-domain-id-12345',
        domain: new URL(integrationConfig.get('frontendHost')).hostname,
        path: '/',
      },
    ]);

    // Login - should ignore invalid cookie and auto-select first domain
    await login(page, takaro.rootUser.email, takaro.domain.password);
    await page.waitForURL((url) => url.pathname === '/dashboard', { waitUntil: 'domcontentloaded' });

    // Should be on dashboard with auto-selected domain (graceful fallback)
    await expect(page.locator('text=Domain:')).toBeVisible();

    // Verify a valid domain is selected (backend ignores invalid cookie)
    const domainText = await page.locator('text=Domain:').locator('..').textContent();
    const selectedDomainId = domainText?.split('Domain:')[1]?.trim();
    expect(selectedDomainId).toBeTruthy();
    expect([takaro.domain.createdDomain.id, secondDomain.createdDomain.id]).toContain(selectedDomainId);
  });
});
