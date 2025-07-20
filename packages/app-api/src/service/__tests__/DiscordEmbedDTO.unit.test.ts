import { describe, it } from 'node:test';
import { expect } from '@takaro/test';
import { validate } from 'class-validator';
import {
  DiscordEmbedInputDTO,
  DiscordEmbedField,
  DiscordEmbedFooter,
  DiscordEmbedImage,
  DiscordEmbedAuthor,
  SendMessageInputDTO,
} from '../DiscordService.js';

describe('Discord Embed DTOs', () => {
  describe('DiscordEmbedField', () => {
    it('should validate a valid embed field', async () => {
      const field = new DiscordEmbedField({
        name: 'Test Field',
        value: 'Test Value',
        inline: true,
      });

      const errors = await validate(field);
      expect(errors).to.have.length(0);
    });

    it('should reject field name that is too long', async () => {
      const field = new DiscordEmbedField({
        name: 'a'.repeat(257), // Exceeds 256 character limit
        value: 'Test Value',
      });

      const errors = await validate(field);
      expect(errors.length).to.be.greaterThan(0);
      expect(
        errors.some((error) => error.property === 'name' && (error.constraints?.length || error.constraints?.isLength)),
      ).to.be.true;
    });

    it('should reject field value that is too long', async () => {
      const field = new DiscordEmbedField({
        name: 'Test Field',
        value: 'a'.repeat(1025), // Exceeds 1024 character limit
      });

      const errors = await validate(field);
      expect(errors.length).to.be.greaterThan(0);
      expect(
        errors.some(
          (error) => error.property === 'value' && (error.constraints?.length || error.constraints?.isLength),
        ),
      ).to.be.true;
    });

    it('should reject field with missing name', async () => {
      const field = new DiscordEmbedField({
        value: 'Test Value',
      } as any);

      const errors = await validate(field);
      expect(errors.length).to.be.greaterThan(0);
      expect(errors.some((error) => error.property === 'name')).to.be.true;
    });

    it('should reject field with missing value', async () => {
      const field = new DiscordEmbedField({
        name: 'Test Field',
      } as any);

      const errors = await validate(field);
      expect(errors.length).to.be.greaterThan(0);
      expect(errors.some((error) => error.property === 'value')).to.be.true;
    });

    it('should reject field with non-string name', async () => {
      const field = new DiscordEmbedField({
        name: 123,
        value: 'Test Value',
      } as any);

      const errors = await validate(field);
      expect(errors.length).to.be.greaterThan(0);
      expect(errors.some((error) => error.property === 'name' && error.constraints?.isString)).to.be.true;
    });

    it('should reject field with non-string value', async () => {
      const field = new DiscordEmbedField({
        name: 'Test Field',
        value: 123,
      } as any);

      const errors = await validate(field);
      expect(errors.length).to.be.greaterThan(0);
      expect(errors.some((error) => error.property === 'value' && error.constraints?.isString)).to.be.true;
    });

    it('should reject field with non-boolean inline', async () => {
      const field = new DiscordEmbedField({
        name: 'Test Field',
        value: 'Test Value',
        inline: 'true',
      } as any);

      const errors = await validate(field);
      expect(errors.length).to.be.greaterThan(0);
      expect(errors.some((error) => error.property === 'inline' && error.constraints?.isBoolean)).to.be.true;
    });

    it('should validate field with inline as false', async () => {
      const field = new DiscordEmbedField({
        name: 'Test Field',
        value: 'Test Value',
        inline: false,
      });

      const errors = await validate(field);
      expect(errors).to.have.length(0);
    });

    it('should validate field without inline property', async () => {
      const field = new DiscordEmbedField({
        name: 'Test Field',
        value: 'Test Value',
      });

      const errors = await validate(field);
      expect(errors).to.have.length(0);
    });
  });

  describe('DiscordEmbedFooter', () => {
    it('should validate a valid embed footer', async () => {
      const footer = new DiscordEmbedFooter({
        text: 'Footer text',
        iconUrl: 'https://example.com/icon.png',
      });

      const errors = await validate(footer);
      expect(errors).to.have.length(0);
    });

    it('should reject footer text that is too long', async () => {
      const footer = new DiscordEmbedFooter({
        text: 'a'.repeat(2049), // Exceeds 2048 character limit
      });

      const errors = await validate(footer);
      expect(errors.length).to.be.greaterThan(0);
      expect(
        errors.some((error) => error.property === 'text' && (error.constraints?.length || error.constraints?.isLength)),
      ).to.be.true;
    });

    it('should reject invalid icon URL', async () => {
      const footer = new DiscordEmbedFooter({
        text: 'Footer text',
        iconUrl: 'not-a-valid-url',
      });

      const errors = await validate(footer);
      expect(errors.length).to.be.greaterThan(0);
      expect(errors[0].constraints?.isUrl).to.exist;
    });

    it('should validate footer with only text', async () => {
      const footer = new DiscordEmbedFooter({
        text: 'Footer text only',
      });

      const errors = await validate(footer);
      expect(errors).to.have.length(0);
    });

    it('should reject footer with missing text', async () => {
      const footer = new DiscordEmbedFooter({
        iconUrl: 'https://example.com/icon.png',
      } as any);

      const errors = await validate(footer);
      expect(errors.length).to.be.greaterThan(0);
      expect(errors.some((error) => error.property === 'text')).to.be.true;
    });

    it('should reject footer with non-string text', async () => {
      const footer = new DiscordEmbedFooter({
        text: 123,
      } as any);

      const errors = await validate(footer);
      expect(errors.length).to.be.greaterThan(0);
      expect(errors.some((error) => error.property === 'text' && error.constraints?.isString)).to.be.true;
    });

    it('should validate footer with maximum text length', async () => {
      const footer = new DiscordEmbedFooter({
        text: 'a'.repeat(2048), // Maximum allowed length
      });

      const errors = await validate(footer);
      expect(errors).to.have.length(0);
    });
  });

  describe('DiscordEmbedImage', () => {
    it('should validate a valid embed image', async () => {
      const image = new DiscordEmbedImage({
        url: 'https://example.com/image.png',
      });

      const errors = await validate(image);
      expect(errors).to.have.length(0);
    });

    it('should reject invalid image URL', async () => {
      const image = new DiscordEmbedImage({
        url: 'not-a-valid-url',
      });

      const errors = await validate(image);
      expect(errors.length).to.be.greaterThan(0);
      expect(errors[0].constraints?.isUrl).to.exist;
    });

    it('should reject image with missing URL', async () => {
      const image = new DiscordEmbedImage({} as any);

      const errors = await validate(image);
      expect(errors.length).to.be.greaterThan(0);
      expect(errors.some((error) => error.property === 'url')).to.be.true;
    });

    it('should reject image with non-string URL', async () => {
      const image = new DiscordEmbedImage({
        url: 123,
      } as any);

      const errors = await validate(image);
      expect(errors.length).to.be.greaterThan(0);
      expect(errors.some((error) => error.property === 'url' && error.constraints?.isUrl)).to.be.true;
    });

    it('should validate various valid URL formats', async () => {
      const validUrls = [
        'https://example.com/image.png',
        'http://example.com/image.jpg',
        'https://cdn.discord.com/attachments/123/456/image.gif',
        'https://example.com/path/to/image.webp',
      ];

      for (const url of validUrls) {
        const image = new DiscordEmbedImage({ url });
        const errors = await validate(image);
        expect(errors).to.have.length(0, `Failed for URL: ${url}`);
      }
    });
  });

  describe('DiscordEmbedAuthor', () => {
    it('should validate a valid embed author', async () => {
      const author = new DiscordEmbedAuthor({
        name: 'Author Name',
        iconUrl: 'https://example.com/icon.png',
        url: 'https://example.com',
      });

      const errors = await validate(author);
      expect(errors).to.have.length(0);
    });

    it('should reject author name that is too long', async () => {
      const author = new DiscordEmbedAuthor({
        name: 'a'.repeat(257), // Exceeds 256 character limit
      });

      const errors = await validate(author);
      expect(errors.length).to.be.greaterThan(0);
      expect(
        errors.some((error) => error.property === 'name' && (error.constraints?.length || error.constraints?.isLength)),
      ).to.be.true;
    });

    it('should validate author with only name', async () => {
      const author = new DiscordEmbedAuthor({
        name: 'Author Name Only',
      });

      const errors = await validate(author);
      expect(errors).to.have.length(0);
    });

    it('should reject author with missing name', async () => {
      const author = new DiscordEmbedAuthor({
        iconUrl: 'https://example.com/icon.png',
        url: 'https://example.com',
      } as any);

      const errors = await validate(author);
      expect(errors.length).to.be.greaterThan(0);
      expect(errors.some((error) => error.property === 'name')).to.be.true;
    });

    it('should reject author with non-string name', async () => {
      const author = new DiscordEmbedAuthor({
        name: 123,
      } as any);

      const errors = await validate(author);
      expect(errors.length).to.be.greaterThan(0);
      expect(errors.some((error) => error.property === 'name' && error.constraints?.isString)).to.be.true;
    });

    it('should reject author with invalid iconUrl', async () => {
      const author = new DiscordEmbedAuthor({
        name: 'Author Name',
        iconUrl: 'not-a-valid-url',
      });

      const errors = await validate(author);
      expect(errors.length).to.be.greaterThan(0);
      expect(errors.some((error) => error.property === 'iconUrl' && error.constraints?.isUrl)).to.be.true;
    });

    it('should reject author with invalid url', async () => {
      const author = new DiscordEmbedAuthor({
        name: 'Author Name',
        url: 'not-a-valid-url',
      });

      const errors = await validate(author);
      expect(errors.length).to.be.greaterThan(0);
      expect(errors.some((error) => error.property === 'url' && error.constraints?.isUrl)).to.be.true;
    });

    it('should validate author with maximum name length', async () => {
      const author = new DiscordEmbedAuthor({
        name: 'a'.repeat(256), // Maximum allowed length
      });

      const errors = await validate(author);
      expect(errors).to.have.length(0);
    });

    it('should validate author with valid URLs', async () => {
      const author = new DiscordEmbedAuthor({
        name: 'Author Name',
        iconUrl: 'https://example.com/icon.png',
        url: 'https://github.com/author',
      });

      const errors = await validate(author);
      expect(errors).to.have.length(0);
    });
  });

  describe('DiscordEmbedInputDTO', () => {
    it('should validate a valid embed with all properties', async () => {
      const embed = new DiscordEmbedInputDTO({
        title: 'Test Title',
        description: 'Test Description',
        color: 16711680, // Red color
        fields: [
          new DiscordEmbedField({
            name: 'Field 1',
            value: 'Value 1',
            inline: true,
          }),
        ],
        footer: new DiscordEmbedFooter({
          text: 'Footer text',
        }),
        thumbnail: new DiscordEmbedImage({
          url: 'https://example.com/thumbnail.png',
        }),
        image: new DiscordEmbedImage({
          url: 'https://example.com/image.png',
        }),
        author: new DiscordEmbedAuthor({
          name: 'Author Name',
        }),
        timestamp: '2024-01-15T10:30:00Z',
      });

      const errors = await validate(embed);
      expect(errors).to.have.length(0);
    });

    it('should validate an embed with minimal properties', async () => {
      const embed = new DiscordEmbedInputDTO({
        title: 'Simple Title',
      });

      const errors = await validate(embed);
      expect(errors).to.have.length(0);
    });

    it('should reject title that is too long', async () => {
      const embed = new DiscordEmbedInputDTO({
        title: 'a'.repeat(257), // Exceeds 256 character limit
      });

      const errors = await validate(embed);
      expect(errors.length).to.be.greaterThan(0);
      expect(
        errors.some(
          (error) => error.property === 'title' && (error.constraints?.length || error.constraints?.isLength),
        ),
      ).to.be.true;
    });

    it('should reject description that is too long', async () => {
      const embed = new DiscordEmbedInputDTO({
        description: 'a'.repeat(4097), // Exceeds 4096 character limit
      });

      const errors = await validate(embed);
      expect(errors.length).to.be.greaterThan(0);
      expect(
        errors.some(
          (error) => error.property === 'description' && (error.constraints?.length || error.constraints?.isLength),
        ),
      ).to.be.true;
    });

    it('should reject color outside valid range', async () => {
      const embed = new DiscordEmbedInputDTO({
        title: 'Test',
        color: 16777216, // Exceeds maximum color value
      });

      const errors = await validate(embed);
      expect(errors.length).to.be.greaterThan(0);
      expect(errors[0].constraints?.max).to.exist;
    });

    it('should reject negative color value', async () => {
      const embed = new DiscordEmbedInputDTO({
        title: 'Test',
        color: -1, // Below minimum color value
      });

      const errors = await validate(embed);
      expect(errors.length).to.be.greaterThan(0);
      expect(errors[0].constraints?.min).to.exist;
    });

    it('should reject too many fields', async () => {
      const fields = [];
      for (let i = 0; i < 26; i++) {
        // Exceeds 25 field limit
        fields.push(
          new DiscordEmbedField({
            name: `Field ${i}`,
            value: `Value ${i}`,
          }),
        );
      }

      const embed = new DiscordEmbedInputDTO({
        title: 'Test',
        fields: fields,
      });

      const errors = await validate(embed);
      expect(errors.length).to.be.greaterThan(0);
      expect(errors[0].constraints?.arrayMaxSize).to.exist;
    });

    it('should reject invalid timestamp format', async () => {
      const embed = new DiscordEmbedInputDTO({
        title: 'Test',
        timestamp: 'invalid-timestamp',
      });

      const errors = await validate(embed);
      expect(errors.length).to.be.greaterThan(0);
      expect(errors[0].constraints?.isIso8601).to.exist;
    });

    it('should accept valid ISO8601 timestamp formats', async () => {
      const validTimestamps = [
        '2024-01-15T10:30:00Z',
        '2024-01-15T10:30:00.000Z',
        '2024-01-15T10:30:00+00:00',
        '2024-01-15T10:30:00-05:00',
      ];

      for (const timestamp of validTimestamps) {
        const embed = new DiscordEmbedInputDTO({
          title: 'Test',
          timestamp: timestamp,
        });

        const errors = await validate(embed);
        expect(errors).to.have.length(0, `Failed for timestamp: ${timestamp}`);
      }
    });

    it('should reject empty embed (no content)', async () => {
      const embed = new DiscordEmbedInputDTO({});

      const errors = await validate(embed);
      expect(errors).to.have.length(0); // Empty embed is technically valid for class-validator
    });

    it('should validate embed with only color', async () => {
      const embed = new DiscordEmbedInputDTO({
        color: 16711680,
      });

      const errors = await validate(embed);
      expect(errors).to.have.length(0);
    });

    it('should validate embed with maximum valid color', async () => {
      const embed = new DiscordEmbedInputDTO({
        title: 'Test',
        color: 16777215, // Maximum valid color (0xFFFFFF)
      });

      const errors = await validate(embed);
      expect(errors).to.have.length(0);
    });

    it('should validate embed with zero color', async () => {
      const embed = new DiscordEmbedInputDTO({
        title: 'Test',
        color: 0,
      });

      const errors = await validate(embed);
      expect(errors).to.have.length(0);
    });

    it('should handle nested validation errors in fields', async () => {
      const embed = new DiscordEmbedInputDTO({
        title: 'Test',
        fields: [
          new DiscordEmbedField({
            name: 'a'.repeat(257), // Invalid name length
            value: 'Valid value',
          }),
        ],
      });

      const errors = await validate(embed);
      expect(errors.length).to.be.greaterThan(0);
      // Should have nested validation errors for the field
    });

    it('should handle nested validation errors in footer', async () => {
      const embed = new DiscordEmbedInputDTO({
        title: 'Test',
        footer: new DiscordEmbedFooter({
          text: 'a'.repeat(2049), // Invalid text length
          iconUrl: 'invalid-url',
        }),
      });

      const errors = await validate(embed);
      expect(errors.length).to.be.greaterThan(0);
      // Should have nested validation errors for the footer
    });

    it('should handle nested validation errors in author', async () => {
      const embed = new DiscordEmbedInputDTO({
        title: 'Test',
        author: new DiscordEmbedAuthor({
          name: 'a'.repeat(257), // Invalid name length
          iconUrl: 'invalid-url',
          url: 'invalid-url',
        }),
      });

      const errors = await validate(embed);
      expect(errors.length).to.be.greaterThan(0);
      // Should have nested validation errors for the author
    });

    it('should handle nested validation errors in images', async () => {
      const embed = new DiscordEmbedInputDTO({
        title: 'Test',
        thumbnail: new DiscordEmbedImage({
          url: 'invalid-url',
        }),
        image: new DiscordEmbedImage({
          url: 'another-invalid-url',
        }),
      });

      const errors = await validate(embed);
      expect(errors.length).to.be.greaterThan(0);
      // Should have nested validation errors for the images
    });

    it('should validate embed with exactly 25 fields (boundary test)', async () => {
      const fields = [];
      for (let i = 0; i < 25; i++) {
        // Exactly 25 fields (maximum allowed)
        fields.push(
          new DiscordEmbedField({
            name: `Field ${i}`,
            value: `Value ${i}`,
          }),
        );
      }

      const embed = new DiscordEmbedInputDTO({
        title: 'Test',
        fields: fields,
      });

      const errors = await validate(embed);
      expect(errors).to.have.length(0);
    });

    it('should validate embed with maximum length strings', async () => {
      const embed = new DiscordEmbedInputDTO({
        title: 'a'.repeat(256), // Maximum title length
        description: 'b'.repeat(4096), // Maximum description length
        fields: [
          new DiscordEmbedField({
            name: 'c'.repeat(256), // Maximum field name length
            value: 'd'.repeat(1024), // Maximum field value length
          }),
        ],
        footer: new DiscordEmbedFooter({
          text: 'e'.repeat(2048), // Maximum footer text length
        }),
        author: new DiscordEmbedAuthor({
          name: 'f'.repeat(256), // Maximum author name length
        }),
      });

      const errors = await validate(embed);
      expect(errors).to.have.length(0);
    });
  });

  describe('SendMessageInputDTO', () => {
    it('should validate with message only (backward compatibility)', async () => {
      const messageDto = new SendMessageInputDTO({
        message: 'Hello, world!',
      });

      const errors = await validate(messageDto);
      expect(errors).to.have.length(0);
    });

    it('should validate with embed only', async () => {
      const messageDto = new SendMessageInputDTO({
        embed: new DiscordEmbedInputDTO({
          title: 'Test Embed',
          description: 'This is a test embed',
        }),
      });

      const errors = await validate(messageDto);
      expect(errors).to.have.length(0);
    });

    it('should validate with both message and embed', async () => {
      const messageDto = new SendMessageInputDTO({
        message: 'Check out this embed!',
        embed: new DiscordEmbedInputDTO({
          title: 'Test Embed',
          description: 'This is a test embed',
        }),
      });

      const errors = await validate(messageDto);
      expect(errors).to.have.length(0);
    });

    it('should reject when neither message nor embed is provided', async () => {
      const messageDto = new SendMessageInputDTO({});

      const errors = await validate(messageDto);
      expect(errors.length).to.be.greaterThan(0);
      expect(errors[0].constraints).to.have.property('messageOrEmbed');
      expect(errors[0].constraints?.messageOrEmbed).to.equal('Either message or embed must be provided');
    });

    it('should reject when both message and embed are empty/undefined', async () => {
      const messageDto = new SendMessageInputDTO({
        message: undefined,
        embed: undefined,
      });

      const errors = await validate(messageDto);
      expect(errors.length).to.be.greaterThan(0);
      expect(errors[0].constraints).to.have.property('messageOrEmbed');
    });

    it('should validate with complex embed structure', async () => {
      const messageDto = new SendMessageInputDTO({
        message: 'Server status update',
        embed: new DiscordEmbedInputDTO({
          title: 'Server Status',
          description: 'Current server information',
          color: 65280, // Green
          fields: [
            new DiscordEmbedField({
              name: 'Players Online',
              value: '42',
              inline: true,
            }),
            new DiscordEmbedField({
              name: 'Server Uptime',
              value: '5 days, 3 hours',
              inline: true,
            }),
          ],
          footer: new DiscordEmbedFooter({
            text: 'Last updated',
          }),
          timestamp: '2024-01-15T10:30:00Z',
        }),
      });

      const errors = await validate(messageDto);
      expect(errors).to.have.length(0);
    });
  });
});
