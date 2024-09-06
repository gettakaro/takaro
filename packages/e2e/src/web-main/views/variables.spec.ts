import { expect } from '@playwright/test';
import { extendedTest } from '../fixtures/index.js';
import { navigateTo } from '../helpers.js';

extendedTest('Can view variables', async ({ page, extended, takaro }) => {
  await takaro.rootClient.variable.variableControllerCreate({
    key: 'test-variable',
    value: 'test-value',
    gameServerId: takaro.gameServer.id,
    moduleId: takaro.builtinModule.id,
    playerId: extended.players[0].id,
  });

  await navigateTo(page, 'global-variables');

  await expect(page.getByText('test-variable')).toBeVisible();
  await expect(page.getByText('test-value')).toBeVisible();
  await expect(page.getByText(takaro.builtinModule.name)).toBeVisible();
  await expect(page.getByText(takaro.gameServer.name)).toBeVisible();
  await expect(page.getByText(extended.players[0].name)).toBeVisible();
});

extendedTest('Can create variable', async ({ page, takaro, extended }) => {
  const variableName = 'test-variable';
  const variableValue = 'test-value';

  await navigateTo(page, 'global-variables');
  await page.getByText('Create variable').click();
  await expect(page).toHaveURL(/\/variables\/create$/);

  await page.getByLabel('Key').fill(variableName);
  await page.getByLabel('Value').fill(variableValue);

  // select game server
  await page.locator('#gameServerId').click();
  await page.getByRole('option', { name: takaro.gameServer.name }).click();

  // select player
  await page.locator('#playerId').click();
  await page.getByRole('option', { name: extended.players[0].name }).click();

  // select module
  await page.locator('#moduleId').click();
  await page.getByRole('option', { name: takaro.builtinModule.name, exact: true }).click();

  await page.getByRole('button', { name: 'Save variable' }).click();
  await expect(page.getByText(variableName)).toBeVisible();
  await expect(page.getByText(variableValue)).toBeVisible();
});

extendedTest('Can delete variable', async ({ page, takaro }) => {
  const variableKey = 'test-variable';
  const variableValue = 'val';
  await takaro.rootClient.variable.variableControllerCreate({
    key: variableKey,
    value: variableValue,
    gameServerId: takaro.gameServer.id,
    moduleId: takaro.builtinModule.id,
  });

  await navigateTo(page, 'global-variables');
  await expect(page.getByText(variableKey)).toBeVisible();
  await expect(page.getByRole('cell', { name: variableValue })).toBeVisible();

  await page.getByRole('button', { name: 'variable-actions' }).click();
  await page.getByRole('menuitem', { name: 'Delete variable' }).click();

  await page.getByRole('button', { name: 'Delete variable' }).click();
  await expect(page.getByRole('cell', { name: variableValue })).not.toBeVisible();
});

extendedTest('Can delete multiple variables at once', async ({ page, takaro }) => {
  const variable1Key = 'test-variable-1';
  const variable1Value = 'val';
  await takaro.rootClient.variable.variableControllerCreate({
    key: variable1Key,
    value: variable1Value,
    gameServerId: takaro.gameServer.id,
    moduleId: takaro.builtinModule.id,
  });

  const variable2Key = 'test-variable-2';
  const variable2Value = 'val';
  await takaro.rootClient.variable.variableControllerCreate({
    key: variable2Key,
    value: variable2Value,
    gameServerId: takaro.gameServer.id,
    moduleId: takaro.builtinModule.id,
  });

  await navigateTo(page, 'global-variables');
  await expect(page.getByText(variable1Key)).toBeVisible();
  await expect(page.getByText(variable2Key)).toBeVisible();

  await page.locator('#select-all-header-0').click();
  await page.getByRole('button', { name: 'Delete variables (2)', exact: false }).click();
  await page.getByRole('button', { name: 'Delete variables', exact: false }).click();

  await expect(page.getByRole('cell', { name: variable1Key })).not.toBeVisible();
  await expect(page.getByRole('cell', { name: variable2Key })).not.toBeVisible();
  await expect(page.getByText('Items will appear here. Add your first item to begin!')).toBeVisible();
});

extendedTest('Should show error when variable with same key exists', async ({ page, takaro }) => {
  const variableKey = 'test-variable';
  const variableValue = 'val';
  await takaro.rootClient.variable.variableControllerCreate({
    key: variableKey,
    value: variableValue,
  });

  await navigateTo(page, 'global-variables');
  await expect(page.getByText(variableKey)).toBeVisible();
  await expect(page.getByRole('cell', { name: variableValue })).toBeVisible();

  // try to create variable with same key
  await page.getByText('Create variable').click();
  await expect(page).toHaveURL(/\/variables\/create$/);
  await page.getByLabel('Key').fill(variableKey);
  await page.getByLabel('Value').fill(variableValue);

  await page.getByRole('button', { name: 'Save variable' }).click();
  await expect(page.getByText('Variable with this key already exists')).toBeVisible();
});

extendedTest('Can view value details', async ({ page, takaro }) => {
  const variableKey = 'test-variable';
  const variableValue = 'my very very very very very very very very long variable value';

  await takaro.rootClient.variable.variableControllerCreate({
    key: variableKey,
    value: variableValue,
    gameServerId: takaro.gameServer.id,
    moduleId: takaro.builtinModule.id,
  });

  await navigateTo(page, 'global-variables');
  await expect(page.getByText(variableKey)).toBeVisible();
  await expect(page.getByText(variableValue)).not.toBeVisible();

  // we consider there to be only one variable at this point.
  await page.getByText('View value').click();

  await expect(page.getByText(variableValue)).toBeVisible();
});

extendedTest('Can update variable', async ({ page, takaro }) => {
  const oldVariableKey = 'test-variable-old';
  const oldVariableValue = 'old-value';

  const newVariableKey = 'test-variable-new';
  const newVariableValue = 'new-value';

  await takaro.rootClient.variable.variableControllerCreate({
    key: oldVariableKey,
    value: oldVariableValue,
    gameServerId: takaro.gameServer.id,
    moduleId: takaro.builtinModule.id,
  });

  await navigateTo(page, 'global-variables');

  await page.getByRole('button', { name: 'variable-actions' }).click();
  await page.getByRole('menuitem', { name: 'Edit variable' }).click();

  await expect(page).toHaveURL(/\/variables\/update/);

  await page.getByLabel('Key').fill(newVariableKey);
  await page.getByLabel('Value').fill(newVariableValue);

  await page.getByRole('button', { name: 'Update variable' }).click();
  await expect(page.getByText(newVariableKey)).toBeVisible();
  await expect(page.getByText(newVariableValue)).toBeVisible();
});
