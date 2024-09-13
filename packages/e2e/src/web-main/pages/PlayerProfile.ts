import { PlayerOutputDTO } from '@takaro/apiclient';
import { BasePage } from './BasePage.js';
import type { Page } from '@playwright/test';

export class PlayerProfilePage extends BasePage {
  public player: PlayerOutputDTO;

  constructor(
    public readonly page: Page,
    player: PlayerOutputDTO,
  ) {
    super(page);
    this.player = player;
  }

  async goto() {
    await this.page.goto(`/player/${this.player.id}`);
  }

  async gotoInventory() {
    await this.page.goto(`/player/${this.player.id}/inventory`);
  }

  async assignRole({ roleName }: { roleName: string }) {
    await this.page.goto(`/player/${this.player.id}/role/assign`);
    await this.page.locator('#roleId').click();

    await this.page.getByRole('option', { name: roleName }).click();
    await this.page.getByRole('button', { name: 'Assign role' }).click();
  }
  async unassignRole({ roleName }: { roleName: string }) {
    await this.page.getByRole('row', { name: roleName }).getByRole('button', { name: 'player-actions' }).click();
    await this.page.getByRole('menuitem', { name: 'Unassign role' }).click();
    await this.page.getByRole('button', { name: 'Unassign role' }).click();
  }

  async gotoEvents() {
    await this.page.goto(`/player/${this.player.id}/events`);
  }

  async gotoEconomy() {
    await this.page.goto(`/player/${this.player.id}/economy`);
  }
}
