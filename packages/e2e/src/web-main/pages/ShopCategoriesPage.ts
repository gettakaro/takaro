import { BasePage } from './BasePage.js';
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export interface CategoryData {
  name: string;
  emoji: string;
  parentId?: string;
}

export class ShopCategoriesPage extends BasePage {
  constructor(
    public readonly page: Page,
    private gameServerId: string,
  ) {
    super(page);
  }

  async goto() {
    await this.page.goto(`/gameserver/${this.gameServerId}/shop/categories`);
  }

  async createCategory(data: CategoryData) {
    await this.page.getByRole('button', { name: 'Create category' }).click();

    // Wait for drawer to open
    await this.page.waitForSelector('h1:has-text("Create Category")');

    // Fill in the form
    await this.page.getByLabel('Category Name').fill(data.name);

    // The emoji picker is already visible
    // Wait for emoji picker to be fully loaded
    await this.page.waitForTimeout(500);

    // Try to find search input in the emoji picker
    const emojiSearch = this.page.locator('input[placeholder*="Search"], input[placeholder*="search"]');
    if ((await emojiSearch.count()) > 0) {
      // Search for the emoji
      await emojiSearch.fill(data.emoji);
      await this.page.waitForTimeout(300);
    } else {
      // If no search, we might need to navigate to the right category
      // For now, let's assume the emoji is visible after scrolling
    }

    // Click on the emoji - try different selectors
    const emojiButton = this.page
      .locator(`button:has-text("${data.emoji}")`)
      .or(this.page.getByText(data.emoji, { exact: true }))
      .or(this.page.locator(`[aria-label*="${data.emoji}"]`));

    await emojiButton.first().click({ force: true });

    if (data.parentId) {
      // Wait a bit for form to be fully interactive
      await this.page.waitForTimeout(500);

      // Click on the parent category selector
      const parentSelector = this.page.locator('#parentId').or(this.page.getByLabel('Parent Category'));
      await parentSelector.click();

      // Select the parent option
      await this.page.getByRole('option', { name: data.parentId }).click();
    }

    await this.page.getByRole('button', { name: 'Create Category' }).click();

    // Wait for success message
    await expect(this.page.getByText('Category created successfully')).toBeVisible();
  }

  async editCategory(name: string, updates: Partial<CategoryData>) {
    // Click on the edit button for the specific category
    // Use a more specific selector to avoid matching child categories
    const row = this.page.getByRole('row').filter({
      has: this.page.getByRole('cell').filter({ hasText: new RegExp(`^[^>]*${name}$`) }),
    });
    await row.getByRole('button', { name: 'Edit category' }).click();

    // Wait for drawer to open
    await this.page.waitForSelector('h1:has-text("Edit Category")');

    if (updates.name) {
      await this.page.getByLabel('Category Name').clear();
      await this.page.getByLabel('Category Name').fill(updates.name);
    }

    if (updates.emoji) {
      // The emoji picker is already visible
      // Wait for emoji picker to be fully loaded
      await this.page.waitForTimeout(500);

      // Try to find search input in the emoji picker
      const emojiSearch = this.page.locator('input[placeholder*="Search"], input[placeholder*="search"]');
      if ((await emojiSearch.count()) > 0) {
        // Search for the emoji
        await emojiSearch.fill(updates.emoji);
        await this.page.waitForTimeout(300);
      }

      // Click on the emoji - try different selectors
      const emojiButton = this.page
        .locator(`button:has-text("${updates.emoji}")`)
        .or(this.page.getByText(updates.emoji, { exact: true }))
        .or(this.page.locator(`[aria-label*="${updates.emoji}"]`));

      await emojiButton.first().click({ force: true });
    }

    if (updates.parentId !== undefined) {
      // Wait a bit for form to be fully interactive
      await this.page.waitForTimeout(500);

      // Click on the parent category selector
      const parentSelector = this.page.locator('#parentId').or(this.page.getByLabel('Parent Category'));
      await parentSelector.click();

      if (updates.parentId) {
        await this.page.getByRole('option', { name: updates.parentId }).click();
      } else {
        await this.page.getByRole('option', { name: 'None (Root Category)' }).click();
      }
    }

    await this.page.getByRole('button', { name: 'Update Category' }).click();
    await expect(this.page.getByText('Category updated successfully')).toBeVisible();
  }

  async deleteCategory(name: string) {
    // Click on the delete button for the specific category
    // Use a more specific selector to avoid matching child categories
    const row = this.page.getByRole('row').filter({
      has: this.page.getByRole('cell').filter({ hasText: new RegExp(`^[^>]*${name}$`) }),
    });
    await row.getByRole('button', { name: 'Delete category' }).click();

    // Confirm in dialog
    await this.page.getByRole('button', { name: 'Delete' }).click();

    // Verify category is removed (wait a bit for the deletion to process)
    await this.page.waitForTimeout(500);
    await expect(row).not.toBeVisible();
  }

  async viewCategory(name: string) {
    // Categories are displayed in a table, just verify visibility
    await expect(this.page.getByRole('row', { name })).toBeVisible();
  }

  async getCategoryCount(name: string): Promise<number> {
    const row = this.page.getByRole('row', { name });
    const countText = await row.locator('[data-testid="listing-count"]').textContent();
    return parseInt(countText || '0', 10);
  }

  async verifyCategoryExists(name: string, emoji: string) {
    const row = this.page.getByRole('row', { name });
    await expect(row).toBeVisible();
    await expect(row.getByText(emoji)).toBeVisible();
  }

  async verifyCategoryHierarchy(childName: string, parentName: string) {
    // Find the child category cell that contains parent > child pattern
    const childCell = this.page.getByRole('cell').filter({ hasText: new RegExp(`${parentName}\\s*>\\s*${childName}`) });
    await expect(childCell.first()).toBeVisible();
  }

  async getVisibleCategories(): Promise<string[]> {
    const rows = await this.page.getByRole('row').all();
    const names: string[] = [];

    // Skip header row
    for (let i = 1; i < rows.length; i++) {
      const nameCell = rows[i].locator('td').first();
      const name = await nameCell.textContent();
      if (name) names.push(name.trim());
    }

    return names;
  }
}
