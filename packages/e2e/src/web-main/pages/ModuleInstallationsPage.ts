import type { Page } from '@playwright/test';
import { BasePage } from './BasePage.js';
import { GameServerOutputDTO } from '@takaro/apiclient';

export class ModuleInstallationsPage extends BasePage {
  constructor(
    public readonly page: Page,
    public gameServer: GameServerOutputDTO,
  ) {
    super(page);
  }

  async goto() {
    await this.page.goto(`/gameserver/${this.gameServer.id}/modules`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  private async openSettings(name: string) {
    const card = this.getModuleCard(name);
    await card.getByRole('button', { name: 'Settings' }).click();
  }

  async enable(name: string) {
    await this.openSettings(name);
    await this.page.getByRole('menuitem', { name: 'Enable module' }).click();
  }
  async disable(name: string) {
    await this.openSettings(name);
    await this.page.getByRole('menuitem', { name: 'Disable module' }).click();
  }

  async configure(name: string) {
    await this.openSettings(name);
    await this.page.getByRole('menuitem', { name: 'Configure module' }).click();
  }

  async changeVersion(name: string, version: string) {
    await this.openSettings(name);
    await this.page.getByRole('menuitem', { name: 'Upgrade/downgrade module' }).click();

    await this.page.getByRole('dialog').getByRole('button').nth(1).click();
    await this.page.getByRole('listitem').filter({ hasText: version }).click();
    await this.page.getByRole('button', { name: `to ${version}`, exact: false }).click();
  }

  async viewConfig(name: string) {
    await this.openSettings(name);
    await this.page.getByRole('menuitem', { name: 'View module config' }).click();
  }

  async uninstall(name: string) {
    await this.openSettings(name);
    await this.page.getByRole('menuitem', { name: 'Uninstall module' }).click();
    await this.page.getByLabel('Module name').fill(name);
    await this.page.getByRole('button', { name: 'Uninstall module' }).click();
  }

  getModuleCard(moduleName: string) {
    return this.page.getByTestId(`module-installation-${moduleName}-card`);
  }

  async openInstall(name: string, version: string) {
    const card = this.getModuleCard(name);

    //await this.page.waitForTimeout(10000);
    await card.locator('span').filter({ hasText: 'Install' }).locator('div').nth(3).click();
    await card.getByText(version, { exact: true }).click();
    await card.getByText(`Install ${version}`).click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async clickInstall() {
    await this.page.getByRole('button', { name: 'Install module' }).click();
  }
}
