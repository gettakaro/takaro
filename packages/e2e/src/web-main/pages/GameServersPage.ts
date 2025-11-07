import { GameServerOutputDTO } from '@takaro/apiclient';
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class GameServersPage extends BasePage {
  constructor(
    public readonly page: Page,
    public gameServer: GameServerOutputDTO,
  ) {
    super(page);
  }

  async goto() {
    await this.page.goto('/gameservers');
  }

  async gotoGameServer() {
    await this.page.goto(`/gameserver/${this.gameServer.id}/dashboard`);
  }

  async gotoGameServerConsole() {
    await this.page.goto(`/gameserver/${this.gameServer.id}/dashboard/console`);
  }

  async create() {
    await this.page.goto('/gameservers/create');
  }

  async delete(name: string) {
    const card = this.page.getByTestId(`gameserver-${this.gameServer.id}-card`);
    await card.getByRole('button', { name: 'Settings' }).click();
    await this.page.getByText('delete gameserver').click();

    await expect(this.page.getByRole('dialog')).toBeVisible();
    await this.page.getByPlaceholder(name).fill(name);
    await this.page.getByRole('button', { name: 'Delete gameserver' }).click();
  }

  async action(action: 'Edit' | 'View') {
    const card = this.page.getByTestId(`gameserver-${this.gameServer.id}-card`);
    await card.getByRole('button', { name: 'Settings' }).click();
    await this.page.getByText(`${action} gameserver`).click();
  }

  async nameCreateEdit(value: string) {
    await this.page.getByPlaceholder('My cool server').fill(value);
  }

  async selectGameServerType(value: string) {
    await this.page.getByText('Select...').click();
    await this.page.getByRole('option', { name: value }).locator('div').click();
  }

  async clickSave() {
    await this.page.getByRole('button', { name: 'Save changes' }).click();
  }

  async resetCurrency() {
    const card = this.page.getByTestId(`gameserver-${this.gameServer.id}-card`);
    await card.getByRole('button', { name: 'Settings' }).click();
    await this.page.getByText("Reset all players' currency").click();

    // Wait for dialog to appear
    await expect(this.page.getByRole('dialog')).toBeVisible();

    // Type game server name in confirmation field
    await this.page.getByLabel('Confirmation').fill(this.gameServer.name);

    // Click reset button
    await this.page.getByRole('button', { name: 'Reset all currency' }).click();

    // Wait for dialog to close
    await expect(this.page.getByRole('dialog')).not.toBeVisible();
  }
}
