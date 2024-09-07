import { expect } from '@playwright/test';
import { extendedTest } from '../fixtures/index.js';

extendedTest.describe('smoke', () => {
  extendedTest('should open onboarding when new module with no functions is created', async ({ takaro, context }) => {
    await takaro.moduleDefinitionsPage.goto();

    const [moduleBuilderPage] = await Promise.all([
      context.waitForEvent('page'),
      await takaro.moduleDefinitionsPage.open('Module without functions'),
    ]);
    await moduleBuilderPage.waitForLoadState();
    await expect(moduleBuilderPage.locator('h1', { hasText: 'Choose one to get started' })).toBeVisible();
  });

  // TODO: this extendedTest should move to modules
  extendedTest('should open module builder in new tab', async ({ context, takaro }) => {
    await takaro.moduleDefinitionsPage.goto();

    const [moduleBuilderPage] = await Promise.all([
      context.waitForEvent('page'),
      await takaro.moduleDefinitionsPage.open('Module with functions'),
    ]);
    await moduleBuilderPage.waitForLoadState();

    await expect(moduleBuilderPage.getByText('Module with functions')).toBeVisible();
  });

  extendedTest.fixme('should redirect when surfed to non existing module', async ({ page }) => {
    await page.goto('module-builder/not-existing-module');
    await page.waitForURL('**/error404');
  });
});

extendedTest.describe('filetab', () => {
  extendedTest.beforeEach(async ({ takaro }) => {
    await takaro.moduleBuilderPage.goto();
  });

  extendedTest('Editing shows dirty indicator', async ({ takaro }) => {
    const { moduleBuilderPage } = takaro;
    const fileName = 'my-hook';
    await moduleBuilderPage.openFile(fileName);
    const editor = await moduleBuilderPage.getEditor();
    await editor.click();
    await moduleBuilderPage.page.keyboard.type('dirty');
    const fileTab = await moduleBuilderPage.getFileTab(fileName);
    await expect(fileTab.getByTestId('close-my-hook-dirty')).toBeVisible();
  });

  extendedTest('Saving hides dirty indicator', async ({ takaro }) => {
    const { moduleBuilderPage } = takaro;
    await moduleBuilderPage.openFile('my-hook');

    const editor = await moduleBuilderPage.getEditor();
    await editor.click();
    await moduleBuilderPage.page.keyboard.type('dirty');

    await moduleBuilderPage.page.keyboard.press('Control+s');
    await expect(moduleBuilderPage.page.getByTestId('close-my-hook-clean')).toBeVisible();
  });

  extendedTest('Closing dirty file should trigger discard dialog', async ({ takaro }) => {
    const { moduleBuilderPage } = takaro;
    const fileName = 'my-hook';
    await moduleBuilderPage.openFile(fileName);

    const editor = await moduleBuilderPage.getEditor();
    await editor.click();
    await moduleBuilderPage.page.keyboard.type('dirty');
    await moduleBuilderPage.closeTab(fileName, true);
    await expect(moduleBuilderPage.page.getByRole('dialog')).toBeVisible();
  });

  extendedTest('Closing clean file should close tab', async ({ takaro }) => {
    const { moduleBuilderPage } = takaro;
    const fileName = 'my-hook';
    await moduleBuilderPage.openFile(fileName);
    await moduleBuilderPage.closeTab(fileName);
    await expect(moduleBuilderPage.page.getByRole('tab', { name: fileName })).toHaveCount(0);
  });

  extendedTest.describe('context menu', () => {
    extendedTest.fixme('should close all tabs to the right', async () => {});
    extendedTest.fixme('should close all saved tabs', async () => {});
    extendedTest.fixme('should close all ohter tabs', async () => {});
  });
});

extendedTest.describe('filetree', () => {
  extendedTest.beforeEach(async ({ takaro }) => {
    await takaro.moduleBuilderPage.goto();
  });

  extendedTest.describe('file context menu', () => {
    extendedTest.beforeEach(async ({ takaro }) => {
      await takaro.moduleBuilderPage.goto();
    });

    extendedTest('should open', async ({ takaro }) => {
      const { moduleBuilderPage } = takaro;
      const file = await moduleBuilderPage.getTreeFile('my-hook');
      await file.click({ button: 'right' });

      await expect(moduleBuilderPage.page.getByRole('menu')).toBeVisible();
      await expect(moduleBuilderPage.page.getByRole('menuitem', { name: 'Rename file' })).toBeVisible();
      await expect(moduleBuilderPage.page.getByRole('menuitem', { name: 'Delete file' })).toBeVisible();
    });

    extendedTest('Should trigger delete', async ({ takaro }) => {
      const { moduleBuilderPage } = takaro;
      const file = await moduleBuilderPage.getTreeFile('my-hook');
      await file.click({ button: 'right' });

      await moduleBuilderPage.page.getByRole('menuitem', { name: 'Delete file' }).click();

      // expect delete dialog to be visible
      await expect(moduleBuilderPage.page.getByRole('dialog')).toBeVisible();
    });

    extendedTest.fixme('Should trigger rename', async ({ takaro }) => {
      const { moduleBuilderPage } = takaro;
      const file = await moduleBuilderPage.getTreeFile('my-hook');
      await file.click({ button: 'right' });
      await moduleBuilderPage.page.getByRole('menuitem', { name: 'Rename file' }).click();
      await expect(moduleBuilderPage.page.locator('input[name="file"]')).toBeFocused();
    });
  });
  extendedTest('Should Create and Delete hook', async ({ page, takaro }) => {
    const fileName = 'extendedTest-hook';
    await takaro.moduleBuilderPage.createFile(fileName, 'hooks');
    await takaro.moduleBuilderPage.deleteFile(fileName);
    await expect(page.getByRole('button', { name: fileName })).toHaveCount(0);
  });

  extendedTest('Should Create and Delete function', async ({ page, takaro }) => {
    const fileName = 'extendedTest-function';
    await takaro.moduleBuilderPage.createFile(fileName, 'functions');
    await takaro.moduleBuilderPage.deleteFile(fileName);
    await expect(page.getByRole('button', { name: fileName })).toHaveCount(0);
  });

  extendedTest('Should Create and Delete command', async ({ page, takaro }) => {
    const fileName = 'extendedTest-command';
    await takaro.moduleBuilderPage.createFile(fileName, 'commands');
    await takaro.moduleBuilderPage.deleteFile(fileName);
    await expect(page.getByRole('button', { name: fileName })).toHaveCount(0);
  });

  extendedTest('Should Create and Delete cronjob', async ({ page, takaro }) => {
    const fileName = 'extendedTest-cronjob';
    await takaro.moduleBuilderPage.createFile(fileName, 'cronjobs');
    await takaro.moduleBuilderPage.deleteFile(fileName);
    await expect(page.getByRole('button', { name: fileName })).toHaveCount(0);
  });
});

extendedTest('Can copy module', async ({ page, takaro }) => {
  const { moduleBuilderPage, moduleDefinitionsPage } = takaro;
  const copyName = `${moduleBuilderPage.mod.name}-copy`;

  await moduleBuilderPage.goto();
  await moduleBuilderPage.page.getByRole('button', { name: 'Make copy of module' }).click();
  await moduleBuilderPage.page.getByLabel('Module name').fill(copyName);
  await moduleBuilderPage.page.getByRole('button', { name: 'Copy Module' }).click();

  await moduleBuilderPage.page.getByTestId('snack-module-copied').getByRole('img').first().click();
  await moduleBuilderPage.page.getByTestId('snack-module-copied').getByText('open new module').click();

  await expect(page.getByRole('banner').getByText(copyName)).toBeVisible();

  await moduleDefinitionsPage.goto();
  await expect(page.getByText(copyName)).toBeVisible();
});

extendedTest.describe('Built-in modules', () => {
  extendedTest.describe('filetree', () => {
    extendedTest('Cannot create file', async ({ takaro }) => {
      const { moduleBuilderPage } = takaro;
      moduleBuilderPage.mod = takaro.builtinModule;
      await moduleBuilderPage.goto();
      const hooksDir = await moduleBuilderPage.getTreeDir('hooks');
      await hooksDir.hover();
      await expect(moduleBuilderPage.page.locator('button[aria-label="Create file"]')).not.toBeVisible();
    });

    extendedTest('Cannot edit file', async ({ takaro }) => {
      const { moduleBuilderPage } = takaro;
      moduleBuilderPage.mod = takaro.builtinModule;
      await moduleBuilderPage.goto();

      const treeFile = await moduleBuilderPage.getTreeFile(moduleBuilderPage.mod.commands[0].name);
      await treeFile.hover();
      await expect(moduleBuilderPage.page.locator('button[aria-label="Edit file"]')).not.toBeVisible();
      await expect(moduleBuilderPage.page.locator('button[aria-label="Delete file"]')).not.toBeVisible();

      await treeFile.click({ button: 'right' });
      await expect(moduleBuilderPage.page.getByRole('menu')).not.toBeVisible();
    });
  });

  extendedTest('Cannot edit text in built-in module', async ({ takaro }) => {
    const { moduleBuilderPage } = takaro;
    moduleBuilderPage.mod = takaro.builtinModule;
    await moduleBuilderPage.goto();

    const fileName = moduleBuilderPage.mod.commands[0].name;
    await moduleBuilderPage.openFile(fileName);

    const editor = await moduleBuilderPage.getEditor();
    await editor.click();
    await moduleBuilderPage.page.keyboard.type('dirty');

    const fileTab = await moduleBuilderPage.getFileTab(fileName);
    await expect(fileTab.getByTestId(`close-${fileName}-clean`)).toBeVisible();
    await expect(
      moduleBuilderPage.page.locator('#takaro-root').getByText('Cannot edit in read-only editor'),
    ).toBeVisible();
  });

  extendedTest.fixme('Cannot save command config', async () => {});
  extendedTest.fixme('Cannot delete command config argument', async () => {});
});

extendedTest.describe('Item configuration', () => {
  extendedTest.describe('Cronjob config', () => {});
  extendedTest.describe('Hook config', () => {});

  extendedTest.describe('Command config', () => {
    extendedTest.fixme('Can add argument', async ({ takaro }) => {
      const { moduleBuilderPage } = takaro;
      await moduleBuilderPage.goto();
      await moduleBuilderPage.createFile('extendedTestCommand', 'commands');
      await moduleBuilderPage.openFile('extendedTestCommand');

      await moduleBuilderPage.page.getByRole('button', { name: 'New' }).click();
      await moduleBuilderPage.page.getByLabel('Name', { exact: true }).fill('extendedTestArgument');
      await moduleBuilderPage.page.getByText('String', { exact: true }).click();
      await moduleBuilderPage.page.getByRole('option', { name: 'String' }).click();
      await moduleBuilderPage.page.getByRole('textbox', { name: 'Help text' }).fill('Some helpful text for the user');
      await moduleBuilderPage.page.getByRole('button', { name: 'Save command config' }).click();
      // await expect(moduleBuilderPage.page.getByText('extendedTestArgument')).toBeVisible();
      await moduleBuilderPage.page.reload();
      await moduleBuilderPage.openFile('extendedTestCommand');
      await expect(moduleBuilderPage.page.locator('input[name="arguments.0.name"]')).toHaveValue(
        'extendedTestArgument',
      );
    });

    extendedTest.fixme('Can move arguments around', async ({ takaro }) => {
      extendedTest.slow();
      const { moduleBuilderPage } = takaro;
      await moduleBuilderPage.goto();
      await moduleBuilderPage.createFile('extendedTestCommand', 'commands');
      await moduleBuilderPage.openFile('extendedTestCommand');

      let i = 0;
      // Create 3 args, "one" "two" and "three"
      for (const [key, value] of Object.entries(['one', 'two', 'three'])) {
        i++;
        await moduleBuilderPage.page.getByRole('button', { name: 'New' }).click();
        await moduleBuilderPage.page.locator(`input[name="arguments.${key}.name"]`).fill(value);
        await moduleBuilderPage.page.getByText('String', { exact: true }).nth(i).click();
        await moduleBuilderPage.page.getByRole('option', { name: 'String' }).click();
        const helpText = moduleBuilderPage.page.locator(`input[name="arguments\\.${key}\\.helpText"]`);
        await helpText.focus();
        await helpText.fill('Some helpful text for the user');
      }

      await moduleBuilderPage.page.getByRole('button', { name: 'Save command config' }).click();

      await moduleBuilderPage.page.reload();
      await moduleBuilderPage.openFile('extendedTestCommand');

      // initial: one two three
      // after: one three two
      await moduleBuilderPage.page.getByRole('button', { name: 'Move up' }).nth(2).click();

      // after: three one two
      await moduleBuilderPage.page.getByRole('button', { name: 'Move up' }).nth(1).click();

      // after: three two one
      await moduleBuilderPage.page.getByRole('button', { name: 'Move down' }).nth(1).click();
      await moduleBuilderPage.page.getByRole('button', { name: 'Save command config' }).click();

      await moduleBuilderPage.page.reload();
      await moduleBuilderPage.openFile('extendedTestCommand');

      // Now check that the order is correct
      await expect(moduleBuilderPage.page.locator('input[name="arguments.0.name"]')).toHaveValue('three');
      await expect(moduleBuilderPage.page.locator('input[name="arguments.1.name"]')).toHaveValue('two');
      await expect(moduleBuilderPage.page.locator('input[name="arguments.2.name"]')).toHaveValue('one');
    });
  });
});
