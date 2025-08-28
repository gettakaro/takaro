import { expect } from '@playwright/test';
import { test } from './fixtures/index.js';

test.describe('Shop Listing Icon Upload', () => {
  test.beforeEach(async () => {
    // The takaro fixture already provides a game server
    // No need to create one
  });

  test('should upload icon when creating shop listing', async ({ takaro, page }) => {
    // Use the game server from fixture
    const gameServerId = takaro.gameServer.id;

    // Navigate to shop page
    await page.goto(`/gameserver/${gameServerId}/shop`);

    // Click create new listing button
    await page.getByRole('button', { name: /create/i }).click();

    // Wait for form to load
    await expect(page.getByText('Create Shop listing')).toBeVisible();

    // Fill in basic fields
    await page.getByLabel('Friendly name').fill('Test Listing with Icon');
    await page.getByLabel('Price').fill('100');

    // Upload an icon
    const fileInput = page.locator('input[type="file"]');

    // Create a test image file path (using a placeholder since we can't create real files in tests)
    // In a real test environment, you'd have a test image file
    await fileInput.setInputFiles({
      name: 'test-icon.png',
      mimeType: 'image/png',
      buffer: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        'base64',
      ),
    });

    // Verify preview appears
    await expect(page.locator('img[alt="Icon preview"]')).toBeVisible();

    // Add an item (required field)
    await page.getByRole('button', { name: /add item/i }).click();
    // This would need to select an item from the dropdown - simplified for this test

    // Add description
    await page.getByLabel('Description').fill('This is a test shop listing with a custom icon');

    // Save the listing
    await page.getByRole('button', { name: /save/i }).click();

    // Wait for redirect back to shop page
    await expect(page).toHaveURL(new RegExp(`/gameserver/${gameServerId}/shop`));

    // Verify the listing appears with custom icon
    const newListing = page.locator('[data-testid*="shoplisting-"][data-testid*="-card"]').first();
    await expect(newListing).toBeVisible();

    // Check that the custom icon is displayed (not the default icon)
    const customIcon = newListing.locator('img').first();
    const iconSrc = await customIcon.getAttribute('src');
    expect(iconSrc).toContain('data:image');
  });

  test('should show fallback icon when custom icon fails to load', async ({ takaro, page }) => {
    // Use the game server from fixture
    const gameServerId = takaro.gameServer.id;

    // Create a listing with a broken icon directly via API
    const items = await takaro.adminClient.item.itemControllerSearch({ filters: { name: ['Stone'] } });
    const brokenIcon = 'data:image/png;base64,BROKEN_BASE64_DATA';

    const listing = await takaro.adminClient.shopListing.shopListingControllerCreate({
      gameServerId,
      items: [{ code: items.data.data[0].code, amount: 1 }],
      price: 150,
      name: 'Test Listing with Broken Icon',
      icon: brokenIcon,
      description: 'This listing has a broken icon that should fallback',
    });

    // Navigate to shop page
    await page.goto(`/gameserver/${gameServerId}/shop`);

    // Find the listing card
    const listingCard = page.locator(`[data-testid="shoplisting-${listing.data.data.id}-card"]`);
    await expect(listingCard).toBeVisible();

    // Check that fallback icon is displayed (should be the item icon)
    const icon = listingCard.locator('img').first();
    await page.waitForTimeout(1000); // Wait for error handler to trigger

    const iconSrc = await icon.getAttribute('src');
    // Should fallback to default item icon path
    expect(iconSrc).toMatch(/\/icons\/.+\/.+\.png/);
  });

  test('should display description with show more/less for long text', async ({ takaro, page }) => {
    // Use the game server from fixture
    const gameServerId = takaro.gameServer.id;

    // Create a listing with a long description
    const items = await takaro.adminClient.item.itemControllerSearch({ filters: { name: ['Stone'] } });
    const longDescription = 'A'.repeat(200); // 200 characters

    const listing = await takaro.adminClient.shopListing.shopListingControllerCreate({
      gameServerId,
      items: [{ code: items.data.data[0].code, amount: 1 }],
      price: 150,
      name: 'Test Listing with Long Description',
      description: longDescription,
    });

    // Navigate to shop page
    await page.goto(`/gameserver/${gameServerId}/shop`);

    // Find the listing card
    const listingCard = page.locator(`[data-testid="shoplisting-${listing.data.data.id}-card"]`);
    await expect(listingCard).toBeVisible();

    // Check that truncated description is shown
    const description = listingCard.locator('p').first();
    const initialText = await description.textContent();
    expect(initialText).toContain('...');
    expect(initialText?.length).toBeLessThan(longDescription.length);

    // Click show more
    const showMoreBtn = listingCard.getByRole('button', { name: /show more/i });
    await showMoreBtn.click();

    // Check that full description is shown
    const fullText = await description.textContent();
    expect(fullText).toBe(longDescription);

    // Click show less
    const showLessBtn = listingCard.getByRole('button', { name: /show less/i });
    await showLessBtn.click();

    // Check that description is truncated again
    const truncatedText = await description.textContent();
    expect(truncatedText).toContain('...');
  });

  test('should validate image format on upload', async ({ page, takaro }) => {
    // Use the game server from fixture
    const gameServerId = takaro.gameServer.id;

    // Navigate to create shop listing
    await page.goto(`/gameserver/${gameServerId}/shop/listing/create`);

    // Wait for form to load
    await expect(page.getByText('Create Shop listing')).toBeVisible();

    // Try to upload an unsupported format (simulate GIF)
    const fileInput = page.locator('input[type="file"]');

    // Browser file input validation should prevent selecting wrong format
    // Check that accept attribute is set correctly
    const acceptAttr = await fileInput.getAttribute('accept');
    expect(acceptAttr).toBe('image/png,image/jpeg,image/jpg,image/webp');
  });

  test('should show warning for large image files', async ({ page, takaro }) => {
    // Use the game server from fixture
    const gameServerId = takaro.gameServer.id;

    // Navigate to create shop listing
    await page.goto(`/gameserver/${gameServerId}/shop/listing/create`);

    // Wait for form to load
    await expect(page.getByText('Create Shop listing')).toBeVisible();

    // Create a large buffer (> 5MB)
    const largeBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB
    largeBuffer.fill('A');

    // Upload a large file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'large-image.png',
      mimeType: 'image/png',
      buffer: largeBuffer,
    });

    // Check for warning message
    await expect(page.getByText(/warning.*larger than 5MB/i)).toBeVisible();
  });
});
