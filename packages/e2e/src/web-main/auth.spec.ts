import playwright from '@playwright/test';
import { basicTest } from './fixtures/index.js';
import { integrationConfig } from '@takaro/test';
import { randomUUID } from 'crypto';
import he from 'he';

const { expect, test: pwTest } = playwright;

basicTest('can logout', async ({ page, takaro }) => {
  const user = (await takaro.client.user.userControllerMe()).data.data;

  await page.getByRole('button').filter({ hasText: user.email }).click();
  await page.getByText('Logout').click();
  await page.waitForURL(`${integrationConfig.get('frontendHost')}/login`);
  expect(page.url()).toBe(`${integrationConfig.get('frontendHost')}/login`);
});

pwTest('should redirect to login when not logged in', async ({ page }) => {
  await page.goto('/servers');
  await page.waitForURL(`${integrationConfig.get('frontendHost')}/login`);
  expect(page.url()).toBe(`${integrationConfig.get('frontendHost')}/login`);
});

basicTest('Logging in with invalid credentials shows error message', async ({ page, takaro }) => {
  const user = (await takaro.client.user.userControllerMe()).data.data;

  await page.getByRole('button').filter({ hasText: user.email }).click();
  await page.getByText('Logout').click();

  await page.getByPlaceholder('hi cutie').type('invalid+e2e@takaro.dev');
  await page.getByLabel('PasswordRequired').type('invalid');

  await page.getByRole('button', { name: 'Log in with Email' }).click();

  await expect(page.getByText('Incorrect email or password')).toBeVisible();
});

pwTest.describe('User invitation flow', () => {
  basicTest('Happy path, invite user and do everything correctly', async ({ page, takaro }) => {
    const newUserEmail = `test_user_${randomUUID()}+e2e@takaro.dev`;
    // TODO: replace this with playwright actions
    await takaro.client.user.userControllerInvite({
      email: newUserEmail,
    });

    const user = (await takaro.client.user.userControllerMe()).data.data;

    await page.getByRole('button').filter({ hasText: user.email }).click();
    await page.getByText('Logout').click();
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

    await expect(page.getByText('You successfully recovered your account')).toBeVisible();
    const password = randomUUID();
    await page.getByTestId('node/input/password').getByPlaceholder(' ').type(password);
    await page.getByTestId('password-settings-card').getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Your changes have been saved!')).toBeVisible();

    await page.getByRole('button').filter({ hasText: newUserEmail }).click();
    await page.getByText('Logout').click();

    await page.getByPlaceholder('hi cutie').type(newUserEmail);
    await page.getByLabel('PasswordRequired').type(password);

    await page.getByRole('button', { name: 'Log in with Email' }).click();

    await expect(page.getByRole('link', { name: 'Takaro' })).toBeVisible();
  });
});
