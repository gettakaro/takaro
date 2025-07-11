import { expect } from '@playwright/test';
import { test } from '../../fixtures/index.js';

test.describe('Shop Listing Categories Integration', () => {
  test('Can assign categories when creating listing', async ({ takaro }) => {
    const { shopListingPage, shopPage } = takaro;

    await shopListingPage.goto();

    const listingData = {
      name: 'Categorized Item',
      price: 250,
      categories: ['Weapons', 'Tools'],
      items: [{ itemId: 'Iron', amount: 5 }],
    };

    await shopListingPage.createListing(listingData);

    // Verify categories appear as badges on listing
    await shopPage.verifyListingHasCategories(listingData.name, listingData.categories);
  });

  test('Can update listing categories', async ({ takaro }) => {
    const { shopListingPage, shopPage } = takaro;

    // Create a listing first
    await shopListingPage.goto();
    const listingData = {
      name: 'Item to Update Categories',
      price: 100,
      categories: ['Resources'],
      items: [{ itemId: 'Stone', amount: 10 }],
    };
    await shopListingPage.createListing(listingData);

    // Edit the listing
    await shopPage.editListing(listingData.name);

    // Update categories
    const newCategories = ['Building', 'Tools'];
    await shopListingPage.selectCategories(newCategories);
    await shopListingPage.updateListing({});

    // Verify updated categories
    await shopPage.goto();
    await shopPage.verifyListingHasCategories(listingData.name, newCategories);
  });

  test('Can bulk assign categories', async ({ takaro }) => {
    const { shopListingPage, shopPage } = takaro;

    // Create multiple listings
    const listings = [
      { name: 'Bulk Item 1', price: 50, items: [{ itemId: 'Wood', amount: 1 }] },
      { name: 'Bulk Item 2', price: 60, items: [{ itemId: 'Stone', amount: 1 }] },
      { name: 'Bulk Item 3', price: 70, items: [{ itemId: 'Iron', amount: 1 }] },
    ];

    for (const listing of listings) {
      await shopListingPage.goto();
      await shopListingPage.createListing(listing);
    }

    // Bulk assign categories
    await shopPage.goto();
    await shopPage.bulkAssignCategories(
      listings.map((l) => l.name),
      ['Resources', 'Building'],
    );

    // Verify all listings have the categories
    for (const listing of listings) {
      await shopPage.verifyListingHasCategories(listing.name, ['Resources', 'Building']);
    }
  });

  test('Can filter by category', async ({ takaro }) => {
    const { shopListingPage, shopPage } = takaro;

    // Create listings with different categories
    const weaponItem = {
      name: 'Sword',
      price: 500,
      categories: ['Weapons'],
      items: [{ itemId: 'Iron', amount: 10 }],
    };

    const toolItem = {
      name: 'Pickaxe',
      price: 300,
      categories: ['Tools'],
      items: [{ itemId: 'Iron', amount: 5 }],
    };

    const multiCategoryItem = {
      name: 'Combat Knife',
      price: 200,
      categories: ['Weapons', 'Tools'],
      items: [{ itemId: 'Iron', amount: 3 }],
    };

    // Create all items
    for (const item of [weaponItem, toolItem, multiCategoryItem]) {
      await shopListingPage.goto();
      await shopListingPage.createListing(item);
    }

    // Filter by Weapons
    await shopPage.goto();
    await shopPage.filterByCategory(['Weapons']);

    const weaponListings = await shopPage.getVisibleListings();
    const weaponNames = weaponListings.map((l) => l.name);

    expect(weaponNames).toContain('Sword');
    expect(weaponNames).toContain('Combat Knife');
    expect(weaponNames).not.toContain('Pickaxe');

    // Clear and filter by Tools
    await shopPage.clearCategoryFilters();
    await shopPage.filterByCategory(['Tools']);

    const toolListings = await shopPage.getVisibleListings();
    const toolNames = toolListings.map((l) => l.name);

    expect(toolNames).toContain('Pickaxe');
    expect(toolNames).toContain('Combat Knife');
    expect(toolNames).not.toContain('Sword');
  });

  test('Can filter by multiple categories', async ({ takaro }) => {
    const { shopPage } = takaro;

    await shopPage.goto();

    // Filter by both Weapons and Tools
    await shopPage.filterByCategory(['Weapons', 'Tools']);

    const listings = await shopPage.getVisibleListings();

    // Should show items from either category
    expect(listings.length).toBeGreaterThan(0);

    // Verify all visible items have at least one of the selected categories
    for (const listing of listings) {
      const hasWeapons = listing.categories?.includes('Weapons');
      const hasTools = listing.categories?.includes('Tools');
      expect(hasWeapons || hasTools).toBe(true);
    }
  });

  test('Can filter uncategorized items', async ({ takaro }) => {
    const { shopListingPage, shopPage } = takaro;

    // Create an uncategorized item
    await shopListingPage.goto();
    const uncategorizedItem = {
      name: 'Uncategorized Item',
      price: 25,
      categories: [], // No categories
      items: [{ itemId: 'Stone', amount: 1 }],
    };
    await shopListingPage.createListing(uncategorizedItem);

    // Create a categorized item
    await shopListingPage.goto();
    const categorizedItem = {
      name: 'Categorized Item',
      price: 30,
      categories: ['Resources'],
      items: [{ itemId: 'Wood', amount: 1 }],
    };
    await shopListingPage.createListing(categorizedItem);

    // Filter uncategorized
    await shopPage.goto();
    await shopPage.filterUncategorized();

    const listings = await shopPage.getVisibleListings();
    const names = listings.map((l) => l.name);

    expect(names).toContain('Uncategorized Item');
    expect(names).not.toContain('Categorized Item');
  });

  test('Category counts update in filter', async ({ takaro }) => {
    const { shopListingPage, shopPage } = takaro;

    // Get initial count for a category
    await shopPage.goto();
    const initialCount = await shopPage.getCategoryFilterCount('Building');

    // Create a new item in Building category
    await shopListingPage.goto();
    await shopListingPage.createListing({
      name: 'New Building Material',
      price: 75,
      categories: ['Building'],
      items: [{ itemId: 'Wood', amount: 20 }],
    });

    // Check count increased
    await shopPage.goto();
    const updatedCount = await shopPage.getCategoryFilterCount('Building');
    expect(updatedCount).toBe(initialCount + 1);
  });

  test('Category search in listing form', async ({ takaro }) => {
    const { shopListingPage } = takaro;

    await shopListingPage.goto();

    // Test search functionality
    await shopListingPage.verifyCategorySearchWorks('Wea', ['Weapons']);
    await shopListingPage.verifyCategorySearchWorks('Tool', ['Tools']);

    // Verify case insensitive
    await shopListingPage.verifyCategorySearchWorks('armor', ['Armor']);
  });

  test('Category hierarchy displayed in selector', async ({ takaro }) => {
    const { shopListingPage } = takaro;

    await shopListingPage.goto();

    // Verify parent-child relationship is visually represented
    await shopListingPage.verifyCategoryHierarchyInSelector('Weapons', 'Melee');
    await shopListingPage.verifyCategoryHierarchyInSelector('Armor', 'Helmet');
  });

  test('Selected categories persist on form errors', async ({ takaro }) => {
    const { shopListingPage } = takaro;

    await shopListingPage.goto();

    // Select categories
    const selectedCategories = ['Weapons', 'Tools'];
    await shopListingPage.selectCategories(selectedCategories);

    // Submit form with missing required fields (should cause error)
    await page.getByRole('button', { name: 'Create listing' }).click();

    // Verify validation errors appear
    await shopListingPage.verifyValidationError('name', 'Name is required');

    // Verify categories are still selected
    const currentCategories = await shopListingPage.getSelectedCategories();
    expect(currentCategories.sort()).toEqual(selectedCategories.sort());
  });
});
