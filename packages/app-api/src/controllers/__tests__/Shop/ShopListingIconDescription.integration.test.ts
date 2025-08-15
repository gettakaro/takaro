import { IntegrationTest, expect, IShopSetup, shopSetup } from '@takaro/test';
import { describe } from 'node:test';

const group = 'Shop/ShopListingIconDescription';

// Create a small valid PNG image as base64
const createValidPngBase64 = () => {
  // 1x1 red pixel PNG
  const pngBuffer = Buffer.from([
    0x89,
    0x50,
    0x4e,
    0x47,
    0x0d,
    0x0a,
    0x1a,
    0x0a, // PNG signature
    0x00,
    0x00,
    0x00,
    0x0d,
    0x49,
    0x48,
    0x44,
    0x52, // IHDR chunk
    0x00,
    0x00,
    0x00,
    0x01,
    0x00,
    0x00,
    0x00,
    0x01,
    0x08,
    0x02,
    0x00,
    0x00,
    0x00,
    0x90,
    0x77,
    0x53,
    0xde,
    0x00,
    0x00,
    0x00,
    0x0c,
    0x49,
    0x44,
    0x41, // IDAT chunk
    0x54,
    0x08,
    0x99,
    0x63,
    0xf8,
    0xcf,
    0xc0,
    0x00,
    0x00,
    0x03,
    0x01,
    0x01,
    0x00,
    0x18,
    0xdd,
    0x8d,
    0xb4,
    0x79,
    0x00,
    0x00,
    0x00,
    0x00,
    0x49,
    0x45, // IEND chunk
    0x4e,
    0x44,
    0xae,
    0x42,
    0x60,
    0x82,
  ]);
  return `data:image/png;base64,${pngBuffer.toString('base64')}`;
};

// Create a large image that exceeds 250KB after processing
const _createLargeImageBase64 = () => {
  // Create a 2000x2000 PNG with random pixels - this will be too large even after compression
  const width = 2000;
  const height = 2000;
  const canvas = Buffer.alloc(width * height * 4); // RGBA

  // Fill with random colors to prevent compression
  for (let i = 0; i < canvas.length; i++) {
    canvas[i] = Math.floor(Math.random() * 256);
  }

  // This is a simplified approach - in real tests we'd use a proper image library
  // For now, we'll just create a very long base64 string that simulates a large image
  const largeBuffer = Buffer.alloc(1024 * 1024); // 1MB buffer
  largeBuffer.fill('A');
  return `data:image/png;base64,${largeBuffer.toString('base64')}`;
};

const tests = [
  new IntegrationTest<IShopSetup>({
    group,
    snapshot: true,
    name: 'Create listing with valid icon and description',
    setup: shopSetup,
    filteredFields: ['itemId', 'gameServerId', 'gameserverId', 'listingId', 'icon'],
    test: async function () {
      const items = (await this.client.item.itemControllerSearch({ filters: { name: ['Stone'] } })).data.data;
      const validIcon = createValidPngBase64();

      const res = await this.client.shopListing.shopListingControllerCreate({
        gameServerId: this.setupData.gameserver.id,
        items: [{ code: items[0].code, amount: 1 }],
        price: 150,
        name: 'Test item with icon',
        icon: validIcon,
        description: 'This is a test description for the shop listing',
      });

      expect(res.data.data.description).to.equal('This is a test description for the shop listing');
      expect(res.data.data.icon).to.be.a('string');
      expect(res.data.data.icon).to.include('data:image/webp;base64,');

      return res;
    },
  }),

  new IntegrationTest<IShopSetup>({
    group,
    snapshot: true,
    name: 'Update existing listing with new icon',
    setup: shopSetup,
    filteredFields: ['itemId', 'gameServerId', 'gameserverId', 'listingId', 'icon'],
    test: async function () {
      const validIcon = createValidPngBase64();

      const res = await this.client.shopListing.shopListingControllerUpdate(this.setupData.listing100.id, {
        price: 200,
        icon: validIcon,
        description: 'Updated description',
      });

      expect(res.data.data.icon).to.be.a('string');
      expect(res.data.data.icon).to.include('data:image/webp;base64,');
      expect(res.data.data.description).to.equal('Updated description');

      return res;
    },
  }),

  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    name: 'Update listing and preserve icon',
    setup: shopSetup,
    test: async function () {
      const validIcon = createValidPngBase64();

      // First create with icon
      const createRes = await this.client.shopListing.shopListingControllerCreate({
        gameServerId: this.setupData.gameserver.id,
        items: [{ code: this.setupData.items[0].code, amount: 1 }],
        price: 150,
        name: 'Test item with icon',
        icon: validIcon,
      });

      expect(createRes.data.data.icon).to.be.a('string');
      const originalIcon = createRes.data.data.icon;

      // Then update without changing icon
      const updateRes = await this.client.shopListing.shopListingControllerUpdate(createRes.data.data.id, {
        price: 200,
        description: 'Updated description only',
      });

      expect(updateRes.data.data.icon).to.equal(originalIcon);
      expect(updateRes.data.data.description).to.equal('Updated description only');

      return updateRes;
    },
  }),

  new IntegrationTest<IShopSetup>({
    group,
    snapshot: true,
    name: 'Test description length validation',
    setup: shopSetup,
    expectedStatus: 400,
    filteredFields: ['gameServerId'],
    test: async function () {
      const items = (await this.client.item.itemControllerSearch({ filters: { name: ['Stone'] } })).data.data;
      const longDescription = 'A'.repeat(501); // 501 characters, exceeds 500 limit

      return this.client.shopListing.shopListingControllerCreate({
        gameServerId: this.setupData.gameserver.id,
        items: [{ code: items[0].code, amount: 1 }],
        price: 150,
        name: 'Test item',
        description: longDescription,
      });
    },
  }),

  new IntegrationTest<IShopSetup>({
    group,
    snapshot: true,
    name: 'Test invalid image format rejection',
    setup: shopSetup,
    expectedStatus: 400,
    test: async function () {
      const items = (await this.client.item.itemControllerSearch({ filters: { name: ['Stone'] } })).data.data;
      const invalidIcon = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // GIF format

      return this.client.shopListing.shopListingControllerCreate({
        gameServerId: this.setupData.gameserver.id,
        items: [{ code: items[0].code, amount: 1 }],
        price: 150,
        name: 'Test item',
        icon: invalidIcon,
      });
    },
  }),

  new IntegrationTest<IShopSetup>({
    group,
    snapshot: true,
    name: 'Test malformed base64 rejection',
    setup: shopSetup,
    expectedStatus: 400,
    test: async function () {
      const items = (await this.client.item.itemControllerSearch({ filters: { name: ['Stone'] } })).data.data;
      const malformedIcon = 'data:image/png;base64,not-valid-base64!!!';

      return this.client.shopListing.shopListingControllerCreate({
        gameServerId: this.setupData.gameserver.id,
        items: [{ code: items[0].code, amount: 1 }],
        price: 150,
        name: 'Test item',
        icon: malformedIcon,
      });
    },
  }),

  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    name: 'Verify description with special characters',
    setup: shopSetup,
    test: async function () {
      const items = (await this.client.item.itemControllerSearch({ filters: { name: ['Stone'] } })).data.data;
      const specialDescription = 'Special chars: <script>alert("xss")</script> & "quotes" \'apostrophes\' émojis 🎮';

      const res = await this.client.shopListing.shopListingControllerCreate({
        gameServerId: this.setupData.gameserver.id,
        items: [{ code: items[0].code, amount: 1 }],
        price: 150,
        name: 'Test item',
        description: specialDescription,
      });

      expect(res.data.data.description).to.equal(specialDescription);

      return res;
    },
  }),

  new IntegrationTest<IShopSetup>({
    group,
    snapshot: false,
    name: 'Create listing without icon or description (backward compatibility)',
    setup: shopSetup,
    test: async function () {
      const items = (await this.client.item.itemControllerSearch({ filters: { name: ['Stone'] } })).data.data;

      const res = await this.client.shopListing.shopListingControllerCreate({
        gameServerId: this.setupData.gameserver.id,
        items: [{ code: items[0].code, amount: 1 }],
        price: 150,
        name: 'Test item without new fields',
      });

      expect(res.data.data.icon).to.be.null;
      expect(res.data.data.description).to.be.null;

      return res;
    },
  }),
];

describe(group, function () {
  tests.forEach((test) => test.run());
});
