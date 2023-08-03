import playwright from '@playwright/test';
import { test } from '../fixtures/index.js';

const { expect } = playwright;

test('Can view variables', async ({ page, takaro }) => {
  await takaro.client.variable.variableControllerCreate({
    key: 'test-variable',
    value: 'test-value',
    gameServerId: takaro.gameServer.id,
    moduleId: takaro.builtinModule.id,
    playerId: takaro.players[0].id,
  });

  await page.getByRole('link', { name: 'Variables' }).click();

  await expect(page.getByText('test-variable')).toBeVisible();
  await expect(page.getByText('test-value')).toBeVisible();
  await expect(page.getByText(takaro.builtinModule.name)).toBeVisible();
  await expect(page.getByText(takaro.gameServer.name)).toBeVisible();
  await expect(page.getByText(takaro.players[0].name)).toBeVisible();
});
