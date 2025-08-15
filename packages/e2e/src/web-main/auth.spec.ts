import { expect, test as pwTest } from '@playwright/test';
import { test } from './fixtures/index.js';
import { integrationConfig } from '@takaro/test';
import { randomUUID } from 'crypto';
import he from 'he';
import { sleep } from '@takaro/util';
import { login } from './helpers.js';

test('can logout', async ({ page, takaro }) => {
  const user = (await takaro.rootClient.user.userControllerMe()).data.data;

  await page
    .getByRole('button')
    .filter({ hasText: user.user.email || user.user.name })
    .click();
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

  await page
    .getByRole('button')
    .filter({ hasText: user.user.email || user.user.name })
    .click();
  await page.getByText('Logout').click();
  await expect(page).toHaveURL(`${integrationConfig.get('frontendHost')}/login`);
  await page.waitForLoadState();

  await page.goto('/login');
  const emailInput = page.getByPlaceholder('hi cutie');
  await emailInput.click();
  await emailInput.fill('invalid+e2e@takaro.dev');
  await page.getByLabel('PasswordRequired').fill('invalid');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
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

  // Navigate to the invite link (recovery flow)
  await page.goto(inviteLink);
  await page.waitForLoadState('networkidle');

  // Recovery link goes to profile page with flow ID for password setup
  await expect(page).toHaveURL(/\/profile\?flowId=/);

  // The warning banner should be visible for users without authentication methods
  await expect(page.getByText('No Authentication Method Configured!')).toBeVisible();
  await expect(page.getByText(/You currently have no way to log into your account/)).toBeVisible();

  // The profile page should show password setup for new users
  // Open the password change modal
  await page.getByRole('button', { name: 'Change Password' }).click();

  // Set the password in the modal
  const password = randomUUID();
  await page.getByPlaceholder('Enter new password').fill(password);
  await page.getByRole('button', { name: 'Update Password' }).click();

  // Wait for the modal to close
  await expect(page.getByRole('button', { name: 'Change Password' })).toBeVisible();

  // The warning banner should now be gone since password is set
  await expect(page.getByText('No Authentication Method Configured!')).not.toBeVisible();

  // Logout to test the new password
  await page.getByRole('button').filter({ hasText: newUserEmail }).click();
  await page.getByText('Logout').click();
  await expect(page).toHaveURL(`${integrationConfig.get('frontendHost')}/login`);
  await page.waitForLoadState();

  // Login with the new password
  await login(page, newUserEmail, password);

  // Since the user has no permissions, they should be redirected to an empty shop page
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

  await page.getByTestId('node/input/email').getByPlaceholder(' ').fill(user.user.email!);
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(
    page.getByText('An email containing a recovery code has been sent to the email address you provided.'),
  ).toBeVisible();
  // It takes a while for the mail to be sent...
  await sleep(1000);

  const mails = await takaro.mailhog.searchMessages({
    kind: 'to',
    query: user.user.email!,
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

  // After successful recovery, we're logged in and redirected to dashboard
  await expect(page).toHaveURL(/\/dashboard/);

  // Navigate to profile to change password
  await page.goto('/profile');
  await page.waitForLoadState('networkidle');

  // Open the password change modal
  await page.getByRole('button', { name: 'Change Password' }).click();

  // Fill in the new password in the modal
  const newPassword = randomUUID();
  await page.getByPlaceholder('Enter new password').fill(newPassword);

  // Submit the password change
  await page.getByRole('button', { name: 'Update Password' }).click();

  // Wait for the modal to close and password to be updated
  await expect(page.getByRole('button', { name: 'Change Password' })).toBeVisible();

  // Password has been updated, now logout to test it
  await page.getByRole('button').filter({ hasText: user.user.name }).click();
  await page.getByText('Logout').click();
  await expect(page).toHaveURL(`${integrationConfig.get('frontendHost')}/login`);
  await page.waitForLoadState();

  // Test login with the new password
  await login(page, user.user.email!, newPassword);

  // check if we are on the dashboard
  await expect(page.getByTestId('takaro-icon-nav')).toBeVisible();
});
