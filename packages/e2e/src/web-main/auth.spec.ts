import { expect, test as pwTest } from '@playwright/test';
import { test } from './fixtures/index.js';
import { integrationConfig } from '@takaro/test';
import { randomUUID } from 'crypto';
import he from 'he';
import { sleep } from '@takaro/util';
import { login } from './helpers.js';
import { Client } from '@takaro/apiclient';

test('can logout', async ({ page, takaro }) => {
  const user = (await takaro.rootClient.user.userControllerMe()).data.data;

  await page.getByRole('button').filter({ hasText: user.user.email }).click();
  await page.getByText('Logout').click();
  await page.waitForURL(`${integrationConfig.get('frontendHost')}/login`);

  // try to go to authenticated page
  await page.goto('/gameservers');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForURL(`${integrationConfig.get('frontendHost')}/login?redirect=%2Fgameservers`);
});

pwTest('should redirect to login when not logged in', async ({ page }) => {
  await page.goto('/gameservers');
  await expect(page).toHaveURL(`${integrationConfig.get('frontendHost')}/login?redirect=%2Fgameservers`);
});

test('Logging in with invalid credentials shows error message', async ({ page, takaro }) => {
  const user = (await takaro.rootClient.user.userControllerMe()).data.data;

  await page.getByRole('button').filter({ hasText: user.user.email }).click();
  await page.getByText('Logout').click();
  await expect(page).toHaveURL(`${integrationConfig.get('frontendHost')}/login`);
  await page.waitForLoadState();

  await page.goto('/login');
  const emailInput = page.getByPlaceholder('hi cutie');
  await emailInput.click();
  await emailInput.fill('invalid+e2e@takaro.dev');
  await page.getByLabel('PasswordRequired').fill('invalid');
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(
    page.getByText(
      'The provided credentials are invalid, check for spelling mistakes in your password or username, email address, or phone number.',
    ),
  ).toBeVisible();
});

test('Invite user - happy path', async ({ page, takaro }) => {
  test.slow();
  const newUserEmail = `test_user_${randomUUID()}+e2e@takaro.dev`;

  await page.getByRole('link', { name: 'Users' }).click();
  await page.getByText('Invite user').click();
  await page.getByPlaceholder('example@example.com').fill(newUserEmail);
  await page.getByRole('button', { name: 'Send invitation' }).click();
  await page.getByRole('button').filter({ hasText: takaro.rootUser.email }).click();
  await page.getByText('Logout').click();

  await expect(page).toHaveURL(`${integrationConfig.get('frontendHost')}/login`);
  await page.waitForLoadState();
  await expect(page.getByPlaceholder('hi cutie')).toBeVisible();

  const mails = await takaro.mailhog.searchMessages({
    kind: 'to',
    query: newUserEmail,
  });

  expect(mails.items.length).toBe(1);

  const inviteLinkMatch = mails.items[0].Content.Body.match(/href="(.*)"/);
  if (!inviteLinkMatch) throw new Error('No invite link found in email');

  const inviteLink = he.decode(inviteLinkMatch[1]);
  await page.goto(inviteLink);

  const password = randomUUID();
  await page.getByTestId('node/input/password').getByPlaceholder(' ').fill(password);
  await page.getByTestId('password-settings-card').getByRole('button', { name: 'Save' }).click();
  await expect(page).toHaveURL(`${integrationConfig.get('frontendHost')}/login`);
  await page.waitForLoadState();
  await login(page, newUserEmail, password);
  // since the user has no permissions, he should be redirected to an empty shop page.
  await expect(page.getByText('No items in shop')).toBeVisible();
});

test('Recover account and reset password', async ({ page, takaro }) => {
  test.slow();
  const user = (await takaro.rootClient.user.userControllerMe()).data.data;

  await page.getByRole('button').filter({ hasText: user.user.name }).click();
  await page.getByText('Logout').click();
  await expect(page).toHaveURL(`${integrationConfig.get('frontendHost')}/login`);
  await page.waitForLoadState();

  await page.getByRole('link', { name: 'Forgot your password?' }).click();
  await expect(page.getByRole('heading')).toHaveText('Recover your account');

  await page.getByTestId('node/input/email').getByPlaceholder(' ').fill(user.user.email);
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(
    page.getByText('An email containing a recovery code has been sent to the email address you provided.'),
  ).toBeVisible();
  // It takes a while for the mail to be sent...
  await sleep(1000);

  const mails = await takaro.mailhog.searchMessages({
    kind: 'to',
    query: user.user.email,
  });

  expect(mails.items.length).toBe(1);

  const recoveryCodeMatch = mails.items[0].Content.Body.match(/entering the following code:\r\n\r\n(\d{6})/);
  if (!recoveryCodeMatch) {
    throw new Error('Recovery code not found in email');
  }
  const recoveryCode = recoveryCodeMatch[1];

  await page.getByTestId('node/input/code').getByPlaceholder(' ').clear();
  await page.getByTestId('node/input/code').getByPlaceholder(' ').fill(recoveryCode);
  await page.getByRole('button', { name: 'Submit' }).click();

  await expect(
    page.getByText(
      'You successfully recovered your account. Please change your password or set up an alternative login method (e.g. social sign in) within the next',
    ),
  ).toBeVisible();
  const newPassword = randomUUID();
  await page.getByTestId('node/input/password').getByPlaceholder(' ').fill(newPassword);
  await page.getByTestId('password-settings-card').getByRole('button', { name: 'Save' }).click();
  await expect(page).toHaveURL(`${integrationConfig.get('frontendHost')}/login`);
  await page.waitForLoadState();
  await login(page, user.user.email, newPassword);

  // check if we are on the dashboard
  await expect(page.getByTestId('takaro-icon-nav')).toBeVisible();
});

test('Login with inactive domain shows error message', async ({ page, takaro }) => {
  test.slow();

  // Create a new user for this test
  const testUserEmail = `inactive_domain_test_${randomUUID()}+e2e@takaro.dev`;
  const testUserPassword = randomUUID();

  await takaro.rootClient.user.userControllerCreate({
    name: 'Inactive Domain Test User',
    email: testUserEmail,
    password: testUserPassword,
  });

  // Log out the root user
  await page.getByRole('button').filter({ hasText: takaro.rootUser.email }).click();
  await page.getByText('Logout').click();
  await expect(page).toHaveURL(`${integrationConfig.get('frontendHost')}/login`);

  // Set the domain to DISABLED state using admin client
  await takaro.adminClient.domain.domainControllerUpdate(takaro.domain.createdDomain.id, {
    state: 'DISABLED',
  });

  // Try to login with the test user (don't use the helper as it expects successful login)
  await page.goto('/login');
  const emailInput = page.getByPlaceholder('hi cutie');
  await emailInput.click();
  await emailInput.fill(testUserEmail);
  await page.getByLabel('PasswordRequired').fill(testUserPassword);
  await page.getByRole('button', { name: 'Log in' }).click();

  // Verify the error message is displayed
  await expect(page.getByText('Domain is disabled. Please contact support.')).toBeVisible();

  // Restore domain to ACTIVE state for cleanup
  await takaro.adminClient.domain.domainControllerUpdate(takaro.domain.createdDomain.id, {
    state: 'ACTIVE',
  });
});

test('Login with maintenance domain shows error message', async ({ page, takaro }) => {
  test.slow();

  // Create a new user for this test
  const testUserEmail = `maintenance_domain_test_${randomUUID()}+e2e@takaro.dev`;
  const testUserPassword = randomUUID();

  await takaro.rootClient.user.userControllerCreate({
    name: 'Maintenance Domain Test User',
    email: testUserEmail,
    password: testUserPassword,
  });

  // Log out the root user
  await page.getByRole('button').filter({ hasText: takaro.rootUser.email }).click();
  await page.getByText('Logout').click();
  await expect(page).toHaveURL(`${integrationConfig.get('frontendHost')}/login`);

  // Set the domain to MAINTENANCE state using admin client
  await takaro.adminClient.domain.domainControllerUpdate(takaro.domain.createdDomain.id, {
    state: 'MAINTENANCE',
  });

  // Try to login with the test user (don't use the helper as it expects successful login)
  await page.goto('/login');
  const emailInput = page.getByPlaceholder('hi cutie');
  await emailInput.click();
  await emailInput.fill(testUserEmail);
  await page.getByLabel('PasswordRequired').fill(testUserPassword);
  await page.getByRole('button', { name: 'Log in' }).click();

  // Verify the error message is displayed
  await expect(
    page.getByText('Domain is in maintenance mode. Please try again later or contact support if the issue persists.'),
  ).toBeVisible();

  // Restore domain to ACTIVE state for cleanup
  await takaro.adminClient.domain.domainControllerUpdate(takaro.domain.createdDomain.id, {
    state: 'ACTIVE',
  });
});

test('Auto-switches to active domain when current domain is disabled', async ({ page, takaro }) => {
  test.slow();

  // Create a second domain
  const secondDomain = (
    await takaro.adminClient.domain.domainControllerCreate({
      name: `e2e-auto-switch-${randomUUID()}`.slice(0, 49),
      maxGameservers: 5,
      maxUsers: 5,
      maxModules: 100,
      maxVariables: 100,
    })
  ).data.data;

  // Create user in first domain
  const testUserEmail = `auto_switch_test_${randomUUID()}+e2e@takaro.dev`;
  const testUserPassword = randomUUID();

  await takaro.rootClient.user.userControllerCreate({
    name: 'Auto Switch Test User',
    email: testUserEmail,
    password: testUserPassword,
  });

  // Login to second domain as root and invite the test user
  const secondDomainClient = new Client({
    url: integrationConfig.get('host'),
    auth: {
      username: secondDomain.rootUser.email,
      password: secondDomain.password,
    },
  });
  await secondDomainClient.login();

  const invitedUser = await secondDomainClient.user.userControllerInvite({
    email: testUserEmail,
  });
  await secondDomainClient.user.userControllerAssignRole(invitedUser.data.data.id, secondDomain.rootRole.id);

  // Logout the root user first
  await page.getByRole('button').filter({ hasText: takaro.rootUser.email }).click();
  await page.getByText('Logout').click();
  await expect(page).toHaveURL(`${integrationConfig.get('frontendHost')}/login`);

  // Login as test user - should default to first domain
  await login(page, testUserEmail, testUserPassword);

  // Should be logged in successfully
  await expect(page).not.toHaveURL(/\/login/);

  // Get the current domain from cookie
  const cookiesBeforeDisable = await page.context().cookies();
  const domainCookieBeforeDisable = cookiesBeforeDisable.find((c) => c.name === 'takaro-domain');
  expect(domainCookieBeforeDisable?.value).toBe(takaro.domain.createdDomain.id);

  // Logout
  await page.getByRole('button').filter({ hasText: testUserEmail }).click();
  await page.getByText('Logout').click();
  await expect(page).toHaveURL(`${integrationConfig.get('frontendHost')}/login`);

  // Disable the first domain
  await takaro.adminClient.domain.domainControllerUpdate(takaro.domain.createdDomain.id, {
    state: 'DISABLED',
  });

  // Login again - should auto-switch to second domain
  await login(page, testUserEmail, testUserPassword);

  // Should successfully login (not on login page)
  await expect(page).not.toHaveURL(/\/login/);

  // Verify we're on the second domain by checking the domain cookie
  const cookiesAfterSwitch = await page.context().cookies();
  const domainCookieAfterSwitch = cookiesAfterSwitch.find((c) => c.name === 'takaro-domain');
  expect(domainCookieAfterSwitch?.value).toBe(secondDomain.createdDomain.id);

  // Cleanup
  await takaro.adminClient.domain.domainControllerUpdate(takaro.domain.createdDomain.id, {
    state: 'ACTIVE',
  });
  await takaro.adminClient.domain.domainControllerRemove(secondDomain.createdDomain.id);
});
