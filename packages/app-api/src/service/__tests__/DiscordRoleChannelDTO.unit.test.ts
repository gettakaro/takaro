import { describe, it } from 'node:test';
import { expect } from '@takaro/test';
import { validate } from 'class-validator';
import { DiscordRoleOutputDTO, DiscordChannelOutputDTO } from '../DiscordService.js';

describe('Discord Role and Channel DTOs', () => {
  describe('DiscordRoleOutputDTO', () => {
    it('should validate a valid role with all properties', async () => {
      const role = new DiscordRoleOutputDTO({
        id: '123456789012345678',
        name: 'Admin',
        color: 16711680, // Red color
      });

      const errors = await validate(role);
      expect(errors).to.have.length(0);
    });

    it('should validate a role with zero color', async () => {
      const role = new DiscordRoleOutputDTO({
        id: '123456789012345678',
        name: '@everyone',
        color: 0, // Default role color
      });

      const errors = await validate(role);
      expect(errors).to.have.length(0);
    });

    it('should validate a role with maximum color value', async () => {
      const role = new DiscordRoleOutputDTO({
        id: '123456789012345678',
        name: 'Colorful Role',
        color: 16777215, // Maximum color value (white)
      });

      const errors = await validate(role);
      expect(errors).to.have.length(0);
    });

    it('should reject role with missing id', async () => {
      const role = new DiscordRoleOutputDTO({
        name: 'Admin',
        color: 16711680,
      } as any);

      const errors = await validate(role);
      expect(errors.length).to.be.greaterThan(0);
      expect(errors.some((error) => error.property === 'id')).to.be.true;
    });

    it('should reject role with non-string id', async () => {
      const role = new DiscordRoleOutputDTO({
        id: 123456789012345680, // Number instead of string
        name: 'Admin',
        color: 16711680,
      } as any);

      const errors = await validate(role);
      expect(errors.length).to.be.greaterThan(0);
      expect(errors.some((error) => error.property === 'id' && error.constraints?.isString)).to.be.true;
    });

    it('should reject role with missing name', async () => {
      const role = new DiscordRoleOutputDTO({
        id: '123456789012345678',
        color: 16711680,
      } as any);

      const errors = await validate(role);
      expect(errors.length).to.be.greaterThan(0);
      expect(errors.some((error) => error.property === 'name')).to.be.true;
    });

    it('should reject role with non-string name', async () => {
      const role = new DiscordRoleOutputDTO({
        id: '123456789012345678',
        name: 123, // Number instead of string
        color: 16711680,
      } as any);

      const errors = await validate(role);
      expect(errors.length).to.be.greaterThan(0);
      expect(errors.some((error) => error.property === 'name' && error.constraints?.isString)).to.be.true;
    });

    it('should reject role with missing color', async () => {
      const role = new DiscordRoleOutputDTO({
        id: '123456789012345678',
        name: 'Admin',
      } as any);

      const errors = await validate(role);
      expect(errors.length).to.be.greaterThan(0);
      expect(errors.some((error) => error.property === 'color')).to.be.true;
    });

    it('should reject role with non-number color', async () => {
      const role = new DiscordRoleOutputDTO({
        id: '123456789012345678',
        name: 'Admin',
        color: 'red', // String instead of number
      } as any);

      const errors = await validate(role);
      expect(errors.length).to.be.greaterThan(0);
      expect(errors.some((error) => error.property === 'color' && error.constraints?.isNumber)).to.be.true;
    });

    it('should handle role with empty string name', async () => {
      const role = new DiscordRoleOutputDTO({
        id: '123456789012345678',
        name: '',
        color: 16711680,
      });

      const errors = await validate(role);
      expect(errors).to.have.length(0); // Empty string is valid for role names
    });

    it('should handle role with negative color', async () => {
      const role = new DiscordRoleOutputDTO({
        id: '123456789012345678',
        name: 'Test Role',
        color: -1,
      });

      const errors = await validate(role);
      expect(errors).to.have.length(0); // Negative numbers are technically valid numbers
    });

    it('should handle role with very large color value', async () => {
      const role = new DiscordRoleOutputDTO({
        id: '123456789012345678',
        name: 'Test Role',
        color: 99999999,
      });

      const errors = await validate(role);
      expect(errors).to.have.length(0); // Large numbers are valid, Discord will handle the range
    });
  });

  describe('DiscordChannelOutputDTO', () => {
    it('should validate a valid text channel with all properties', async () => {
      const channel = new DiscordChannelOutputDTO({
        id: '987654321098765432',
        name: 'general',
        type: 0, // Text channel
        parentId: '111222333444555666',
        topic: 'General discussion channel',
      });

      const errors = await validate(channel);
      expect(errors).to.have.length(0);
    });

    it('should validate a channel with minimal properties', async () => {
      const channel = new DiscordChannelOutputDTO({
        id: '987654321098765432',
        name: 'general',
        type: 0,
      });

      const errors = await validate(channel);
      expect(errors).to.have.length(0);
    });

    it('should validate a voice channel', async () => {
      const channel = new DiscordChannelOutputDTO({
        id: '987654321098765432',
        name: 'Voice Chat',
        type: 2, // Voice channel
      });

      const errors = await validate(channel);
      expect(errors).to.have.length(0);
    });

    it('should validate a category channel', async () => {
      const channel = new DiscordChannelOutputDTO({
        id: '987654321098765432',
        name: 'Category Name',
        type: 4, // Category channel
      });

      const errors = await validate(channel);
      expect(errors).to.have.length(0);
    });

    it('should validate a channel with empty topic', async () => {
      const channel = new DiscordChannelOutputDTO({
        id: '987654321098765432',
        name: 'general',
        type: 0,
        topic: '',
      });

      const errors = await validate(channel);
      expect(errors).to.have.length(0);
    });

    it('should reject channel with missing id', async () => {
      const channel = new DiscordChannelOutputDTO({
        name: 'general',
        type: 0,
      } as any);

      const errors = await validate(channel);
      expect(errors.length).to.be.greaterThan(0);
      expect(errors.some((error) => error.property === 'id')).to.be.true;
    });

    it('should reject channel with non-string id', async () => {
      const channel = new DiscordChannelOutputDTO({
        id: 987654321098765440, // Number instead of string
        name: 'general',
        type: 0,
      } as any);

      const errors = await validate(channel);
      expect(errors.length).to.be.greaterThan(0);
      expect(errors.some((error) => error.property === 'id' && error.constraints?.isString)).to.be.true;
    });

    it('should reject channel with missing name', async () => {
      const channel = new DiscordChannelOutputDTO({
        id: '987654321098765432',
        type: 0,
      } as any);

      const errors = await validate(channel);
      expect(errors.length).to.be.greaterThan(0);
      expect(errors.some((error) => error.property === 'name')).to.be.true;
    });

    it('should reject channel with non-string name', async () => {
      const channel = new DiscordChannelOutputDTO({
        id: '987654321098765432',
        name: 123, // Number instead of string
        type: 0,
      } as any);

      const errors = await validate(channel);
      expect(errors.length).to.be.greaterThan(0);
      expect(errors.some((error) => error.property === 'name' && error.constraints?.isString)).to.be.true;
    });

    it('should reject channel with missing type', async () => {
      const channel = new DiscordChannelOutputDTO({
        id: '987654321098765432',
        name: 'general',
      } as any);

      const errors = await validate(channel);
      expect(errors.length).to.be.greaterThan(0);
      expect(errors.some((error) => error.property === 'type')).to.be.true;
    });

    it('should reject channel with non-number type', async () => {
      const channel = new DiscordChannelOutputDTO({
        id: '987654321098765432',
        name: 'general',
        type: 'text', // String instead of number
      } as any);

      const errors = await validate(channel);
      expect(errors.length).to.be.greaterThan(0);
      expect(errors.some((error) => error.property === 'type' && error.constraints?.isNumber)).to.be.true;
    });

    it('should reject channel with non-string parentId', async () => {
      const channel = new DiscordChannelOutputDTO({
        id: '987654321098765432',
        name: 'general',
        type: 0,
        parentId: 111222333444555680, // Number instead of string
      } as any);

      const errors = await validate(channel);
      expect(errors.length).to.be.greaterThan(0);
      expect(errors.some((error) => error.property === 'parentId' && error.constraints?.isString)).to.be.true;
    });

    it('should reject channel with non-string topic', async () => {
      const channel = new DiscordChannelOutputDTO({
        id: '987654321098765432',
        name: 'general',
        type: 0,
        topic: 123, // Number instead of string
      } as any);

      const errors = await validate(channel);
      expect(errors.length).to.be.greaterThan(0);
      expect(errors.some((error) => error.property === 'topic' && error.constraints?.isString)).to.be.true;
    });

    it('should handle channel with empty string name', async () => {
      const channel = new DiscordChannelOutputDTO({
        id: '987654321098765432',
        name: '',
        type: 0,
      });

      const errors = await validate(channel);
      expect(errors).to.have.length(0); // Empty string is valid for channel names
    });

    it('should handle channel with zero type', async () => {
      const channel = new DiscordChannelOutputDTO({
        id: '987654321098765432',
        name: 'general',
        type: 0,
      });

      const errors = await validate(channel);
      expect(errors).to.have.length(0);
    });

    it('should handle channel with negative type', async () => {
      const channel = new DiscordChannelOutputDTO({
        id: '987654321098765432',
        name: 'general',
        type: -1,
      });

      const errors = await validate(channel);
      expect(errors).to.have.length(0); // Negative numbers are technically valid numbers
    });

    it('should handle channel with large type value', async () => {
      const channel = new DiscordChannelOutputDTO({
        id: '987654321098765432',
        name: 'general',
        type: 999,
      });

      const errors = await validate(channel);
      expect(errors).to.have.length(0); // Large numbers are valid, Discord will handle the range
    });

    it('should validate channel with null parentId (explicitly set)', async () => {
      const channel = new DiscordChannelOutputDTO({
        id: '987654321098765432',
        name: 'general',
        type: 0,
        parentId: undefined,
      });

      const errors = await validate(channel);
      expect(errors).to.have.length(0);
    });

    it('should validate channel with null topic (explicitly set)', async () => {
      const channel = new DiscordChannelOutputDTO({
        id: '987654321098765432',
        name: 'general',
        type: 0,
        topic: undefined,
      });

      const errors = await validate(channel);
      expect(errors).to.have.length(0);
    });
  });
});
