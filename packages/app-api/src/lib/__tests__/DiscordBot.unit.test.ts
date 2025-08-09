import { describe, it, beforeEach, afterEach } from 'node:test';
import { expect } from '@takaro/test';
import sinon from 'sinon';
import { Client, TextChannel, Message, Guild } from 'discord.js';
import { discordBot } from '../DiscordBot.js';
import { errors } from '@takaro/util';
import { DiscordMetrics } from '../DiscordMetrics.js';

describe('DiscordBot', () => {
  let sandbox: sinon.SinonSandbox;
  let clientStub: sinon.SinonStubbedInstance<Client>;
  let textChannelStub: sinon.SinonStubbedInstance<TextChannel>;
  let messageStub: sinon.SinonStubbedInstance<Message>;
  let guildStub: sinon.SinonStubbedInstance<Guild>;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Mock Discord.js Client
    clientStub = sandbox.createStubInstance(Client);
    (discordBot as any).client = clientStub;

    // Mock TextChannel
    textChannelStub = sandbox.createStubInstance(TextChannel);
    textChannelStub.isTextBased.returns(true);
    textChannelStub.id = '123456789';
    textChannelStub.guildId = '987654321';

    // Mock Message
    messageStub = sandbox.createStubInstance(Message);
    messageStub.id = '1234567890123456789';
    messageStub.channelId = '123456789';
    messageStub.content = 'Test message content';

    // Mock Guild
    guildStub = sandbox.createStubInstance(Guild);
    guildStub.id = '987654321';
    // Use defineProperty to override readonly guild property
    Object.defineProperty(messageStub, 'guild', {
      value: guildStub as any,
      writable: true,
      configurable: true,
    });

    // Mock DiscordMetrics
    sandbox.stub(DiscordMetrics, 'measureOperation').callsFake(async (operation) => {
      return operation();
    });
    sandbox.stub(DiscordMetrics, 'recordMessageUpdated');
    sandbox.stub(DiscordMetrics, 'recordMessageDeleted');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('fetchMessage', () => {
    beforeEach(() => {
      // Mock getChannel to return our channel stub
      sandbox.stub(discordBot, 'getChannel').resolves(textChannelStub);
    });

    it('should successfully fetch a message with channelId', async () => {
      // Mock messages.fetch
      textChannelStub.messages = {
        fetch: sandbox.stub().resolves(messageStub),
      } as any;

      const result = await discordBot.fetchMessage('123456789', '1234567890123456789');

      expect(result).to.equal(messageStub);
      expect(textChannelStub.messages.fetch).to.have.been.calledWith('1234567890123456789');
    });

    it('should throw NotFoundError when message is not found', async () => {
      // Mock messages.fetch to throw Unknown Message error
      const discordError = new Error('Unknown Message');
      (discordError as any).code = 10008;
      textChannelStub.messages = {
        fetch: sandbox.stub().rejects(discordError),
      } as any;

      await expect(discordBot.fetchMessage('123456789', '1234567890123456789')).to.be.rejectedWith(
        errors.NotFoundError,
      );
    });

    it('should throw when channel is not found', async () => {
      (discordBot.getChannel as sinon.SinonStub).resolves(null);

      await expect(discordBot.fetchMessage('123456789', '1234567890123456789')).to.be.rejectedWith(
        errors.NotFoundError,
        'Discord channel 123456789 not found',
      );
    });

    it('should throw error when encountering other Discord API errors', async () => {
      const genericError = new Error('Some other error');
      textChannelStub.messages = {
        fetch: sandbox.stub().rejects(genericError),
      } as any;

      await expect(discordBot.fetchMessage('123456789', '1234567890123456789')).to.be.rejectedWith(genericError);
    });
  });

  describe('updateMessage', () => {
    beforeEach(() => {
      // Mock fetchMessage to return our message stub
      sandbox.stub(discordBot, 'fetchMessage').resolves(messageStub);
      sandbox.stub(discordBot as any, 'convertToEmbedBuilder').returns({ title: 'Test Embed' });
    });

    it('should successfully update a message with text content', async () => {
      const updatedMessage = { ...messageStub, content: 'Updated content' } as any;
      messageStub.edit.resolves(updatedMessage);

      const result = await discordBot.updateMessage('123456789', '1234567890123456789', 'Updated content');

      expect(result).to.equal(updatedMessage);
      expect(messageStub.edit).to.have.been.calledWith({
        content: 'Updated content',
      });
      expect(DiscordMetrics.recordMessageUpdated).to.have.been.calledWith('987654321', '123456789');
    });

    it('should successfully update a message with embed', async () => {
      const embedInput = { title: 'Test Embed', description: 'Test Description' };
      const embedBuilder = { title: 'Test Embed' };
      const updatedMessage = { ...messageStub, embeds: [embedBuilder] } as any;

      messageStub.edit.resolves(updatedMessage);

      const result = await discordBot.updateMessage('123456789', '1234567890123456789', undefined, embedInput as any);

      expect(result).to.equal(updatedMessage);
      expect(messageStub.edit).to.have.been.calledWith({
        embeds: [embedBuilder],
      });
      expect(DiscordMetrics.recordMessageUpdated).to.have.been.calledWith('987654321', '123456789');
    });

    it('should successfully update a message with both content and embed', async () => {
      const embedInput = { title: 'Test Embed' };
      const embedBuilder = { title: 'Test Embed' };
      const updatedMessage = { ...messageStub, content: 'Updated content', embeds: [embedBuilder] } as any;

      messageStub.edit.resolves(updatedMessage);

      const result = await discordBot.updateMessage(
        '123456789',
        '1234567890123456789',
        'Updated content',
        embedInput as any,
      );

      expect(result).to.equal(updatedMessage);
      expect(messageStub.edit).to.have.been.calledWith({
        content: 'Updated content',
        embeds: [embedBuilder],
      });
    });

    it('should clear embeds when embed is null', async () => {
      const updatedMessage = { ...messageStub, embeds: [] } as any;
      messageStub.edit.resolves(updatedMessage);

      await discordBot.updateMessage('123456789', '1234567890123456789', 'Content only', null as any);

      expect(messageStub.edit).to.have.been.calledWith({
        content: 'Content only',
        embeds: [],
      });
    });

    it('should throw BadRequestError when neither content nor embed is provided', async () => {
      await expect(discordBot.updateMessage('123456789', '1234567890123456789')).to.be.rejectedWith(
        errors.BadRequestError,
        'Either message content or embed must be provided',
      );
    });

    it('should handle messages without guild gracefully', async () => {
      Object.defineProperty(messageStub, 'guild', {
        value: null,
        writable: true,
        configurable: true,
      });
      const updatedMessage = { ...messageStub, content: 'Updated' } as any;
      messageStub.edit.resolves(updatedMessage);

      const result = await discordBot.updateMessage('123456789', '1234567890123456789', 'Updated');

      expect(result).to.equal(updatedMessage);
      expect(DiscordMetrics.recordMessageUpdated).to.have.been.calledWith('unknown', '123456789');
    });
  });

  describe('deleteMessage', () => {
    beforeEach(() => {
      sandbox.stub(discordBot, 'fetchMessage').resolves(messageStub);
    });

    it('should successfully delete a message', async () => {
      messageStub.delete.resolves();

      await discordBot.deleteMessage('123456789', '1234567890123456789');

      expect(messageStub.delete).to.have.been.called;
      expect(DiscordMetrics.recordMessageDeleted).to.have.been.calledWith('987654321', '123456789');
    });

    it('should handle already deleted messages gracefully', async () => {
      const discordError = new Error('Unknown Message');
      (discordError as any).code = 10008;
      messageStub.delete.rejects(discordError);

      await expect(discordBot.deleteMessage('123456789', '1234567890123456789')).to.not.be.rejected;
      expect(DiscordMetrics.recordMessageDeleted).to.have.been.calledWith('987654321', '123456789');
    });

    it('should rethrow other Discord errors', async () => {
      const otherError = new Error('Missing Permissions');
      (otherError as any).code = 50001;
      messageStub.delete.rejects(otherError);

      await expect(discordBot.deleteMessage('123456789', '1234567890123456789')).to.be.rejectedWith(otherError);
    });

    it('should handle messages without guild gracefully', async () => {
      Object.defineProperty(messageStub, 'guild', {
        value: null,
        writable: true,
        configurable: true,
      });
      messageStub.delete.resolves();

      await discordBot.deleteMessage('123456789', '1234567890123456789');

      expect(messageStub.delete).to.have.been.called;
      expect(DiscordMetrics.recordMessageDeleted).to.have.been.calledWith('unknown', '123456789');
    });
  });
});
