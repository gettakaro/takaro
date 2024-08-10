import { expect } from '@playwright/test';
import { extendedTest } from '../fixtures/index.js';

extendedTest.describe('smoke', () => {
  extendedTest('should open onboarding when new module with no functions is created', async ({ takaro, context }) => {
    await takaro.moduleDefinitionsPage.goto();

    const [studioPage] = await Promise.all([
      context.waitForEvent('page'),
      await takaro.moduleDefinitionsPage.open('Module without functions'),
    ]);
    await studioPage.waitForLoadState();
    await expect(studioPage.locator('h1', { hasText: 'Choose one to get started' })).toBeVisible();
  });

  // TODO: this extendedTest should move to modules
  extendedTest('should open studio in new tab', async ({ context, takaro }) => {
    await takaro.moduleDefinitionsPage.goto();

    const [studioPage] = await Promise.all([
      context.waitForEvent('page'),
      await takaro.moduleDefinitionsPage.open('Module with functions'),
    ]);
    await studioPage.waitForLoadState();

    await expect(studioPage.getByText('Module with functions')).toBeVisible();
  });

  extendedTest.fixme('should redirect when surfed to non existing module', async ({ page }) => {
    await page.goto('studio/not-existing-module');
    await page.waitForURL('**/error404');
  });
});

extendedTest.describe('filetab', () => {
  extendedTest.beforeEach(async ({ takaro }) => {
    await takaro.studioPage.goto();
  });

  extendedTest('Editing shows dirty indicator', async ({ takaro }) => {
    const { studioPage } = takaro;
    const fileName = 'my-hook';
    await studioPage.openFile(fileName);
    const editor = await studioPage.getEditor();
    await editor.click();
    await studioPage.page.keyboard.type('dirty');
    const fileTab = await studioPage.getFileTab(fileName);
    await expect(fileTab.getByTestId('close-my-hook-dirty')).toBeVisible();
  });

  extendedTest('Saving hides dirty indicator', async ({ takaro }) => {
    const { studioPage } = takaro;
    await studioPage.openFile('my-hook');

    const editor = await studioPage.getEditor();
    await editor.click();
    await studioPage.page.keyboard.type('dirty');

    await studioPage.page.keyboard.press('Control+s');
    await expect(studioPage.page.getByTestId('close-my-hook-clean')).toBeVisible();
  });

  extendedTest('Closing dirty file should trigger discard dialog', async ({ takaro }) => {
    const { studioPage } = takaro;
    const fileName = 'my-hook';
    await studioPage.openFile(fileName);

    const editor = await studioPage.getEditor();
    await editor.click();
    await studioPage.page.keyboard.type('dirty');
    await studioPage.closeTab(fileName, true);
    await expect(studioPage.page.getByRole('dialog')).toBeVisible();
  });

  extendedTest('Closing clean file should close tab', async ({ takaro }) => {
    const { studioPage } = takaro;
    const fileName = 'my-hook';
    await studioPage.openFile(fileName);
    await studioPage.closeTab(fileName);
    await expect(studioPage.page.getByRole('tab', { name: fileName })).toHaveCount(0);
  });

  extendedTest.describe('context menu', () => {
    extendedTest.fixme('should close all tabs to the right', async () => {});
    extendedTest.fixme('should close all saved tabs', async () => {});
    extendedTest.fixme('should close all ohter tabs', async () => {});
  });
});

extendedTest.describe('filetree', () => {
  extendedTest.beforeEach(async ({ takaro }) => {
    await takaro.studioPage.goto();
  });

  extendedTest.describe('file context menu', () => {
    extendedTest.beforeEach(async ({ takaro }) => {
      await takaro.studioPage.goto();
    });

    extendedTest('should open', async ({ takaro }) => {
      const { studioPage } = takaro;
      const file = await studioPage.getTreeFile('my-hook');
      await file.click({ button: 'right' });

      await expect(studioPage.page.getByRole('menu')).toBeVisible();
      await expect(studioPage.page.getByRole('menuitem', { name: 'Rename file' })).toBeVisible();
      await expect(studioPage.page.getByRole('menuitem', { name: 'Delete file' })).toBeVisible();
    });

    extendedTest('Should trigger delete', async ({ takaro }) => {
      const { studioPage } = takaro;
      const file = await studioPage.getTreeFile('my-hook');
      await file.click({ button: 'right' });

      await studioPage.page.getByRole('menuitem', { name: 'Delete file' }).click();

      // expect delete dialog to be visible
      await expect(studioPage.page.getByRole('dialog')).toBeVisible();
    });

    extendedTest.fixme('Should trigger rename', async ({ takaro }) => {
      const { studioPage } = takaro;
      const file = await studioPage.getTreeFile('my-hook');
      await file.click({ button: 'right' });
      await studioPage.page.getByRole('menuitem', { name: 'Rename file' }).click();
      await expect(studioPage.page.locator('input[name="file"]')).toBeFocused();
    });
  });
  extendedTest('Should Create and Delete hook', async ({ page, takaro }) => {
    const fileName = 'extendedTest-hook';
    await takaro.studioPage.createFile(fileName, 'hooks');
    await takaro.studioPage.deleteFile(fileName);
    await expect(page.getByRole('button', { name: fileName })).toHaveCount(0);
  });

  extendedTest('Should Create and Delete function', async ({ page, takaro }) => {
    const fileName = 'extendedTest-function';
    await takaro.studioPage.createFile(fileName, 'functions');
    await takaro.studioPage.deleteFile(fileName);
    await expect(page.getByRole('button', { name: fileName })).toHaveCount(0);
  });

  extendedTest('Should Create and Delete command', async ({ page, takaro }) => {
    const fileName = 'extendedTest-command';
    await takaro.studioPage.createFile(fileName, 'commands');
    await takaro.studioPage.deleteFile(fileName);
    await expect(page.getByRole('button', { name: fileName })).toHaveCount(0);
  });

  extendedTest('Should Create and Delete cronjob', async ({ page, takaro }) => {
    const fileName = 'extendedTest-cronjob';
    await takaro.studioPage.createFile(fileName, 'cronjobs');
    await takaro.studioPage.deleteFile(fileName);
    await expect(page.getByRole('button', { name: fileName })).toHaveCount(0);
  });
});

extendedTest('Can copy module', async ({ page, takaro }) => {
  const { studioPage, moduleDefinitionsPage } = takaro;
  const copyName = `${studioPage.mod.name}-copy`;

  await studioPage.goto();
  await studioPage.page.getByRole('button', { name: 'Make copy of module' }).click();
  await studioPage.page.getByLabel('Module name').fill(copyName);
  await studioPage.page.getByRole('button', { name: 'Copy Module' }).click();

  await studioPage.page.getByTestId('snack-module-copied').getByRole('img').first().click();
  await studioPage.page.getByTestId('snack-module-copied').getByText('open new module').click();

  await expect(page.getByRole('banner').getByText(copyName)).toBeVisible();

  await moduleDefinitionsPage.goto();
  await expect(page.getByText(copyName)).toBeVisible();
});

extendedTest.describe('Built-in modules', () => {
  extendedTest.describe('filetree', () => {
    extendedTest('Cannot create file', async ({ takaro }) => {
      const { studioPage } = takaro;
      studioPage.mod = takaro.builtinModule;
      await studioPage.goto();
      const hooksDir = await studioPage.getTreeDir('hooks');
      await hooksDir.hover();
      await expect(studioPage.page.locator('button[aria-label="Create file"]')).not.toBeVisible();
    });

    extendedTest('Cannot edit file', async ({ takaro }) => {
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

  extendedTest('Cannot edit text in built-in module', async ({ takaro }) => {
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

  extendedTest.fixme('Cannot save command config', async () => {});
  extendedTest.fixme('Cannot delete command config argument', async () => {});
});

extendedTest.describe('Item configuration', () => {
  extendedTest.describe('Cronjob config', () => {});
  extendedTest.describe('Hook config', () => {});

  extendedTest.describe('Command config', () => {
    extendedTest.fixme('Can add argument', async ({ takaro }) => {
      const { studioPage } = takaro;
      await studioPage.goto();
      await studioPage.createFile('extendedTestCommand', 'commands');
      await studioPage.openFile('extendedTestCommand');

      await studioPage.page.getByRole('button', { name: 'New' }).click();
      await studioPage.page.getByLabel('Name', { exact: true }).fill('extendedTestArgument');
      await studioPage.page.getByText('String', { exact: true }).click();
      await studioPage.page.getByRole('option', { name: 'String' }).click();
      await studioPage.page.getByRole('textbox', { name: 'Help text' }).fill('Some helpful text for the user');

      await studioPage.page.getByRole('button', { name: 'Save command config' }).click();

      // TODO: studio jumps to another file for some reason... Not sure why
      // await expect(studioPage.page.getByText('extendedTestArgument')).toBeVisible();

      await studioPage.page.reload();
      await studioPage.openFile('extendedTestCommand');
      await expect(studioPage.page.locator('input[name="arguments.0.name"]')).toHaveValue('extendedTestArgument');
    });

    extendedTest.fixme('Can move arguments around', async ({ takaro }) => {
      extendedTest.slow();
      const { studioPage } = takaro;
      await studioPage.goto();
      await studioPage.createFile('extendedTestCommand', 'commands');
      await studioPage.openFile('extendedTestCommand');

      let i = 0;
      // Create 3 args, "one" "two" and "three"
      for (const [key, value] of Object.entries(['one', 'two', 'three'])) {
        i++;
        await studioPage.page.getByRole('button', { name: 'New' }).click();
        await studioPage.page.locator(`input[name="arguments.${key}.name"]`).fill(value);
        await studioPage.page.getByText('String', { exact: true }).nth(i).click();
        await studioPage.page.getByRole('option', { name: 'String' }).click();
        const helpText = studioPage.page.locator(`input[name="arguments\\.${key}\\.helpText"]`);
        await helpText.focus();
        await helpText.fill('Some helpful text for the user');
      }

      await studioPage.page.getByRole('button', { name: 'Save command config' }).click();

      await studioPage.page.reload();
      await studioPage.openFile('extendedTestCommand');

      // initial: one two three
      // after: one three two
      await studioPage.page.getByRole('button', { name: 'Move up' }).nth(2).click();

      // after: three one two
      await studioPage.page.getByRole('button', { name: 'Move up' }).nth(1).click();

      // after: three two one
      await studioPage.page.getByRole('button', { name: 'Move down' }).nth(1).click();
      await studioPage.page.getByRole('button', { name: 'Save command config' }).click();

      await studioPage.page.reload();
      await studioPage.openFile('extendedTestCommand');

      // Now check that the order is correct
      await expect(studioPage.page.locator('input[name="arguments.0.name"]')).toHaveValue('three');
      await expect(studioPage.page.locator('input[name="arguments.1.name"]')).toHaveValue('two');
      await expect(studioPage.page.locator('input[name="arguments.2.name"]')).toHaveValue('one');
    });
  });
});
