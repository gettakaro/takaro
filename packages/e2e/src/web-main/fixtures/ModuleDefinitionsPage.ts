import { Page } from '@playwright/test';

export class ModuleDefinitionsPage {
  constructor(public readonly page: Page) {}

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

  async edit(name: string) {
    await this.page.getByRole('link', { name }).getByRole('button', { name: 'Edit module' }).click();
  }
  async delete(name: string) {
    await this.page.getByRole('link', { name }).getByRole('button', { name: 'Delete module' }).click();
  }

  // ===============================
  async create({ name, description }: { name?: string; description?: string }) {
    await this.page.getByText('new module').click();

    if (name) {
      await this.fillName(name);
    }
    if (description) {
      await this.fillDescription(description);
    }
  }

  async fillName(name: string) {
    await this.page.getByPlaceholder('module name').fill(name);
  }

  async fillDescription(description: string) {
    await this.page.getByPlaceholder('description').fill(description);
  }
}
