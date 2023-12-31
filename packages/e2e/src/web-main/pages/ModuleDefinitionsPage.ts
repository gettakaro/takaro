import { Page } from '@playwright/test';
import { BasePage } from './BasePage.js';
import playwright from '@playwright/test';

const { expect } = playwright;

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
    await this.page.waitForLoadState();
  }

  async open(name: string) {
    const [studioPage] = await Promise.all([
      this.page.context().waitForEvent('page'),
      this.page.getByText(name).click(),
    ]);
    return studioPage;
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
    await this.page.getByRole('link', { name: oldName }).getByRole('button', { name: 'Settings' }).click();
    await this.page.getByRole('menuitem', { name: 'Edit module' }).click();

    if (name) {
      await this.fillName(name);
    }
    if (description) {
      await this.fillDescription(description);
    }

    // TODO: delete existing permissions first
    if (permissions) {
      permissions.forEach(async (permission, index) => {
        await this.fillPermission(permission, index);
      });
    }

    if (save) {
      await this.page.getByRole('button', { name: 'Save changes' }).click();
    }
  }

  async delete(name: string) {
    await this.page.getByRole('link', { name: name }).getByRole('button', { name: 'Settings' }).click();
    await this.page.getByRole('menuitem', { name: 'Delete module' }).click();
    await this.page.getByRole('button', { name: 'Delete module' }).click();
    await expect(this.page.getByText(name)).toHaveCount(0);
    // TOOD: expect (module to be deleted)
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
    await this.page.getByRole('link', { name: 'Module', exact: true }).click();

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
    if (index == 0) {
      await this.page.getByRole('button', { name: 'Add first permission' }).click();
    } else {
      await this.page.getByRole('button', { name: 'New permission' }).click();
    }

    await this.page.locator(`[id="permissions.${index}.permission"]`).fill(name);
    await this.page.locator(`[id="permissions.${index}.description"]`).fill(description);
    await this.page.locator(`[id="permissions.${index}.friendlyName"]`).fill(friendlyName);
  }
}
