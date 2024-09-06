import { expect, test as pwTest } from '@playwright/test';
import { test } from './fixtures/index.js';
import { integrationConfig } from '@takaro/test';
import { randomUUID } from 'crypto';
import he from 'he';
import { sleep } from '@takaro/util';
import { login } from './helpers.js';

test('can logout', async ({ page, takaro }) => {
  const user = (await takaro.rootClient.user.userControllerMe()).data.data;

  await page.getByRole('button').filter({ hasText: user.user.email }).click();
  await page.getByText('Logout').click();
  await expect(page).toHaveURL(`${integrationConfig.get('frontendHost')}/login`);

  // try to go to authenticated page
  await page.goto('/gameservers');
  await expect(page).toHaveURL(`${integrationConfig.get('frontendHost')}/login`);
});

pwTest('should redirect to login when not logged in', async ({ page }) => {
  await page.goto('/gameservers');
  await expect(page).toHaveURL(`${integrationConfig.get('frontendHost')}/login`);
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
  await page.getByRole('button', { name: 'Log in with Email' }).click();
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

  // since the user has no permissions, he should be redirected to the forbidden page
  await expect(page).toHaveURL(`${integrationConfig.get('frontendHost')}/forbidden`);
});

test.fixme('Recover account and reset password', async ({ page, takaro }) => {
  test.slow();
  const user = (await takaro.rootClient.user.userControllerMe()).data.data;

  await page.getByRole('button').filter({ hasText: user.email }).click();
  await page.getByText('Logout').click();
  await expect(page).toHaveURL(`${integrationConfig.get('frontendHost')}/login`);
  await page.waitForLoadState();

  await page.getByRole('link', { name: 'Forgot your password?' }).click();

  await expect(page.getByRole('heading')).toHaveText('Recovery');

  await page.getByTestId('node/input/email').getByPlaceholder(' ').fill(user.email);
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(
    page.getByText('An email containing a recovery code has been sent to the email address you provided.'),
  ).toBeVisible();
  // It takes a while for the mail to be sent... :(
  await sleep(1000);

  const mails = await takaro.mailhog.searchMessages({
    kind: 'to',
    query: user.email,
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
  await expect(page.getByText('Your changes have been saved!')).toBeVisible();

  await page.getByRole('button').filter({ hasText: user.email }).click();
  await page.getByText('Logout').click();
  await expect(page).toHaveURL(`${integrationConfig.get('frontendHost')}/login`);
  await page.waitForLoadState();
  await login(page, user.email, newPassword);

  // check if we are on the dashboard
  await expect(page.getByTestId('takaro-icon-nav')).toBeVisible();
});
