import { BasePage } from './BasePage.js';
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export interface ShopListingFormData {
  name: string;
  price: number;
  draft?: boolean;
  categories?: string[];
  items?: Array<{
    itemId: string;
    amount: number;
    quality?: string;
  }>;
}

export class ShopListingPage extends BasePage {
  constructor(
    public readonly page: Page,
    private gameServerId: string,
  ) {
    super(page);
  }

  async goto() {
    await this.page.goto(`/gameserver/${this.gameServerId}/shop/listing/create`);
  }

  async gotoEdit(listingId: string) {
    await this.page.goto(`/gameserver/${this.gameServerId}/shop/listing/${listingId}/update`);
  }

  async createListing(data: ShopListingFormData) {
    await this.fillForm(data);
    await this.page.getByRole('button', { name: 'Create listing' }).click();

    // Wait for success message or redirect
    await expect(this.page).toHaveURL(new RegExp(`/gameserver/${this.gameServerId}/shop`));
  }

  async updateListing(data: Partial<ShopListingFormData>) {
    await this.fillForm(data);
    await this.page.getByRole('button', { name: 'Update listing' }).click();

    // Wait for success message
    await expect(this.page.getByText('Listing updated')).toBeVisible();
  }

  private async fillForm(data: Partial<ShopListingFormData>) {
    if (data.name !== undefined) {
      await this.page.getByLabel('Name').clear();
      await this.page.getByLabel('Name').fill(data.name);
    }

    if (data.price !== undefined) {
      await this.page.getByLabel('Price').clear();
      await this.page.getByLabel('Price').fill(data.price.toString());
    }

    if (data.draft !== undefined) {
      const checkbox = this.page.getByLabel('Draft');
      if (data.draft) {
        await checkbox.check();
      } else {
        await checkbox.uncheck();
      }
    }

    if (data.categories !== undefined) {
      await this.selectCategories(data.categories);
    }

    if (data.items !== undefined) {
      await this.configureItems(data.items);
    }
  }

  async selectCategories(categoryNames: string[]) {
    // Clear existing selections
    const selectedCategories = await this.page.locator('[data-testid="selected-category"]').all();
    for (const selected of selectedCategories) {
      await selected.getByRole('button', { name: 'Remove' }).click();
    }

    // Open category selector
    await this.page.getByLabel('Categories').click();

    // Select new categories
    for (const categoryName of categoryNames) {
      await this.page.getByRole('checkbox', { name: categoryName }).check();
    }

    // Close selector by clicking outside
    await this.page.keyboard.press('Escape');
  }

  async getSelectedCategories(): Promise<string[]> {
    const selectedElements = await this.page.locator('[data-testid="selected-category"]').all();
    const categories: string[] = [];

    for (const element of selectedElements) {
      const text = await element.textContent();
      if (text) {
        // Remove emoji and trim
        const name = text.replace(/^[^\s]+\s/, '').trim();
        categories.push(name);
      }
    }

    return categories;
  }

  private async configureItems(items: Array<{ itemId: string; amount: number; quality?: string }>) {
    // Remove existing items
    const existingItems = await this.page.locator('[data-testid="item-row"]').all();
    for (let i = existingItems.length - 1; i >= 0; i--) {
      await existingItems[i].getByRole('button', { name: 'Remove item' }).click();
    }

    // Add new items
    for (const item of items) {
      await this.page.getByRole('button', { name: 'Add item' }).click();

      const lastRow = this.page.locator('[data-testid="item-row"]').last();

      // Select item
      await lastRow.getByLabel('Item').click();
      await this.page.getByRole('option', { name: item.itemId }).click();

      // Set amount
      await lastRow.getByLabel('Amount').clear();
      await lastRow.getByLabel('Amount').fill(item.amount.toString());

      // Set quality if provided
      if (item.quality) {
        await lastRow.getByLabel('Quality').clear();
        await lastRow.getByLabel('Quality').fill(item.quality);
      }
    }
  }

  async verifyValidationError(field: string, expectedError: string) {
    const fieldGroup = this.page.getByTestId(`field-${field}`);
    await expect(fieldGroup.getByText(expectedError)).toBeVisible();
  }

  async verifyCategorySearchWorks(searchTerm: string, expectedResults: string[]) {
    await this.page.getByLabel('Categories').click();
    await this.page.getByPlaceholder('Search categories').fill(searchTerm);

    for (const expected of expectedResults) {
      await expect(this.page.getByRole('checkbox', { name: expected })).toBeVisible();
    }
  }

  async verifyCategoryHierarchyInSelector(parentName: string, childName: string) {
    await this.page.getByLabel('Categories').click();

    // Child should be indented under parent
    const parent = this.page.getByRole('checkbox', { name: parentName });
    const child = this.page.getByRole('checkbox', { name: childName });

    await expect(parent).toBeVisible();
    await expect(child).toBeVisible();

    // Verify visual hierarchy (child should be indented)
    const parentBox = await parent.boundingBox();
    const childBox = await child.boundingBox();

    if (parentBox && childBox) {
      expect(childBox.x).toBeGreaterThan(parentBox.x);
    }
  }
}
