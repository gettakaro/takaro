import playwright from '@playwright/test';
import { test } from '../fixtures/index.js';

import builtinModules from '../fixtures/modules.json' assert { type: 'json' };
const { expect } = playwright;

test.describe('smoke', () => {
  test('should open onboarding when new module with no functions is created', async ({ takaro }) => {
    const mod = await takaro.client.module.moduleControllerCreate({
      name: 'Module without functions',
    });
    takaro.studioPage.mod = mod.data.data;
    await takaro.studioPage.goto();
    await expect(takaro.studioPage.page.locator('h1', { hasText: 'Choose one to get started' })).toBeVisible();
  });

  // TODO: this test should move to modules
  test('should open studio in new tab', async ({ page, context }) => {
    await page.getByRole('link', { name: 'Modules' }).click();

    const [studioPage] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('link', { name: 'Module with functions' }).click(),
    ]);
    await studioPage.waitForLoadState();

    await expect(studioPage.getByText('Module with functions')).toBeVisible();
  });

  test.fixme('should redirect when surfed to non existing module', async ({ page }) => {
    await page.goto('studio/not-existing-module');
    await page.waitForURL('**/error404');
  });
});

test.describe('filetab', () => {
  test.beforeEach(async ({ takaro }) => {
    await takaro.studioPage.goto();
  });

  test('Editing shows dirty indicator', async ({ takaro }) => {
    const { studioPage } = takaro;
    const fileName = 'my-hook';
    await studioPage.openFile(fileName);
    const editor = await studioPage.getEditor();
    await editor.click();
    await studioPage.page.keyboard.type('dirty');
    const fileTab = await studioPage.getFileTab(fileName);
    await expect(fileTab.getByTestId('close-my-hook-dirty')).toBeVisible();
  });

  test('Saving hides dirty indicator', async ({ takaro }) => {
    const { studioPage } = takaro;
    await studioPage.openFile('my-hook');

    const editor = await studioPage.getEditor();
    await editor.click();
    await studioPage.page.keyboard.type('dirty');

    await studioPage.page.keyboard.press('Control+s');
    await expect(studioPage.page.getByTestId('close-my-hook-clean')).toBeVisible();
  });

  test('Closing dirty file should trigger discard dialog', async ({ takaro }) => {
    const { studioPage } = takaro;
    const fileName = 'my-hook';
    await studioPage.openFile(fileName);

    const editor = await studioPage.getEditor();
    await editor.click();
    await studioPage.page.keyboard.type('dirty');
    await studioPage.closeTab(fileName, true);
    await expect(studioPage.page.getByRole('dialog')).toBeVisible();
  });

  test('Closing clean file should close tab', async ({ takaro }) => {
    const { studioPage } = takaro;
    const fileName = 'my-hook';
    await studioPage.openFile(fileName);
    await studioPage.closeTab(fileName);
    await expect(studioPage.page.getByRole('tab', { name: fileName })).not.toBeVisible();
  });

  test.describe('context menu', () => {
    test.fixme('should close all tabs to the right', async ({}) => {});
    test.fixme('should close all saved tabs', async ({}) => {});
    test.fixme('should close all ohter tabs', async ({}) => {});
  });
});

test.describe('filetree', () => {
  test.beforeEach(async ({ takaro }) => {
    await takaro.studioPage.goto();
  });

  test.describe('file context menu', () => {
    test.beforeEach(async ({ takaro }) => {
      await takaro.studioPage.goto();
    });

    test('should open', async ({ takaro }) => {
      const { studioPage } = takaro;
      const file = await studioPage.getTreeFile('my-hook');
      await file.click({ button: 'right' });

      await expect(studioPage.page.getByRole('menu')).toBeVisible();
      await expect(studioPage.page.getByRole('menuitem', { name: 'Rename file' })).toBeVisible();
      await expect(studioPage.page.getByRole('menuitem', { name: 'Delete file' })).toBeVisible();
    });

    test('Should trigger delete', async ({ takaro }) => {
      const { studioPage } = takaro;
      const file = await studioPage.getTreeFile('my-hook');
      file.click({ button: 'right' });

      await studioPage.page.getByRole('menuitem', { name: 'Delete file' }).click();

      // expect delete dialog to be visible
      await expect(studioPage.page.getByRole('dialog')).toBeVisible();
    });

    test('Should trigger rename', async ({ takaro }) => {
      const { studioPage } = takaro;
      const file = await studioPage.getTreeFile('my-hook');
      file.click({ button: 'right' });
      await studioPage.page.getByRole('menuitem', { name: 'Rename file' }).click();
      await expect(studioPage.page.locator('input[name="file"]')).toBeFocused();
    });
  });
  test('Should Create and Delete hook', async ({ page, takaro }) => {
    const fileName = 'test-hook';
    await takaro.studioPage.createFile(fileName, 'hooks');
    await takaro.studioPage.deleteFile(fileName);
    await expect(page.getByRole('button', { name: fileName })).toHaveCount(0);
  });

  test('Should Create and Delete command', async ({ page, takaro }) => {
    const fileName = 'test-command';
    await takaro.studioPage.createFile(fileName, 'commands');
    await takaro.studioPage.deleteFile(fileName);
    await expect(page.getByRole('button', { name: fileName })).toHaveCount(0);
  });

  test('Should Create and Delete cronjob', async ({ page, takaro }) => {
    const fileName = 'test-cronjob';
    await takaro.studioPage.createFile(fileName, 'cronjobs');
    await takaro.studioPage.deleteFile(fileName);
    await expect(page.getByRole('button', { name: fileName })).toHaveCount(0);
  });

  test.fixme('Can save command config', async ({}) => {});
});

test.describe('Copy module', () => {
  for (const mod of builtinModules) {
    test(`Can copy ${mod.name}`, async ({ page, takaro }) => {
      await takaro.moduleDefinitionsPage.goto();
      const studioPage = await takaro.moduleDefinitionsPage.open(mod.name);
      await studioPage.getByRole('button', { name: 'Make copy of module' }).click();
      await studioPage.getByRole('button', { name: 'Copy Module' }).click();

      await takaro.moduleDefinitionsPage.goto();
      await expect(page.getByText(`${mod.name}-copy`)).toBeVisible();
    });
  }
  test.fixme('Cannot copy module with name that already exists', async ({}) => {});
});

test.describe('Built-in modules', () => {
  test.describe('filetree', () => {
    test('Cannot create file', async ({ takaro }) => {
      const { studioPage } = takaro;
      studioPage.mod = takaro.builtinModule;
      await studioPage.goto();
      const hooksDir = await studioPage.getTreeDir('hooks');
      await hooksDir.hover();
      await expect(studioPage.page.locator('button[aria-label="Create file"]')).not.toBeVisible();
    });

    test('Cannot edit file', async ({ takaro }) => {
      const { studioPage } = takaro;
      studioPage.mod = takaro.builtinModule;
      await studioPage.goto();

      const treeFile = await studioPage.getTreeFile(studioPage.mod.commands[0].name);
      await treeFile.hover();
      await expect(studioPage.page.locator('button[aria-label="Edit file"]')).not.toBeVisible();
      await expect(studioPage.page.locator('button[aria-label="Delete file"]')).not.toBeVisible();

      await treeFile.click({ button: 'right' });
      await expect(studioPage.page.getByRole('menu')).not.toBeVisible();
    });
  });

  test('Cannot edit text in built-in module', async ({ takaro }) => {
    const { studioPage } = takaro;
    studioPage.mod = takaro.builtinModule;
    await studioPage.goto();

    const fileName = studioPage.mod.commands[0].name;
    await studioPage.openFile(fileName);

    const editor = await studioPage.getEditor();
    await editor.click();
    await studioPage.page.keyboard.type('dirty');

    const fileTab = await studioPage.getFileTab(fileName);
    await expect(fileTab.getByTestId(`close-${fileName}-clean`)).toBeVisible();
    await expect(studioPage.page.locator('#takaro-root').getByText('Cannot edit in read-only editor')).toBeVisible();
  });

  test.fixme('Cannot save command config', async ({}) => {});

  test.fixme('Cannot delete command config argument', async ({}) => {});
});
