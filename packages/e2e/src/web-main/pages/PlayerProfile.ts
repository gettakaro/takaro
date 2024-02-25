import { PlayerOutputDTO } from '@takaro/apiclient';
import { BasePage } from './BasePage.js';
import { Page } from '@playwright/test';

export class PlayerProfilePage extends BasePage {
  public player: PlayerOutputDTO;

  constructor(public readonly page: Page, player: PlayerOutputDTO) {
    super(page);
    this.player = player;
  }

  async goto() {
    await this.page.goto(`/player/${this.player.id}`);
  }

  async gotoInventory() {
    await this.page.goto(`/player/${this.player.id}/inventory`);
  }

  async gotoEvents() {
    await this.page.goto(`/player/${this.player.id}/events`);
  }

  async gotoEconomy() {
    await this.page.goto(`/player/${this.player.id}/economy`);
  }
}
