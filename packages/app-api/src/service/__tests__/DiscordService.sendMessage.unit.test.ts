import { describe, it, beforeEach, mock } from 'node:test';
import { expect } from '@takaro/test';
import {
  DiscordService,
  SendMessageInputDTO,
  DiscordEmbedInputDTO,
  DiscordEmbedField,
  DiscordEmbedFooter,
  DiscordEmbedImage,
  DiscordEmbedAuthor,
} from '../DiscordService.js';
import { errors } from '@takaro/util';
import { discordBot } from '../../lib/DiscordBot.js';

// Mock the DiscordBot methods directly
const mockGetChannel = mock.fn(async (channelId: string) => ({
  id: channelId,
  guildId: 'test-guild-id',
  isTextBased: () => true,
}));

const mockSendMessage = mock.fn(async (channelId: string, content?: string, embed?: any) => ({
  id: 'test-message-id',
  content,
  embeds: embed ? [embed] : [],
}));

describe('DiscordService sendMessage', () => {
  let service: DiscordService;

  beforeEach(() => {
    // Reset mock functions
    mockGetChannel.mock.resetCalls();
    mockSendMessage.mock.resetCalls();

    // Override discordBot methods with mocks
    (discordBot as any).getChannel = mockGetChannel;
    (discordBot as any).sendMessage = mockSendMessage;

    service = new DiscordService('test-domain');

    // Mock the find method to return a valid guild
    service.find = mock.fn(async () => ({
      results: [
        {
          id: 'test-guild-uuid',
          discordId: 'test-guild-id',
          takaroEnabled: true,
          name: 'Test Guild',
        } as any,
      ],
      total: 1,
    }));

    // Mock the repo.getServersWithManagePermission method
    service.repo.getServersWithManagePermission = mock.fn(async () => [
      {
        id: 'test-guild-uuid',
      } as any,
    ]);
  });

  describe('input validation', () => {
    it('should reject when neither message nor embed is provided', async () => {
      const messageDto = new SendMessageInputDTO({});

      try {
        await service.sendMessage('test-channel', messageDto);
        expect.fail('Expected method to throw');
      } catch (error) {
        expect(error).to.be.instanceOf(errors.BadRequestError);
      }
    });

    it('should accept message only', async () => {
      const messageDto = new SendMessageInputDTO({
        message: 'Hello, world!',
      });

      const result = await service.sendMessage('test-channel', messageDto);
      expect(result).to.exist;
      expect(result.id).to.equal('test-message-id');
    });

    it('should accept embed only', async () => {
      const messageDto = new SendMessageInputDTO({
        embed: new DiscordEmbedInputDTO({
          title: 'Test Embed',
        }),
      });

      const result = await service.sendMessage('test-channel', messageDto);
      expect(result).to.exist;
      expect(result.id).to.equal('test-message-id');
    });

    it('should accept both message and embed', async () => {
      const messageDto = new SendMessageInputDTO({
        message: 'Check this out!',
        embed: new DiscordEmbedInputDTO({
          title: 'Test Embed',
          description: 'This is a test',
        }),
      });

      const result = await service.sendMessage('test-channel', messageDto);
      expect(result).to.exist;
      expect(result.id).to.equal('test-message-id');
    });
  });

  describe('embed validation', () => {
    it('should reject empty embed', async () => {
      const messageDto = new SendMessageInputDTO({
        embed: new DiscordEmbedInputDTO({}),
      });

      try {
        await service.sendMessage('test-channel', messageDto);
        expect.fail('Expected method to throw');
      } catch (error) {
        expect((error as Error).message).to.include('Embed must contain at least one of');
      }
    });

    it('should reject embed exceeding character limit', async () => {
      const messageDto = new SendMessageInputDTO({
        embed: new DiscordEmbedInputDTO({
          title: 'a'.repeat(2000),
          description: 'a'.repeat(4000),
          fields: [
            new DiscordEmbedField({
              name: 'a'.repeat(256),
              value: 'a'.repeat(1024),
            }),
          ],
        }),
      });

      try {
        await service.sendMessage('test-channel', messageDto);
        expect.fail('Expected method to throw');
      } catch (error) {
        expect((error as Error).message).to.include("Embed content exceeds Discord's 6000 character limit");
      }
    });

    it('should reject invalid timestamp', async () => {
      const messageDto = new SendMessageInputDTO({
        embed: new DiscordEmbedInputDTO({
          title: 'Test',
          timestamp: 'invalid-timestamp',
        }),
      });

      try {
        await service.sendMessage('test-channel', messageDto);
        expect.fail('Expected method to throw');
      } catch (error) {
        expect((error as Error).message).to.include('Invalid timestamp format');
      }
    });

    it('should reject malicious URLs', async () => {
      const messageDto = new SendMessageInputDTO({
        embed: new DiscordEmbedInputDTO({
          title: 'Test',
          image: new DiscordEmbedImage({
            url: 'javascript:alert("xss")',
          }),
        }),
      });

      try {
        await service.sendMessage('test-channel', messageDto);
        expect.fail('Expected method to throw');
      } catch (error) {
        expect((error as Error).message).to.include('image URL must use http or https protocol');
      }
    });

    it('should accept valid embed with all properties', async () => {
      const messageDto = new SendMessageInputDTO({
        embed: new DiscordEmbedInputDTO({
          title: 'Server Status',
          description: 'All systems operational',
          color: 65280,
          fields: [
            new DiscordEmbedField({
              name: 'Players Online',
              value: '42',
              inline: true,
            }),
          ],
          footer: new DiscordEmbedFooter({
            text: 'Last updated',
            iconUrl: 'https://example.com/icon.png',
          }),
          thumbnail: new DiscordEmbedImage({
            url: 'https://example.com/thumb.png',
          }),
          image: new DiscordEmbedImage({
            url: 'https://example.com/image.png',
          }),
          author: new DiscordEmbedAuthor({
            name: 'Server Bot',
            iconUrl: 'https://example.com/bot.png',
            url: 'https://example.com',
          }),
          timestamp: '2024-01-15T10:30:00Z',
        }),
      });

      const result = await service.sendMessage('test-channel', messageDto);
      expect(result).to.exist;
      expect(result.id).to.equal('test-message-id');
    });
  });

  describe('guild validation', () => {
    it('should reject when guild is not found', async () => {
      service.find = mock.fn(async () => ({ results: [], total: 0 }));

      const messageDto = new SendMessageInputDTO({
        message: 'Hello, world!',
      });

      try {
        await service.sendMessage('test-channel', messageDto);
        expect.fail('Expected method to throw');
      } catch (error) {
        expect((error as Error).message).to.include('Guild not found for channel');
      }
    });

    it('should reject when Takaro is not enabled for guild', async () => {
      service.find = mock.fn(async () => ({
        results: [
          {
            id: 'test-guild-uuid',
            discordId: 'test-guild-id',
            takaroEnabled: false,
            name: 'Test Guild',
          } as any,
        ],
        total: 1,
      }));

      const messageDto = new SendMessageInputDTO({
        message: 'Hello, world!',
      });

      try {
        await service.sendMessage('test-channel', messageDto);
        expect.fail('Expected method to throw');
      } catch (error) {
        expect((error as Error).message).to.include('Takaro not enabled for guild');
      }
    });
  });
});
