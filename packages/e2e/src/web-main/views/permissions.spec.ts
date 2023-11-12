import { PERMISSIONS, basicTest } from '../fixtures/index.js';
// import playwright from '@playwright/test';
import { login } from '../fixtures/helpers.js';

// const { expect } = playwright;

basicTest('READ_GAMESERVERS', async ({ takaro, page }) => {
  const { GameServersPage, rootClient, testUser } = takaro;
  login(page, testUser.email, testUser.password);

  // the user should be able to see the page
  GameServersPage.goto();

  // Add permissions to the role
  rootClient.role.roleControllerUpdate(testUser.role.id, {
    permissions: [PERMISSIONS.READ_GAMESERVERS],
    name: testUser.role.name,
  });
});
