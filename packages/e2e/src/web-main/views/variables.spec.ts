import playwright from '@playwright/test';
import { extendedTest } from '../fixtures/index.js';
import { navigateTo } from '../helpers.js';

const { expect } = playwright;

extendedTest('Can view variables', async ({ page, takaro, extended }) => {
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
