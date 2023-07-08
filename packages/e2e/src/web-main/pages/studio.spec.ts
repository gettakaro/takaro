import playwright from '@playwright/test';
import { test } from '../fixtures/index.js';

import builtinModules from '../fixtures/modules.json' assert { type: 'json' };

const { expect, test: pwTest } = playwright;

test('should open onboarding when new module with no functions is created', async ({ page, context }) => {
  // go to modules and select the module with name: Module without functions
  await page.getByRole('link', { name: 'Modules' }).click();

  const [onBoardingPage] = await Promise.all([
    context.waitForEvent('page'),
    page.getByText('Module without functions').click(),
  ]);

  await onBoardingPage.waitForLoadState();
  await expect(onBoardingPage.locator('h1', { hasText: 'Choose one to get started' })).toBeVisible();
});

test('should open studio when module with functions is created', async ({ page, context }) => {
  await page.getByRole('link', { name: 'Modules' }).click();

  const [studioPage] = await Promise.all([
    context.waitForEvent('page'),
    page.getByRole('link', { name: 'Module with functions' }).click(),
  ]);
  await studioPage.waitForLoadState();

  await expect(studioPage.getByText('Module with functions')).toBeVisible();
});

test.fixme('should redirect when surfed to non existing module', async ({ page }) => {
  page.goto('studio/module-that-does-not-exist');
});

test('Can create hook', async ({ page, takaro }) => {
  const mod = (
    await takaro.client.module.moduleControllerSearch({
      filters: { name: 'Module with functions' },
    })
  ).data.data[0];

  await page.goto(`studio/${mod.id}`, { waitUntil: 'domcontentloaded' });
  const hooksDir = page.getByRole('button', { name: 'hooks' });
  await hooksDir.hover();
  await hooksDir.getByRole('button').click();

  await page.locator('input[name="new-file"]').fill('my-new-hook');
  await page.locator('input[name="new-file"]').press('Enter');
  await expect(page.getByRole('button', { name: 'my-new-hook' })).toBeVisible();
});

test('Can delete hook', async ({ page, takaro }) => {
  const mod = (
    await takaro.client.module.moduleControllerSearch({
      filters: { name: 'Module with functions' },
    })
  ).data.data[0];

  await page.goto(`studio/${mod.id}`, { waitUntil: 'domcontentloaded' });

  const testHookFile = page.getByRole('button', { name: 'test-hook' });
  await testHookFile.hover();
  await testHookFile.getByRole('button').nth(1).click();
  await page.getByRole('button', { name: 'Remove file' }).click();

  await expect(page.getByRole('button', { name: 'test-hook' })).toHaveCount(0);
});

test('Can create command', async ({ page, takaro }) => {
  const mod = (
    await takaro.client.module.moduleControllerSearch({
      filters: { name: 'Module with functions' },
    })
  ).data.data[0];

  await page.goto(`studio/${mod.id}`, { waitUntil: 'domcontentloaded' });
  const hooksDir = page.getByRole('button', { name: 'commands' });
  await hooksDir.hover();
  await hooksDir.getByRole('button').click();

  await page.locator('input[name="new-file"]').fill('my-new-command');
  await page.locator('input[name="new-file"]').press('Enter');
  await expect(page.getByRole('button', { name: 'my-new-command' })).toBeVisible();
});

test('Can delete command', async ({ page, takaro }) => {
  const mod = (
    await takaro.client.module.moduleControllerSearch({
      filters: { name: 'Module with functions' },
    })
  ).data.data[0];

  await page.goto(`studio/${mod.id}`, { waitUntil: 'domcontentloaded' });

  const testHookFile = page.getByRole('button', { name: 'test-command' });
  await testHookFile.hover();
  await testHookFile.getByRole('button').nth(1).click();
  await page.getByRole('button', { name: 'Remove file' }).click();
  await expect(page.getByRole('button', { name: 'test-command' })).toHaveCount(0);
});

test.fixme('Can save command config', async ({}) => {});

test('Can create cronjob', async ({ page, takaro }) => {
  const mod = (
    await takaro.client.module.moduleControllerSearch({
      filters: { name: 'Module with functions' },
    })
  ).data.data[0];

  await page.goto(`studio/${mod.id}`, { waitUntil: 'domcontentloaded' });
  const hooksDir = page.getByRole('button', { name: 'commands' });
  await hooksDir.hover();
  await hooksDir.getByRole('button').click();

  await page.locator('input[name="new-file"]').fill('my-new-cronjob');
  await page.locator('input[name="new-file"]').press('Enter');
  await expect(page.getByRole('button', { name: 'my-new-cronjob' })).toBeVisible();
});
test('Can delete cronjob', async ({ page, takaro }) => {
  const mod = (
    await takaro.client.module.moduleControllerSearch({
      filters: { name: 'Module with functions' },
    })
  ).data.data[0];

  await page.goto(`studio/${mod.id}`, { waitUntil: 'domcontentloaded' });

  const testHookFile = page.getByRole('button', { name: 'test-cronjob' });
  await testHookFile.hover();
  await testHookFile.getByRole('button').nth(1).click();
  await page.getByRole('button', { name: 'Remove file' }).click();
  await expect(page.getByRole('button', { name: 'test-cronjob' })).toHaveCount(0);
});

pwTest.describe('Copy modules', () => {
  for (const mod of builtinModules) {
    test(`Can copy ${mod.name}`, async ({ page, context }) => {
      await page.goto('/modules');
      const pagePromise = context.waitForEvent('page');

      await page.getByText(mod.name).click();

      const newPage = await pagePromise;
      await newPage.waitForLoadState();

      await newPage.getByRole('button', { name: 'Copy module' }).click();
      await newPage.getByText('Copy module').click();

      await newPage.goto('/modules');
      await newPage.waitForLoadState();
      await expect(newPage.getByText(`${mod.name}-copy`)).toBeVisible();
    });
  }
});

pwTest.describe('Built-in modules', () => {
  test.fixme('Cannot edit built-in module', async ({}) => {
    // TODO: should hover the hook and should NOT have edit button
  });
  test.fixme('Cannot delete built-in module', async ({}) => {});

  test.fixme('Cannot edit text in built-in module', async ({}) => {
    // TODO: should not be able to
  });

  test.fixme('Cannot create file in built-in module', async ({}) => {});

  test.fixme('Cannot save command config', async ({}) => {});
});
