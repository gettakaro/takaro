import {
  Client,
  GatewayIntentBits,
  GuildBasedChannel,
  Message,
  TextChannel,
  Role,
  NonThreadGuildBasedChannel,
  EmbedBuilder,
  GuildMember,
} from 'discord.js';
import { errors, logger } from '@takaro/util';
import { config } from '../config.js';
import { DiscordService, DiscordEmbedInputDTO } from '../service/DiscordService.js';
import { DiscordMetrics } from './DiscordMetrics.js';

class DiscordBot {
  private client: Client;
  private log = logger('DiscordBot');

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
      ],
    });
  }

  get inviteLink() {
    return `https://discord.com/oauth2/authorize?client_id=${this.client.user?.id}&scope=bot`;
  }

  get botUserId() {
    return this.client.user?.id;
  }

  async start() {
    if (!config.get('discord.botToken')) {
      this.log.warn('No discord bot token provided, skipping discord bot startup');
      return;
    }

    this.client.on('ready', (client) => {
      this.log.info(`Logged in as ${client.user.tag}!`);
      this.log.info(`Invite link: ${this.inviteLink}`);
      return;
    });

    if (config.get('discord.handleEvents')) {
      this.log.info('Setting up event handling');
      this.client.on('messageCreate', (message) => this.messageHandler(message));
      this.client.on('guildMemberUpdate', (oldMember, newMember) => {
        if (oldMember.partial || newMember.partial) {
          this.log.warn('Received partial guild member update, ignoring');
          return;
        }
        this.handleGuildMemberUpdate(oldMember, newMember);
      });
    } else {
      this.log.info('Event handling is disabled');
    }

    try {
      await this.client.login(config.get('discord.botToken'));
    } catch (e) {
      this.log.error('Failed to login to Discord', { error: e });
      throw new errors.InternalServerError();
    }
  }

  async getChannel(channelId: string): Promise<GuildBasedChannel> {
    return await DiscordMetrics.measureOperation(
      () => this.client.channels.fetch(channelId) as Promise<GuildBasedChannel>,
      'getChannel',
      undefined,
    );
  }

  async sendMessage(channelId: string, content?: string, embed?: DiscordEmbedInputDTO): Promise<Message> {
    const channel = await this.getChannel(channelId);

    if (!channel) {
      throw new errors.BadRequestError('Channel not found');
    }

    if (!channel.isTextBased) {
      throw new errors.BadRequestError('Channel is not text based');
    }

    const textChannel = channel as TextChannel;

    // Validate that either content or embed is provided
    if (!content && !embed) {
      throw new errors.BadRequestError('Either message content or embed must be provided');
    }

    const guildId = channel.guildId;

    return await DiscordMetrics.measureOperation(
      async () => {
        // If only content is provided (backward compatibility)
        if (content && !embed) {
          const message = await textChannel.send(content);
          DiscordMetrics.recordMessageSent(guildId, channelId, false);
          return message;
        }

        // If embed is provided, convert to EmbedBuilder
        let embedBuilder: EmbedBuilder | undefined;
        if (embed) {
          embedBuilder = this.convertToEmbedBuilder(embed);
        }

        // Send message with optional content and embed
        const messageOptions: any = {};
        if (content) {
          messageOptions.content = content;
        }
        if (embedBuilder) {
          messageOptions.embeds = [embedBuilder];
        }

        const message = await textChannel.send(messageOptions);
        DiscordMetrics.recordMessageSent(guildId, channelId, !!embed);
        return message;
      },
      'sendMessage',
      guildId,
    );
  }

  async fetchMessage(channelId: string, messageId: string): Promise<Message> {
    // Get the channel first to have guildId for metrics
    const channel = await this.getChannel(channelId);

    return await DiscordMetrics.measureOperation(
      async () => {
        this.log.debug(`Fetching message ${messageId} from channel ${channelId}`);

        if (!channel) {
          throw new errors.NotFoundError(`Discord channel ${channelId} not found`);
        }

        if (!channel.isTextBased()) {
          throw new errors.BadRequestError('Channel is not text based');
        }

        const textChannel = channel as TextChannel;

        try {
          const message = await textChannel.messages.fetch(messageId);
          this.log.debug(`Found message ${messageId} in channel ${channelId}`);
          return message;
        } catch (error: any) {
          if (error.code === 10008) {
            // Unknown Message
            throw new errors.NotFoundError(`Discord message ${messageId} not found in channel ${channelId}`);
          }
          throw error;
        }
      },
      'fetchMessage',
      channel?.guildId,
    );
  }

  async updateMessage(
    channelId: string,
    messageId: string,
    content?: string,
    embed?: DiscordEmbedInputDTO,
  ): Promise<Message> {
    const message = await this.fetchMessage(channelId, messageId);
    const guildId = message.guild?.id;

    return await DiscordMetrics.measureOperation(
      async () => {
        this.log.info(`Updating message ${messageId}`);

        // Validate that either content or embed is provided
        if (!content && !embed) {
          throw new errors.BadRequestError('Either message content or embed must be provided');
        }

        // Build update options
        const updateOptions: any = {};

        // Set content if provided, or null to clear it
        if (content !== undefined) {
          updateOptions.content = content;
        }

        // Convert embed to EmbedBuilder if provided
        if (embed) {
          const embedBuilder = this.convertToEmbedBuilder(embed);
          updateOptions.embeds = [embedBuilder];
        } else if (embed === null) {
          updateOptions.embeds = [];
        }

        // Update the message
        const updatedMessage = await message.edit(updateOptions);

        this.log.info(`Successfully updated message ${messageId}`);
        DiscordMetrics.recordMessageUpdated(guildId || 'unknown', message.channelId);

        return updatedMessage;
      },
      'updateMessage',
      guildId,
    );
  }

  async deleteMessage(channelId: string, messageId: string): Promise<void> {
    const message = await this.fetchMessage(channelId, messageId);
    const guildId = message.guild?.id;

    return await DiscordMetrics.measureOperation(
      async () => {
        this.log.info(`Deleting message ${messageId}`);

        try {
          await message.delete();
          this.log.info(`Successfully deleted message ${messageId}`);
          DiscordMetrics.recordMessageDeleted(guildId || 'unknown', channelId);
        } catch (error: any) {
          // Handle case where message is already deleted
          if (error.code === 10008) {
            // Unknown Message
            this.log.warn(`Message ${messageId} was already deleted`);
            // Still record the metric as the operation was attempted
            DiscordMetrics.recordMessageDeleted(guildId || 'unknown', channelId);
          } else {
            throw error;
          }
        }
      },
      'deleteMessage',
      guildId,
    );
  }

  private convertToEmbedBuilder(embedInput: DiscordEmbedInputDTO): EmbedBuilder {
    const embed = new EmbedBuilder();

    try {
      // Set basic properties
      if (embedInput.title) {
        embed.setTitle(embedInput.title);
      }

      if (embedInput.description) {
        embed.setDescription(embedInput.description);
      }

      if (embedInput.color !== undefined) {
        embed.setColor(embedInput.color);
      }

      if (embedInput.timestamp) {
        embed.setTimestamp(new Date(embedInput.timestamp));
      }

      // Set footer
      if (embedInput.footer) {
        embed.setFooter({
          text: embedInput.footer.text,
          iconURL: embedInput.footer.iconUrl,
        });
      }

      // Set thumbnail
      if (embedInput.thumbnail) {
        embed.setThumbnail(embedInput.thumbnail.url);
      }

      // Set image
      if (embedInput.image) {
        embed.setImage(embedInput.image.url);
      }

      // Set author
      if (embedInput.author) {
        embed.setAuthor({
          name: embedInput.author.name,
          iconURL: embedInput.author.iconUrl,
          url: embedInput.author.url,
        });
      }

      // Add fields
      if (embedInput.fields && embedInput.fields.length > 0) {
        for (const field of embedInput.fields) {
          embed.addFields({
            name: field.name,
            value: field.value,
            inline: field.inline || false,
          });
        }
      }

      return embed;
    } catch (error: any) {
      this.log.error('Failed to convert embed input to EmbedBuilder', { error: error.message });
      throw new errors.BadRequestError('Invalid embed data format');
    }
  }

  async getGuildRoles(guildId: string): Promise<Role[]> {
    return await DiscordMetrics.measureOperation(
      async () => {
        const guild = await this.client.guilds.fetch(guildId);

        if (!guild) {
          throw new errors.NotFoundError('Discord guild not found');
        }

        const roles = await guild.roles.fetch();
        const roleArray = Array.from(roles.values());

        DiscordMetrics.recordRolesFetched(guildId, roleArray.length);
        return roleArray;
      },
      'getGuildRoles',
      guildId,
    );
  }

  async getGuildChannels(guildId: string): Promise<NonThreadGuildBasedChannel[]> {
    return await DiscordMetrics.measureOperation(
      async () => {
        const guild = await this.client.guilds.fetch(guildId);

        if (!guild) {
          throw new errors.NotFoundError('Discord guild not found');
        }

        const channels = await guild.channels.fetch();
        const channelArray = Array.from(channels.values()).filter(
          (channel): channel is NonThreadGuildBasedChannel => channel !== null,
        );

        DiscordMetrics.recordChannelsFetched(guildId, channelArray.length);
        return channelArray;
      },
      'getGuildChannels',
      guildId,
    );
  }

  async messageHandler(message: Message) {
    if (!message.inGuild()) {
      // Ignore DMs
      return;
    }

    const domainId = await DiscordService.NOT_DOMAIN_SCOPED_resolveDomainFromGuildId(message.guild.id);

    if (!domainId) {
      // Ignore messages from guilds that are not linked to a domain
      return;
    }

    const service = new DiscordService(domainId);
    await service.handleMessage(message);
  }

  async assignRole(guildId: string, userId: string, roleId: string): Promise<void> {
    return await DiscordMetrics.measureOperation(
      async () => {
        const guild = await this.client.guilds.fetch(guildId);

        if (!guild) {
          throw new errors.NotFoundError('Discord guild not found');
        }

        const member = await guild.members.fetch(userId);

        if (!member) {
          throw new errors.NotFoundError(`Discord member ${userId} not found in guild ${guildId}`);
        }

        await member.roles.add(roleId);
        DiscordMetrics.recordRoleAssigned(guildId, userId, roleId);

        this.log.info('Assigned Discord role', { guildId, userId, roleId });
      },
      'assignRole',
      guildId,
    );
  }

  async removeRole(guildId: string, userId: string, roleId: string): Promise<void> {
    return await DiscordMetrics.measureOperation(
      async () => {
        const guild = await this.client.guilds.fetch(guildId);

        if (!guild) {
          throw new errors.NotFoundError('Discord guild not found');
        }

        const member = await guild.members.fetch(userId);

        if (!member) {
          throw new errors.NotFoundError(`Discord member ${userId} not found in guild ${guildId}`);
        }

        await member.roles.remove(roleId);
        DiscordMetrics.recordRoleRemoved(guildId, userId, roleId);

        this.log.info('Removed Discord role', { guildId, userId, roleId });
      },
      'removeRole',
      guildId,
    );
  }

  async getMemberRoles(guildId: string, userId: string): Promise<string[]> {
    return await DiscordMetrics.measureOperation(
      async () => {
        const guild = await this.client.guilds.fetch(guildId);

        if (!guild) {
          throw new errors.NotFoundError('Discord guild not found');
        }

        const member = await guild.members.fetch(userId);

        if (!member) {
          throw new errors.NotFoundError(`Discord member ${userId} not found in guild ${guildId}`);
        }

        const roleIds = Array.from(member.roles.cache.keys());

        this.log.debug('Fetched Discord member roles', { guildId, userId, roleCount: roleIds.length });

        return roleIds;
      },
      'getMemberRoles',
      guildId,
    );
  }

  private async handleGuildMemberUpdate(oldMember: GuildMember, newMember: GuildMember) {
    try {
      this.log.debug('Received guildMemberUpdate event', {
        guildId: newMember.guild.id,
        userId: newMember.id,
        oldRoles: Array.from(oldMember.roles.cache.keys()),
        newRoles: Array.from(newMember.roles.cache.keys()),
      });

      const domainId = await DiscordService.NOT_DOMAIN_SCOPED_resolveDomainFromGuildId(newMember.guild.id);

      if (!domainId) {
        this.log.debug('Guild not linked to any domain, ignoring member update', { guildId: newMember.guild.id });
        return;
      }

      const discordService = new DiscordService(domainId);
      await discordService.handleDiscordMemberUpdate(oldMember, newMember);
    } catch (error) {
      this.log.error('Error handling guild member update', {
        error,
        guildId: newMember.guild.id,
        userId: newMember.id,
      });
    }
  }
}

export const discordBot = new DiscordBot();
