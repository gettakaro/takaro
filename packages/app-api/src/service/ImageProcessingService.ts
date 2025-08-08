import sharp from 'sharp';
import { errors, traceableClass } from '@takaro/util';

@traceableClass('service:imageProcessing')
export class ImageProcessingService {
  private readonly MAX_SIZE_BYTES = 250 * 1024; // 250KB
  private readonly OUTPUT_SIZE = 256;
  private readonly OUTPUT_FORMAT = 'webp' as const;

  /**
   * Process uploaded shop icon image
   * - Validates image format
   * - Resizes to 256x256 pixels
   * - Converts to WEBP format
   * - Optimizes file size (max 250KB)
   * - Returns processed image as base64
   */
  async processShopIcon(base64Input: string): Promise<string> {
    try {
      // 1. Extract MIME type and data from base64 string
      const matches = base64Input.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!matches) {
        throw new errors.BadRequestError('Invalid image format. Expected data URI with base64 image.');
      }

      const mimeType = matches[1].toLowerCase();
      const base64Data = matches[2];

      // Validate supported formats
      if (!['png', 'jpg', 'jpeg', 'webp'].includes(mimeType)) {
        throw new errors.BadRequestError(
          `Unsupported image format: ${mimeType}. Supported formats: PNG, JPG, JPEG, WEBP`,
        );
      }

      // 2. Decode base64 to buffer
      let buffer: Buffer;
      try {
        buffer = Buffer.from(base64Data, 'base64');
      } catch {
        throw new errors.BadRequestError('Failed to decode base64 image data');
      }

      // 3. Process with Sharp - first pass with quality 80
      let processed: Buffer;
      try {
        processed = await sharp(buffer)
          .resize(this.OUTPUT_SIZE, this.OUTPUT_SIZE, {
            fit: 'cover',
            position: 'center',
          })
          .webp({
            quality: 80,
            effort: 4,
          })
          .toBuffer();
      } catch (error) {
        // Sharp will throw if image is corrupt or invalid
        throw new errors.BadRequestError(
          `Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }

      // 4. Check size and reduce quality if needed
      if (processed.length > this.MAX_SIZE_BYTES) {
        try {
          // Second pass with reduced quality
          processed = await sharp(buffer)
            .resize(this.OUTPUT_SIZE, this.OUTPUT_SIZE, {
              fit: 'cover',
              position: 'center',
            })
            .webp({
              quality: 60,
              effort: 6, // Higher effort for better compression
            })
            .toBuffer();
        } catch {
          throw new errors.InternalServerError();
        }

        // If still too large after quality reduction, reject
        if (processed.length > this.MAX_SIZE_BYTES) {
          const sizeInKB = Math.round(processed.length / 1024);
          const maxSizeKB = Math.round(this.MAX_SIZE_BYTES / 1024);
          throw new errors.BadRequestError(
            `Image too large after compression. Size: ${sizeInKB}KB, Maximum: ${maxSizeKB}KB. Please use a smaller image.`,
          );
        }
      }

      // 5. Return as base64 data URI
      return `data:image/webp;base64,${processed.toString('base64')}`;
    } catch (error) {
      // Re-throw known errors
      if (error instanceof errors.BadRequestError || error instanceof errors.InternalServerError) {
        throw error;
      }
      // Wrap unexpected errors
      throw new errors.InternalServerError();
    }
  }

  /**
   * Validate that a string is a valid base64-encoded image
   * without processing it
   */
  validateImageFormat(base64Input: string): boolean {
    const matches = base64Input.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) return false;

    const mimeType = matches[1].toLowerCase();
    if (!['png', 'jpg', 'jpeg', 'webp'].includes(mimeType)) return false;

    try {
      const base64Data = matches[2];
      // Check for valid base64 characters
      if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64Data)) {
        return false;
      }
      Buffer.from(base64Data, 'base64');
      return true;
    } catch {
      return false;
    }
  }
}
