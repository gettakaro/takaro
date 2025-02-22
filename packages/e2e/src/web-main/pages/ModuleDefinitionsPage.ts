import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

interface Permission {
  name: string;
  description: string;
  friendlyName: string;
}

export class ModuleDefinitionsPage extends BasePage {
  constructor(public readonly page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto('/modules');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async open(name: string) {
    const [moduleBuilderPage] = await Promise.all([
      this.page.context().waitForEvent('page'),
      await this.openSettings(name),
      await this.page.getByRole('menuitem', { name: 'Open in Module Builder' }).click(),
    ]);
    return moduleBuilderPage;
  }

  async edit({
    name,
    oldName,
    description,
    permissions,
    save = true,
  }: {
    oldName: string;
    name?: string;
    description?: string;
    permissions?: Permission[];
    save?: boolean;
  }) {
    await this.openSettings(oldName);
    await this.page.getByRole('menuitem', { name: 'Edit module (builder)' }).click();

    if (name) {
      await this.fillName(name);
    }
    if (description) {
      await this.fillDescription(description);
    }

    if (permissions && permissions.length > 0) {
      await Promise.all(
        permissions.map(async (permission, index) => {
          return this.fillPermission(permission, index);
        }),
      );
    }

    if (save) {
      await this.page.getByRole('button', { name: 'Save changes' }).click();
    }
  }

  async copy(name: string, copyName: string) {
    await this.openSettings(name);
    await this.page.getByRole('menuitem', { name: 'Copy module', exact: true }).click();
    await this.page.getByLabel('Module name').fill(copyName);
    await this.page.getByRole('button', { name: 'Copy module' }).click();
  }

  async tag(name: string, semantic: 'patch' | 'minor' | 'major') {
    await this.openSettings(name);
    await this.page.getByRole('menuitem', { name: 'Tag module' }).click();

    this.page.getByLabel('Version level');
    await this.page.getByRole('button', { name: `Tag as ${semantic}` }).click();
  }

  async view(name: string) {
    await this.openSettings(name);
    await this.page.getByRole('menuitem', { name: 'View module', exact: true }).click();
  }

  private async openSettings(name: string) {
    await this.page.getByTestId(name).getByRole('button', { name: 'Settings' }).click();
  }

  async delete(name: string) {
    await this.openSettings(name);
    await this.page.getByRole('menuitem', { name: 'Delete module' }).click();
    await this.page.getByPlaceholder(name).fill(name);
    await this.page.getByRole('button', { name: 'Delete module' }).click();
    await expect(this.page.getByText(name)).toHaveCount(0);
  }

  // ===============================
  async create({
    name,
    description,
    permissions,
    save = true,
  }: {
    name?: string;
    description?: string;
    permissions?: Permission[];
    save?: boolean;
  }) {
    await this.page.getByRole('button', { name: 'Module actions', exact: true }).click();
    await this.page.getByRole('menuitem', { name: 'Create module with builder' }).click();

    if (name) {
      await this.fillName(name);
    }
    if (description) {
      await this.fillDescription(description);
    }

    if (permissions && permissions.length > 0) {
      for (let i = 0; i < permissions.length; i++) {
        await this.fillPermission(permissions[i], i);
      }
    }

    if (save) {
      await this.page.getByRole('button', { name: 'Save changes' }).click();
    }
  }

  async fillName(name: string) {
    await this.page.getByLabel('Name').fill(name);
  }

  async fillDescription(description: string) {
    await this.page.getByLabel('Description').fill(description);
  }

  async fillPermission({ name, description, friendlyName }: Permission, index: number) {
    // Creates a new permission field
    // first button name is different
    await this.page.getByRole('button', { name: 'Create new permission' }).click();

    await this.page.locator(`[id="permissions.${index}.permission"]`).fill(name);
    await this.page.locator(`[id="permissions.${index}.description"]`).fill(description);
    await this.page.locator(`[id="permissions.${index}.friendlyName"]`).fill(friendlyName);
  }
}
