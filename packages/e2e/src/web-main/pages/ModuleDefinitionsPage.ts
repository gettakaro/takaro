import { Page } from '@playwright/test';
import { BasePage } from './BasePage.js';

interface createPermission {
  name: string;
  description: string;
  friendlyName: string;
}

export class ModuleDefinitionsPage extends BasePage {
  constructor(public readonly page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto('/modules', { waitUntil: 'domcontentloaded' });
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
    description,
    permissions,
  }: {
    name?: string;
    description?: string;
    permissions?: createPermission[];
  }) {
    await this.page.getByRole('link', { name }).getByRole('button', { name: 'Edit module' }).click();

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
  }

  async delete(name: string) {
    await this.page.getByRole('link', { name }).getByRole('button', { name: 'Delete module' }).click();
  }

  // ===============================
  async create({
    name,
    description,
    permissions,
  }: {
    name?: string;
    description?: string;
    permissions?: createPermission[];
  }) {
    await this.page.getByText('new module').click();

    if (name) {
      await this.fillName(name);
    }
    if (description) {
      await this.fillDescription(description);
    }

    if (permissions && permissions.length > 0) {
      permissions.forEach(async (permission, index) => {
        await this.fillPermission(permission, index);
      });
    }

    await this.page.getByRole('button', { name: 'Save changes' }).click();
  }

  async fillName(name: string) {
    await this.page.getByLabel('Name').fill(name);
  }

  async fillDescription(description: string) {
    await this.page.getByLabel('Description').fill(description);
  }

  async fillPermission({ name, description, friendlyName }: createPermission, index: number) {
    await this.page.getByRole('button', { name: 'permission' }).click();
    await this.page.locator(`[id="permissions.${index}.permission"]`).type(name);
    await this.page.locator(`[id="permissions.${index}.description"]`).type(description);
    await this.page.locator(`[id="permissions.${index}.friendlyName"]`).type(friendlyName);
  }
}
