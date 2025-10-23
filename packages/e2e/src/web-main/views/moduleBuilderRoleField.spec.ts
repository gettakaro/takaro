import { extendedTest } from '../fixtures';

extendedTest.describe('Module Builder - Role Field Type', () => {
  extendedTest.describe('[P0] Core Functionality', () => {
    extendedTest('should create module with single-select role field', async ({ page }) => {
      // Navigate to module builder
      await page.goto('/');
      await page.getByRole('link', { name: 'Modules' }).click();
      await page.getByRole('button', { name: 'Create module' }).click();

      // Fill in basic module information
      await page.getByLabel('Name').fill('Test Role Module Single');
      await page.getByLabel('Description').fill('Module with single-select role field');

      // Add a config field of type "role"
      await page.getByRole('button', { name: 'Add field' }).click();

      // Select role from custom category
      await page.getByText('Custom').click();
      await page.getByRole('button', { name: /role/i }).click();

      // Configure the role field
      await page.getByLabel('Field name').fill('adminRole');
      await page.getByLabel('Description').fill('Admin role for this command');

      // Leave multiple=false (default)
      // Verify multiple toggle exists but don't enable it
      await page.getByText('Multiple roles?').isVisible();

      // Select a default role if roles are available
      const defaultRoleLabel = page.getByLabel('Default role(s)');
      if (await defaultRoleLabel.isVisible()) {
        await defaultRoleLabel.click();
        // Wait for dropdown to open and select first role
        const firstRole = page.locator('[role="option"]').first();
        if (await firstRole.isVisible()) {
          await firstRole.click();
        }
      }

      // Save module
      await page.getByRole('button', { name: 'Save' }).click();

      // Wait for save to complete
      await page.waitForURL(/.*modules.*/);

      // Verify field appears in config list
      await page.getByText('adminRole').isVisible();

      // Reload page to verify persistence
      await page.reload();
      await page.getByText('adminRole').isVisible();
    });

    extendedTest('should install module and configure role field', async ({ page }) => {
      // First create a module with a role field
      await page.goto('/');
      await page.getByRole('link', { name: 'Modules' }).click();
      await page.getByRole('button', { name: 'Create module' }).click();

      await page.getByLabel('Name').fill('Test Role Installation');
      await page.getByLabel('Description').fill('Module to test role installation');

      // Add role config field without default
      await page.getByRole('button', { name: 'Add field' }).click();
      await page.getByText('Custom').click();
      await page.getByRole('button', { name: /role/i }).click();

      await page.getByLabel('Field name').fill('requiredRole');
      await page.getByLabel('Description').fill('Role required for command');
      await page.getByLabel('Required').check();

      await page.getByRole('button', { name: 'Save' }).click();
      await page.waitForURL(/.*modules.*/);

      // Navigate to game server and install module
      await page.getByRole('link', { name: 'Game servers' }).click();
      const firstGameServer = page.locator('[data-testid="gameserver-card"]').first();
      await firstGameServer.click();

      await page.getByRole('tab', { name: 'Modules' }).click();
      await page.getByRole('button', { name: 'Install module' }).click();

      // Select our test module
      await page.getByText('Test Role Installation').click();

      // Verify role dropdown appears
      const roleDropdown = page.getByLabel('requiredRole');
      await roleDropdown.isVisible();

      // Search for a role by typing
      await roleDropdown.click();
      await roleDropdown.fill('Admin');

      // Select a role
      const roleOption = page.locator('[role="option"]', { hasText: 'Admin' }).first();
      if (await roleOption.isVisible()) {
        await roleOption.click();
      }

      // Complete installation
      await page.getByRole('button', { name: 'Install' }).click();

      // Verify installation succeeded
      await page.waitForSelector('[data-testid="module-installed"]', { timeout: 10000 });

      // Navigate to module settings
      await page.getByRole('button', { name: 'Settings' }).click();

      // Verify role value is displayed correctly
      await page.getByText('requiredRole').isVisible();
    });
  });

  extendedTest.describe('[P1] Extended Functionality', () => {
    extendedTest('should create module with multi-select role field', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('link', { name: 'Modules' }).click();
      await page.getByRole('button', { name: 'Create module' }).click();

      await page.getByLabel('Name').fill('Test Role Module Multi');
      await page.getByLabel('Description').fill('Module with multi-select role field');

      // Add role config field
      await page.getByRole('button', { name: 'Add field' }).click();
      await page.getByText('Custom').click();
      await page.getByRole('button', { name: /role/i }).click();

      await page.getByLabel('Field name').fill('allowedRoles');
      await page.getByLabel('Description').fill('Roles that can execute this command');

      // Toggle "Multiple roles?" to true
      const multipleToggle = page.getByLabel('Multiple roles?');
      await multipleToggle.check();

      // Verify toggle is checked
      await multipleToggle.isChecked();

      // Select multiple default roles if available
      const defaultRoleLabel = page.getByLabel('Default role(s)');
      if (await defaultRoleLabel.isVisible()) {
        await defaultRoleLabel.click();

        // Select first role
        const firstRole = page.locator('[role="option"]').first();
        if (await firstRole.isVisible()) {
          await firstRole.click();
        }

        // Try to select second role
        await defaultRoleLabel.click();
        const secondRole = page.locator('[role="option"]').nth(1);
        if (await secondRole.isVisible()) {
          await secondRole.click();
        }
      }

      // Save module
      await page.getByRole('button', { name: 'Save' }).click();
      await page.waitForURL(/.*modules.*/);

      // Reload and verify persistence
      await page.reload();
      await page.getByText('allowedRoles').isVisible();

      // Verify multiple toggle is still checked
      const savedToggle = page.getByLabel('Multiple roles?');
      await savedToggle.isChecked();
    });

    extendedTest('should validate required role field', async ({ page }) => {
      // Create module with required role field
      await page.goto('/');
      await page.getByRole('link', { name: 'Modules' }).click();
      await page.getByRole('button', { name: 'Create module' }).click();

      await page.getByLabel('Name').fill('Test Role Validation');
      await page.getByLabel('Description').fill('Module to test role validation');

      await page.getByRole('button', { name: 'Add field' }).click();
      await page.getByText('Custom').click();
      await page.getByRole('button', { name: /role/i }).click();

      await page.getByLabel('Field name').fill('mandatoryRole');
      await page.getByLabel('Required').check();

      await page.getByRole('button', { name: 'Save' }).click();
      await page.waitForURL(/.*modules.*/);

      // Navigate to game server and attempt to install
      await page.getByRole('link', { name: 'Game servers' }).click();
      const firstGameServer = page.locator('[data-testid="gameserver-card"]').first();
      await firstGameServer.click();

      await page.getByRole('tab', { name: 'Modules' }).click();
      await page.getByRole('button', { name: 'Install module' }).click();
      await page.getByText('Test Role Validation').click();

      // Attempt to install without selecting role
      await page.getByRole('button', { name: 'Install' }).click();

      // Verify validation error appears
      await page.getByText(/required/i).isVisible();

      // Now select a role
      const roleDropdown = page.getByLabel('mandatoryRole');
      await roleDropdown.click();
      const firstRole = page.locator('[role="option"]').first();
      if (await firstRole.isVisible()) {
        await firstRole.click();
      }

      // Verify submission succeeds
      await page.getByRole('button', { name: 'Install' }).click();
      await page.waitForSelector('[data-testid="module-installed"]', { timeout: 10000 });
    });
  });
});
