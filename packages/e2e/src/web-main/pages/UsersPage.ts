import type { Page } from '@playwright/test';
import playwright from '@playwright/test';
import { BasePage } from './BasePage.js';

const { expect } = playwright;

type Actions = 'profile' | 'editRoles' | 'delete';

export class UsersPage extends BasePage {
  constructor(public readonly page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto('/users');
  }

  async inviteUser(email: string) {
    this.page.getByRole('button', { name: 'Invite user' });
    await expect(this.page.getByRole('dialog')).toBeVisible();
    await this.page.getByPlaceholder('example@example.com').fill(email);
    await this.page.getByRole('button', { name: 'Send Invitation' }).click();
  }

  async action({ action, name }: { action: Actions; name: string }) {
    const tr = this.page.getByRole('row', { name });
    await tr.getByRole('button', { name: 'user-actions' }).click();

    switch (action) {
      case 'profile':
        await this.page.getByRole('menuitem', { name: 'Go to user profile' }).click();
        break;
      case 'editRoles':
        await this.page.getByRole('menuitem', { name: 'Edit roles' }).click();
        break;
      case 'delete':
        await this.page.getByRole('menuitem', { name: 'Delete user' }).click();
    }
  }
}
