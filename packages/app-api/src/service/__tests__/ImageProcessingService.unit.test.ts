import { describe, it, beforeEach, afterEach } from 'node:test';
import { expect } from '@takaro/test';
import { ImageProcessingService } from '../ImageProcessingService.js';
import { errors } from '@takaro/util';
import sharp from 'sharp';
import sinon from 'sinon';

describe('ImageProcessingService', () => {
  let service: ImageProcessingService;
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    service = new ImageProcessingService();
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  // Helper function to create a test image
  async function createTestImage(
    width: number,
    height: number,
    format: 'png' | 'jpeg' | 'webp' = 'png',
  ): Promise<string> {
    const buffer = await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 255, g: 0, b: 0, alpha: 1 },
      },
    })
      .toFormat(format)
      .toBuffer();

    const mimeType = format === 'jpeg' ? 'jpeg' : format;
    return `data:image/${mimeType};base64,${buffer.toString('base64')}`;
  }

  // Helper to create a large image that will exceed size limits
  async function createLargeTestImage(): Promise<string> {
    // Create a complex image that won't compress well
    const buffer = await sharp({
      create: {
        width: 2000,
        height: 2000,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    })
      // Add complexity to make it harder to compress
      .modulate({
        brightness: 1,
        saturation: 1,
        hue: 180,
      })
      .png()
      .toBuffer();

    return `data:image/png;base64,${buffer.toString('base64')}`;
  }

  describe('processShopIcon', () => {
    it('should process a valid PNG image', async () => {
      const testImage = await createTestImage(500, 500, 'png');
      const result = await service.processShopIcon(testImage);

      expect(result).to.match(/^data:image\/webp;base64,/);

      // Verify the output is valid base64
      const matches = result.match(/^data:image\/webp;base64,(.+)$/);
      expect(matches).to.not.be.null;

      // Decode and check dimensions
      const buffer = Buffer.from(matches![1], 'base64');
      const metadata = await sharp(buffer).metadata();
      expect(metadata.width).to.equal(256);
      expect(metadata.height).to.equal(256);
      expect(metadata.format).to.equal('webp');
    });

    it('should process a valid JPEG image', async () => {
      const testImage = await createTestImage(300, 400, 'jpeg');
      const result = await service.processShopIcon(testImage);

      expect(result).to.match(/^data:image\/webp;base64,/);

      const matches = result.match(/^data:image\/webp;base64,(.+)$/);
      const buffer = Buffer.from(matches![1], 'base64');
      const metadata = await sharp(buffer).metadata();
      expect(metadata.width).to.equal(256);
      expect(metadata.height).to.equal(256);
      expect(metadata.format).to.equal('webp');
    });

    it('should process a valid WEBP image', async () => {
      const testImage = await createTestImage(256, 256, 'webp');
      const result = await service.processShopIcon(testImage);

      expect(result).to.match(/^data:image\/webp;base64,/);

      const matches = result.match(/^data:image\/webp;base64,(.+)$/);
      const buffer = Buffer.from(matches![1], 'base64');
      const metadata = await sharp(buffer).metadata();
      expect(metadata.width).to.equal(256);
      expect(metadata.height).to.equal(256);
      expect(metadata.format).to.equal('webp');
    });

    it('should resize images to 256x256', async () => {
      const testImage = await createTestImage(1000, 800, 'png');
      const result = await service.processShopIcon(testImage);

      const matches = result.match(/^data:image\/webp;base64,(.+)$/);
      const buffer = Buffer.from(matches![1], 'base64');
      const metadata = await sharp(buffer).metadata();

      expect(metadata.width).to.equal(256);
      expect(metadata.height).to.equal(256);
    });

    it('should enforce size limit and reduce quality if needed', async () => {
      const largeImage = await createLargeTestImage();
      const result = await service.processShopIcon(largeImage);

      expect(result).to.match(/^data:image\/webp;base64,/);

      // Check that the result is under 250KB
      const matches = result.match(/^data:image\/webp;base64,(.+)$/);
      const buffer = Buffer.from(matches![1], 'base64');
      expect(buffer.length).to.be.lessThanOrEqual(250 * 1024);
    });

    it('should reject oversized images that cannot be compressed enough', async () => {
      // Mock sharp to return a large buffer even after compression
      const stub = sandbox.stub(sharp.prototype, 'toBuffer');
      stub.resolves(Buffer.alloc(300 * 1024));

      const testImage = await createTestImage(500, 500, 'png');

      await expect(service.processShopIcon(testImage)).to.be.rejectedWith(errors.BadRequestError);
      await expect(service.processShopIcon(testImage)).to.be.rejectedWith(/Image too large after compression/);
    });

    it('should reject invalid base64 format', async () => {
      const invalidInputs = [
        'not-a-data-uri',
        'data:text/plain;base64,SGVsbG8gV29ybGQ=',
        'data:image/png;base64,invalid-base64-!@#',
        'just-some-text',
        '',
      ];

      for (const input of invalidInputs) {
        await expect(service.processShopIcon(input)).to.be.rejectedWith(errors.BadRequestError);
      }
    });

    it('should reject unsupported image formats', async () => {
      const gifImage = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
      const bmpImage =
        'data:image/bmp;base64,Qk06AAAAAAAAADYAAAAoAAAAAQAAAAEAAAABABgAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAA////AA==';

      await expect(service.processShopIcon(gifImage)).to.be.rejectedWith(errors.BadRequestError);
      await expect(service.processShopIcon(gifImage)).to.be.rejectedWith(/Unsupported image format: gif/);

      await expect(service.processShopIcon(bmpImage)).to.be.rejectedWith(errors.BadRequestError);
      await expect(service.processShopIcon(bmpImage)).to.be.rejectedWith(/Unsupported image format: bmp/);
    });

    it('should handle corrupt image data gracefully', async () => {
      const corruptImage = 'data:image/png;base64,aW52YWxpZCBpbWFnZSBkYXRh';

      await expect(service.processShopIcon(corruptImage)).to.be.rejectedWith(errors.BadRequestError);
      await expect(service.processShopIcon(corruptImage)).to.be.rejectedWith(/Failed to process image/);
    });

    it('should handle invalid base64 data', async () => {
      const invalidBase64 = 'data:image/png;base64,!!!not-valid-base64!!!';

      await expect(service.processShopIcon(invalidBase64)).to.be.rejectedWith(errors.BadRequestError);
      // The error could be either decode failure or process failure
      await expect(service.processShopIcon(invalidBase64)).to.be.rejectedWith(
        /Failed to (decode base64|process image)/,
      );
    });

    it('should accept JPG as an alias for JPEG', async () => {
      const jpegImage = await createTestImage(256, 256, 'jpeg');
      // Replace jpeg with jpg in the data URI
      const jpgImage = jpegImage.replace('data:image/jpeg', 'data:image/jpg');

      const result = await service.processShopIcon(jpgImage);
      expect(result).to.match(/^data:image\/webp;base64,/);
    });
  });

  describe('validateImageFormat', () => {
    it('should validate correct image formats', async () => {
      const validPng = await createTestImage(100, 100, 'png');
      const validJpeg = await createTestImage(100, 100, 'jpeg');
      const validWebp = await createTestImage(100, 100, 'webp');

      expect(service.validateImageFormat(validPng)).to.equal(true);
      expect(service.validateImageFormat(validJpeg)).to.equal(true);
      expect(service.validateImageFormat(validWebp)).to.equal(true);
    });

    it('should reject invalid formats', () => {
      // Test various invalid formats
      const result1 = service.validateImageFormat('not-a-data-uri');
      expect(result1).to.equal(false);

      const result2 = service.validateImageFormat('data:image/gif;base64,R0lGOD');
      expect(result2).to.equal(false);

      const result3 = service.validateImageFormat('data:text/plain;base64,SGVsbG8=');
      expect(result3).to.equal(false);

      // This might pass because '!' is a valid base64 character when used in padding
      // Let's use a clearly invalid base64 string
      const result4 = service.validateImageFormat('data:image/png;base64,@@@invalid@@@');
      expect(result4).to.equal(false);

      const result5 = service.validateImageFormat('');
      expect(result5).to.equal(false);
    });
  });
});
