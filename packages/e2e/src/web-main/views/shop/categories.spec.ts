import { expect } from '@playwright/test';
import { test } from '../../fixtures/index.js';

test.describe('Shop Categories Management', () => {
  test('Can view categories page', async ({ takaro, page }) => {
    const { shopCategoriesPage } = takaro;
    await shopCategoriesPage.goto();

    // Verify page title
    await expect(page.getByRole('heading', { name: 'Shop Categories' })).toBeVisible();

    // Verify default categories are visible - check for root categories (not children)
    const defaultCategories = ['Resources', 'Vehicles', 'Consumables', 'Building', 'Weapons', 'Armor', 'Tools'];
    for (const category of defaultCategories) {
      // Check for categories that are root level (not prefixed with parent path)
      const categoryCell = page.getByRole('cell').filter({ hasText: new RegExp(`^[^>]*${category}$`) });
      await expect(categoryCell.first()).toBeVisible();
    }

    // Verify hierarchical display - Weapons should have children
    await shopCategoriesPage.verifyCategoryHierarchy('Melee', 'Weapons');
    await shopCategoriesPage.verifyCategoryHierarchy('Ranged', 'Weapons');
  });

  test('Can create root category', async ({ takaro }) => {
    const { shopCategoriesPage } = takaro;
    await shopCategoriesPage.goto();

    const categoryData = {
      name: 'Electronics',
      emoji: '⚡',
    };

    await shopCategoriesPage.createCategory(categoryData);

    // Verify category appears in list
    await shopCategoriesPage.verifyCategoryExists(categoryData.name, categoryData.emoji);
  });

  test('Can create child category', async ({ takaro }) => {
    const { shopCategoriesPage } = takaro;
    await shopCategoriesPage.goto();

    const categoryData = {
      name: 'Power Tools',
      emoji: '🔌',
      parentId: 'Tools',
    };

    await shopCategoriesPage.createCategory(categoryData);

    // Verify it appears under parent
    await shopCategoriesPage.verifyCategoryHierarchy(categoryData.name, categoryData.parentId);
  });

  test('Can edit category', async ({ takaro }) => {
    const { shopCategoriesPage } = takaro;
    await shopCategoriesPage.goto();

    // First create a category to edit
    const originalData = {
      name: 'Temporary Category',
      emoji: '📦',
    };
    await shopCategoriesPage.createCategory(originalData);

    // Edit the category
    const updates = {
      name: 'Updated Category',
      emoji: '📮',
      parentId: 'Resources',
    };
    await shopCategoriesPage.editCategory(originalData.name, updates);

    // Verify updates
    await shopCategoriesPage.verifyCategoryExists(updates.name, updates.emoji);
    await shopCategoriesPage.verifyCategoryHierarchy(updates.name, updates.parentId);
  });

  test('Can delete category', async ({ takaro, page }) => {
    const { shopCategoriesPage } = takaro;
    await shopCategoriesPage.goto();

    // Create a category to delete
    const categoryData = {
      name: 'To Be Deleted',
      emoji: '🗑️',
    };
    await shopCategoriesPage.createCategory(categoryData);

    // Delete it
    await shopCategoriesPage.deleteCategory(categoryData.name);

    // Verify it's gone
    await expect(page.getByRole('row', { name: categoryData.name })).not.toBeVisible();
  });

  test('Cannot delete category with children', async ({ takaro, page }) => {
    const { shopCategoriesPage } = takaro;
    await shopCategoriesPage.goto();

    // Try to delete Weapons (which has children) - find the root level one
    // The root category won't have ">" in its text
    const weaponsRows = await page.getByRole('row').filter({ hasText: 'Weapons' }).all();
    let rootWeaponsRow;
    for (const row of weaponsRows) {
      const text = await row.textContent();
      if (text && !text.includes('>')) {
        rootWeaponsRow = row;
        break;
      }
    }

    if (!rootWeaponsRow) {
      throw new Error('Could not find root Weapons category');
    }

    await rootWeaponsRow.getByRole('button', { name: 'Delete category' }).click();

    // Verify warning message
    await expect(page.getByText(/This category has \d+ sub-categor/)).toBeVisible();

    // Click delete anyway
    await page.getByRole('button', { name: 'Delete' }).click();

    // Category should still exist (backend should prevent deletion)
    await shopCategoriesPage.verifyCategoryExists('Weapons', '⚔️');
  });

  test('Category listing count updates', async ({ takaro }) => {
    const { shopCategoriesPage, shopListingPage } = takaro;

    // Create a test category
    await shopCategoriesPage.goto();
    const categoryData = {
      name: 'Test Count Category',
      emoji: '🔢',
    };
    await shopCategoriesPage.createCategory(categoryData);

    // Verify initial count is 0
    const initialCount = await shopCategoriesPage.getCategoryCount(categoryData.name);
    expect(initialCount).toBe(0);

    // Create a shop listing with this category
    await shopListingPage.goto();
    await shopListingPage.createListing({
      name: 'Test Item for Count',
      price: 100,
      categories: [categoryData.name],
      items: [{ itemId: 'Stone', amount: 1 }],
    });

    // Go back to categories and verify count increased
    await shopCategoriesPage.goto();
    const updatedCount = await shopCategoriesPage.getCategoryCount(categoryData.name);
    expect(updatedCount).toBe(1);
  });

  test('Hierarchical category counting', async ({ takaro }) => {
    const { shopCategoriesPage, shopListingPage } = takaro;

    // Create parent and child categories
    await shopCategoriesPage.goto();
    const parentData = {
      name: 'Parent Category',
      emoji: '📂',
    };
    const childData = {
      name: 'Child Category',
      emoji: '📁',
      parentId: parentData.name,
    };

    await shopCategoriesPage.createCategory(parentData);
    await shopCategoriesPage.createCategory(childData);

    // Create listing in child category
    await shopListingPage.goto();
    await shopListingPage.createListing({
      name: 'Child Item',
      price: 50,
      categories: [childData.name],
      items: [{ itemId: 'Wood', amount: 1 }],
    });

    // Verify counts
    await shopCategoriesPage.goto();
    const parentCount = await shopCategoriesPage.getCategoryCount(parentData.name);
    const childCount = await shopCategoriesPage.getCategoryCount(childData.name);

    // Parent should show total including children
    expect(parentCount).toBe(1);
    expect(childCount).toBe(1);
  });
});
