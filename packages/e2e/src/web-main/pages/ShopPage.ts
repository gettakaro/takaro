import { BasePage } from './BasePage.js';
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export interface ListingData {
  id?: string;
  name: string;
  price: number;
  categories?: string[];
}

export class ShopPage extends BasePage {
  constructor(
    public readonly page: Page,
    private gameServerId: string,
  ) {
    super(page);
  }

  async goto() {
    await this.page.goto(`/gameserver/${this.gameServerId}/shop`);
  }

  async filterByCategory(categoryNames: string[]) {
    // Categories are shown in a sidebar filter
    const categoryFilter = this.page.getByTestId('category-filter');

    for (const categoryName of categoryNames) {
      await categoryFilter.getByLabel(categoryName).check();
    }

    // Wait for the listings to update
    await this.page.waitForLoadState('networkidle');
  }

  async filterUncategorized() {
    const categoryFilter = this.page.getByTestId('category-filter');
    await categoryFilter.getByLabel('Uncategorized').check();
    await this.page.waitForLoadState('networkidle');
  }

  async clearCategoryFilters() {
    await this.page.getByRole('button', { name: 'Clear all filters' }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async bulkAssignCategories(listingNames: string[], categoryNames: string[]) {
    // Select listings
    for (const listingName of listingNames) {
      await this.page.getByRole('row', { name: listingName }).getByRole('checkbox').check();
    }

    // Open bulk actions menu
    await this.page.getByRole('button', { name: 'Bulk actions' }).click();
    await this.page.getByRole('menuitem', { name: 'Assign categories' }).click();

    // Select categories in the dialog
    for (const categoryName of categoryNames) {
      await this.page.getByLabel(categoryName).check();
    }

    await this.page.getByRole('button', { name: 'Save' }).click();

    // Wait for success message
    await expect(this.page.getByText('Categories assigned successfully')).toBeVisible();
  }

  async getVisibleListings(): Promise<ListingData[]> {
    await this.page.waitForSelector('[data-testid="shop-listing-card"], [data-testid="shop-listing-row"]');

    // Handle both card and table views
    const isCardView = (await this.page.locator('[data-testid="shop-listing-card"]').count()) > 0;

    if (isCardView) {
      return this.getCardListings();
    } else {
      return this.getTableListings();
    }
  }

  private async getCardListings(): Promise<ListingData[]> {
    const cards = await this.page.locator('[data-testid="shop-listing-card"]').all();
    const listings: ListingData[] = [];

    for (const card of cards) {
      const name = await card.getByTestId('listing-name').textContent();
      const priceText = await card.getByTestId('listing-price').textContent();
      const price = parseInt(priceText?.replace(/\D/g, '') || '0', 10);

      // Get categories from badges
      const categoryBadges = await card.locator('[data-testid="category-badge"]').all();
      const categories: string[] = [];
      for (const badge of categoryBadges) {
        const category = await badge.textContent();
        if (category) categories.push(category.trim());
      }

      if (name) {
        listings.push({ name: name.trim(), price, categories });
      }
    }

    return listings;
  }

  private async getTableListings(): Promise<ListingData[]> {
    const rows = await this.page.getByRole('row').all();
    const listings: ListingData[] = [];

    // Skip header row
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const name = await row.getByTestId('listing-name').textContent();
      const priceText = await row.getByTestId('listing-price').textContent();
      const price = parseInt(priceText?.replace(/\D/g, '') || '0', 10);

      // Get categories from badges
      const categoryBadges = await row.locator('[data-testid="category-badge"]').all();
      const categories: string[] = [];
      for (const badge of categoryBadges) {
        const category = await badge.textContent();
        if (category) categories.push(category.trim());
      }

      if (name) {
        listings.push({ name: name.trim(), price, categories });
      }
    }

    return listings;
  }

  async navigateToCategories() {
    await this.page.getByRole('tab', { name: 'Categories' }).click();
  }

  async createListing() {
    await this.page.getByRole('button', { name: 'Create listing' }).click();
  }

  async editListing(name: string) {
    const isCardView = (await this.page.locator('[data-testid="shop-listing-card"]').count()) > 0;

    if (isCardView) {
      await this.page
        .getByTestId('shop-listing-card')
        .filter({ hasText: name })
        .getByRole('button', { name: 'Edit' })
        .click();
    } else {
      await this.page.getByRole('row', { name }).getByRole('button', { name: 'Edit' }).click();
    }
  }

  async verifyListingHasCategories(listingName: string, expectedCategories: string[]) {
    const listing = await this.page.locator(
      `[data-testid="shop-listing-card"]:has-text("${listingName}"), [role="row"]:has-text("${listingName}")`,
    );

    for (const category of expectedCategories) {
      await expect(listing.locator('[data-testid="category-badge"]', { hasText: category })).toBeVisible();
    }
  }

  async getCategoryFilterCount(categoryName: string): Promise<number> {
    const categoryFilter = this.page.getByTestId('category-filter');
    const categoryItem = categoryFilter.locator(`label:has-text("${categoryName}")`);
    const countText = await categoryItem.locator('[data-testid="category-count"]').textContent();

    // Extract number from text like "(5)"
    const match = countText?.match(/\((\d+)\)/);
    return match ? parseInt(match[1], 10) : 0;
  }
}
