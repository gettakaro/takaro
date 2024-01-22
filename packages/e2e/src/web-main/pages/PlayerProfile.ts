import { Page } from '@playwright/test';
import { PlayerOutputDTO } from '@takaro/apiclient';
import { BasePage } from './BasePage.js';

export class PlayerProfilePage extends BasePage {
  public player: PlayerOutputDTO;

  constructor(public readonly page: Page, player: PlayerOutputDTO) {
    super(page);

    this.player = player;
  }

  async goto() {
    await this.page.goto(`/players/${this.player.id}/global`);
    await this.page.waitForLoadState('networkidle');
  }

  async gotoInventory() {
    await this.page.goto(`/players/${this.player.id}/inventory`);
    await this.page.waitForLoadState('networkidle');
  }

  async gotoEvents() {
    await this.page.goto(`/players/${this.player.id}/events`);
    await this.page.waitForLoadState('networkidle');
  }

  async gotoEconomy() {
    await this.page.goto(`/players/${this.player.id}/economy`);
    await this.page.waitForLoadState('networkidle');
  }
}
