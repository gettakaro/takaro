import type { Locator, Page } from '@playwright/test';
import playwright from '@playwright/test';
import { ModuleOutputDTO } from '@takaro/apiclient';
import { BasePage } from './BasePage.js';

const { expect } = playwright;

export class ModuleBuilderPage extends BasePage {
  constructor(
    public readonly page: Page,
    public mod: ModuleOutputDTO,
  ) {
    super(page);
  }

  async goto() {
    expect(this.mod.id).toBeTruthy();
    await this.page.goto(`module-builder/${this.mod.id}`);
  }

  async getTreeFile(name: string): Promise<Locator> {
    return this.page.getByRole('button', { name });
  }
  async getTreeDir(name: 'hooks' | 'commands' | 'cronjobs' | 'functions'): Promise<Locator> {
    return this.page.getByRole('button', { name });
  }
  async createFile(name: string, type: 'hooks' | 'commands' | 'cronjobs' | 'functions'): Promise<void> {
    const dir = await this.getTreeDir(type);
    await dir.hover();
    await dir.getByRole('button').click();
    await this.page.locator('input[name="new-file"]').fill(name);
    await this.page.locator('input[name="new-file"]').press('Enter');
  }

  async openFile(name: string): Promise<void> {
    await this.page.getByRole('button', { name, exact: true }).click();
  }

  async deleteFile(name: string): Promise<void> {
    const file = await this.getTreeFile(name);
    await file.hover();
    await file.getByRole('button').nth(1).click();
    await this.page.getByRole('button', { name: 'Remove file' }).click();
  }

  async getEditor(): Promise<Locator> {
    return this.page.locator('.monaco-editor').nth(0);
  }

  async getFileTab(name: string): Promise<Locator> {
    return this.page.getByRole('tab', { name });
  }

  async closeTab(name: string, isDirty = false): Promise<void> {
    const tab = await this.getFileTab(name);
    await tab.hover();
    await tab.getByTestId(`close-${name}-${isDirty ? 'dirty' : 'clean'}`).click();
  }
}
