import { expect } from '@playwright/test';
import { test } from '../../fixtures/index.js';

test.describe('Shop Category Navigation and UI', () => {
  test('Shop navigation tabs include Categories', async ({ takaro, page }) => {
    const { shopPage } = takaro;

    await shopPage.goto();

    // Verify Categories link is visible
    const categoriesLink = page.getByRole('link', { name: 'Categories' });
    await expect(categoriesLink).toBeVisible();

    // Click Categories link
    await categoriesLink.click();

    // Verify navigation to categories page
    await expect(page).toHaveURL(/\/shop\/categories$/);
    await expect(page.getByRole('heading', { name: 'Shop Categories' })).toBeVisible();
  });

  test('Can navigate between shop tabs', async ({ takaro, page }) => {
    const { shopPage } = takaro;

    await shopPage.goto();

    // Navigate to Categories
    await page.getByRole('link', { name: 'Categories' }).click();
    await expect(page).toHaveURL(/\/shop\/categories$/);

    // Navigate back to Shop
    await page.getByRole('link', { name: 'Shop' }).click();
    await expect(page).toHaveURL(/\/shop$/);

    // Navigate to Orders
    await page.getByRole('link', { name: 'Orders' }).click();
    await expect(page).toHaveURL(/\/shop\/orders$/);
  });

  test('Category filter sidebar displays correctly', async ({ takaro, page }) => {
    const { shopPage } = takaro;

    await shopPage.goto();

    // Verify category filter is visible
    const categoryFilter = page.getByTestId('category-filter');
    await expect(categoryFilter).toBeVisible();

    // Verify header
    await expect(categoryFilter.getByRole('heading', { name: 'Categories' })).toBeVisible();

    // Verify categories are listed
    const categories = ['Resources', 'Vehicles', 'Consumables', 'Building', 'Weapons', 'Armor', 'Tools'];
    for (const category of categories) {
      await expect(categoryFilter.getByLabel(category)).toBeVisible();
    }

    // Verify hierarchical display
    const weaponsCategory = categoryFilter.getByText('Weapons').locator('..');
    const meleeCategory = categoryFilter.getByText('Melee').locator('..');

    // Melee should be indented (check position)
    const weaponsBox = await weaponsCategory.boundingBox();
    const meleeBox = await meleeCategory.boundingBox();

    if (weaponsBox && meleeBox) {
      expect(meleeBox.x).toBeGreaterThan(weaponsBox.x);
    }
  });

  test('Category filter shows counts', async ({ takaro, page }) => {
    const { shopPage } = takaro;

    await shopPage.goto();

    const categoryFilter = page.getByTestId('category-filter');

    // Each category should show count in parentheses
    const resourcesLabel = categoryFilter.locator('label:has-text("Resources")');
    const countText = await resourcesLabel.textContent();

    // Should contain count like "Resources (5)"
    expect(countText).toMatch(/Resources.*\(\d+\)/);
  });

  test('Clear all filters button works', async ({ takaro, page }) => {
    const { shopPage } = takaro;

    await shopPage.goto();

    // Select multiple categories
    await shopPage.filterByCategory(['Weapons', 'Tools']);

    // Verify Clear all filters button appears
    const clearButton = page.getByRole('button', { name: 'Clear all filters' });
    await expect(clearButton).toBeVisible();

    // Click clear
    await clearButton.click();

    // Verify all filters are unchecked
    const categoryFilter = page.getByTestId('category-filter');
    const checkedBoxes = await categoryFilter.locator('input[type="checkbox"]:checked').count();
    expect(checkedBoxes).toBe(0);

    // Clear button should disappear
    await expect(clearButton).not.toBeVisible();
  });

  test('Category badges display on listing cards', async ({ takaro, page }) => {
    const { shopListingPage, shopPage } = takaro;

    // Create a listing with categories
    await shopListingPage.goto();
    await shopListingPage.createListing({
      name: 'Badge Test Item',
      price: 100,
      categories: ['Weapons', 'Tools'],
      items: [{ itemId: 'Iron', amount: 1 }],
    });

    await shopPage.goto();

    // Find the listing card
    const listingCard = page.locator('[data-testid="shop-listing-card"]').filter({ hasText: 'Badge Test Item' });

    // Verify category badges
    const weaponsBadge = listingCard.locator('[data-testid="category-badge"]').filter({ hasText: 'Weapons' });
    const toolsBadge = listingCard.locator('[data-testid="category-badge"]').filter({ hasText: 'Tools' });

    await expect(weaponsBadge).toBeVisible();
    await expect(toolsBadge).toBeVisible();

    // Verify emoji is displayed
    await expect(weaponsBadge).toContainText('⚔️');
    await expect(toolsBadge).toContainText('🔧');
  });

  test('Category badges clickable for filtering', async ({ takaro, page }) => {
    const { shopPage } = takaro;

    await shopPage.goto();

    // Click a category badge on a listing
    const firstBadge = page.locator('[data-testid="category-badge"]').first();
    const badgeText = await firstBadge.textContent();
    const categoryName = badgeText?.replace(/[^\s]+\s/, '').trim(); // Remove emoji

    await firstBadge.click();

    // Verify category filter is applied
    if (categoryName) {
      const categoryFilter = page.getByTestId('category-filter');
      const checkbox = categoryFilter.getByLabel(categoryName);
      await expect(checkbox).toBeChecked();
    }
  });

  test('Create category button navigates correctly', async ({ takaro, page }) => {
    const { shopCategoriesPage } = takaro;

    await shopCategoriesPage.goto();

    // Click create button
    await page.getByRole('button', { name: 'Create category' }).click();

    // Should navigate to create form
    await expect(page).toHaveURL(/\/shop\/categories\/create$/);

    // Verify form elements
    await expect(page.getByLabel('Name')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Pick an emoji' })).toBeVisible();
    await expect(page.getByLabel('Parent category')).toBeVisible();
  });

  test('Edit category navigates correctly', async ({ takaro, page }) => {
    const { shopCategoriesPage } = takaro;

    await shopCategoriesPage.goto();

    // Click edit on a category
    await page.getByRole('row', { name: 'Weapons' }).getByRole('button', { name: 'Edit category' }).click();

    // Should navigate to edit form
    await expect(page).toHaveURL(/\/shop\/categories\/[\w-]+\/update$/);

    // Form should be pre-filled
    await expect(page.getByLabel('Name')).toHaveValue('Weapons');
    // Since emoji is a picker, we need to verify the selected emoji is displayed
    await expect(page.getByRole('button', { name: '⚔️' })).toBeVisible();
  });

  test('Breadcrumb navigation in category forms', async ({ takaro, page }) => {
    const { shopCategoriesPage } = takaro;

    await shopCategoriesPage.goto();
    await page.getByRole('button', { name: 'Create category' }).click();

    // Check breadcrumb
    const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' });
    await expect(breadcrumb).toBeVisible();

    // Should show: Shop > Categories > Create
    await expect(breadcrumb.getByRole('link', { name: 'Shop' })).toBeVisible();
    await expect(breadcrumb.getByRole('link', { name: 'Categories' })).toBeVisible();
    await expect(breadcrumb.getByText('Create')).toBeVisible();

    // Click Categories in breadcrumb
    await breadcrumb.getByRole('link', { name: 'Categories' }).click();
    await expect(page).toHaveURL(/\/shop\/categories$/);
  });

  test('Mobile responsive category filter', async ({ takaro, page }) => {
    const { shopPage } = takaro;

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await shopPage.goto();

    // On mobile, filter might be in a collapsible section or drawer
    // This depends on implementation, adjust as needed
    const categoryFilter = page.getByTestId('category-filter');

    // Filter should still be functional on mobile
    await categoryFilter.getByLabel('Weapons').check();

    // Verify filter is applied
    const listings = await shopPage.getVisibleListings();
    expect(listings.length).toBeGreaterThan(0);
  });

  test('Keyboard navigation in category selector', async ({ takaro, page }) => {
    const { shopListingPage } = takaro;

    await shopListingPage.goto();

    // Open category selector
    await page.getByLabel('Categories').click();

    // Use keyboard to navigate
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Space'); // Select

    // Verify a category was selected
    const selectedCategories = await shopListingPage.getSelectedCategories();
    expect(selectedCategories.length).toBeGreaterThan(0);

    // Escape to close
    await page.keyboard.press('Escape');

    // Selector should be closed
    await expect(page.getByRole('checkbox', { name: 'Weapons' })).not.toBeVisible();
  });
});
