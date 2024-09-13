import { BasePage } from './BasePage.js';
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class RolesPage extends BasePage {
  constructor(public readonly page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto('/roles');
  }

  private async openSettings(name: string) {
    await this.page.getByTestId(`role-${name}`).getByRole('button', { name: 'Settings' }).click();
  }

  async view(name: string) {
    await this.openSettings(name);
    await this.page.getByRole('menuitem', { name: 'View role' }).click();
  }

  async create({ name, permissions = [] }: { name?: string; permissions?: string[] }) {
    await this.page.getByRole('link', { name: 'Role', exact: true }).click();

    if (name) {
      await this.fillName(name);
    }

    for (const permission of permissions) {
      await this.togglePermission(permission);
    }
    await this.page.getByRole('button', { name: 'Create role' }).click();
  }

  async delete(name: string) {
    await this.openSettings(name);
    await this.page.getByRole('menuitem', { name: 'Delete role' }).click();
    await this.page.getByPlaceholder(name).fill(name);
    await this.page.getByRole('button', { name: 'Delete role' }).click();
    await expect(this.page.getByText(name)).not.toBeVisible();
  }

  async edit(
    oldName: string,
    {
      name,
      permissions = [],
    }: {
      name?: string;
      permissions?: string[];
    },
  ) {
    await this.openSettings(oldName);
    await this.page.getByRole('menuitem', { name: 'Edit role' }).click();

    if (name) {
      this.fillName(name);
    }

    for (const permission of permissions) {
      await this.togglePermission(permission);
    }
    await this.page.getByRole('button', { name: 'Update role' }).click();
  }

  private async togglePermission(permission: string) {
    await this.page.getByLabel(permission).click();
  }

  private async fillName(name: string) {
    await this.page.getByLabel('Role name').fill(name);
  }
}
