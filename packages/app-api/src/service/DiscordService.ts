import { TakaroDTO, errors, ctx, traceableClass } from '@takaro/util';
import { DiscordGuildModel, DiscordRepo } from '../db/discord.js';
import { TakaroService } from './Base.js';
import { ITakaroQuery } from '@takaro/db';
import { RESTGetAPICurrentUserGuildsResult } from 'discord-api-types/v10';
import { Message, PermissionsBitField } from 'discord.js';
import { discordBot } from '../lib/DiscordBot.js';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  ValidateNested,
  ArrayMaxSize,
  Min,
  Max,
  IsUrl,
  IsISO8601,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  Validate,
} from 'class-validator';
import { Exclude, Type } from 'class-transformer';
import { HookService } from './HookService.js';
import { GameServerService } from './GameServerService.js';
import { DiscordErrorHandler } from '../lib/DiscordErrorHandler.js';

import { EventDiscordChannel, EventDiscordUser, HookEventDiscordMessage } from '@takaro/modules';
import { UserService } from './User/index.js';
import { checkPermissions } from './AuthService.js';
import { PERMISSIONS } from '@takaro/auth';

@ValidatorConstraint({ name: 'messageOrEmbed', async: false })
class MessageOrEmbedConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: any) {
    const object = args.object as SendMessageInputDTO;
    return !!(object.message || object.embed);
  }

  defaultMessage() {
    return 'Either message or embed must be provided';
  }
}

export class GuildOutputDTO extends TakaroDTO<GuildOutputDTO> {
  @IsUUID()
  id!: string;
  @IsString()
  name!: string;
  @IsString()
  @Length(18, 18)
  discordId: string;
  @IsBoolean()
  takaroEnabled: boolean;
  @IsString()
  @IsOptional()
  icon?: string | null;
}

export class GuildCreateInputDTO extends TakaroDTO<GuildCreateInputDTO> {
  @IsString()
  name!: string;
  @IsString()
  @Length(18, 18)
  discordId: string;
  @IsString()
  @IsOptional()
  icon?: string | null;
}

export class GuildUpdateDTO extends TakaroDTO<GuildUpdateDTO> {
  @IsString()
  @IsOptional()
  name?: string;
  @IsString()
  @IsOptional()
  icon?: string | null;
  @IsBoolean()
  @IsOptional()
  takaroEnabled?: boolean;
}

export class DiscordRoleOutputDTO extends TakaroDTO<DiscordRoleOutputDTO> {
  @IsString()
  id!: string;

  @IsString()
  name!: string;

  @IsNumber()
  color!: number;
}

export class DiscordChannelOutputDTO extends TakaroDTO<DiscordChannelOutputDTO> {
  @IsString()
  id!: string;

  @IsString()
  name!: string;

  @IsNumber()
  type!: number;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsString()
  @IsOptional()
  topic?: string;
}

export class DiscordEmbedField extends TakaroDTO<DiscordEmbedField> {
  @IsString()
  @Length(1, 256)
  name!: string;

  @IsString()
  @Length(1, 1024)
  value!: string;

  @IsBoolean()
  @IsOptional()
  inline?: boolean;
}

export class DiscordEmbedFooter extends TakaroDTO<DiscordEmbedFooter> {
  @IsString()
  @Length(1, 2048)
  text!: string;

  @IsUrl()
  @IsOptional()
  iconUrl?: string;
}

export class DiscordEmbedImage extends TakaroDTO<DiscordEmbedImage> {
  @IsUrl()
  url!: string;
}

export class DiscordEmbedAuthor extends TakaroDTO<DiscordEmbedAuthor> {
  @IsString()
  @Length(1, 256)
  name!: string;

  @IsUrl()
  @IsOptional()
  iconUrl?: string;

  @IsUrl()
  @IsOptional()
  url?: string;
}

export class DiscordEmbedInputDTO extends TakaroDTO<DiscordEmbedInputDTO> {
  @IsString()
  @IsOptional()
  @Length(1, 256)
  title?: string;

  @IsString()
  @IsOptional()
  @Length(1, 4096)
  description?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(16777215)
  color?: number;

  @Type(() => DiscordEmbedField)
  @ValidateNested({ each: true })
  @IsOptional()
  @ArrayMaxSize(25)
  fields?: DiscordEmbedField[];

  @Type(() => DiscordEmbedFooter)
  @ValidateNested()
  @IsOptional()
  footer?: DiscordEmbedFooter;

  @Type(() => DiscordEmbedImage)
  @ValidateNested()
  @IsOptional()
  thumbnail?: DiscordEmbedImage;

  @Type(() => DiscordEmbedImage)
  @ValidateNested()
  @IsOptional()
  image?: DiscordEmbedImage;

  @Type(() => DiscordEmbedAuthor)
  @ValidateNested()
  @IsOptional()
  author?: DiscordEmbedAuthor;

  @IsISO8601()
  @IsOptional()
  timestamp?: string;
}

export class SendMessageInputDTO extends TakaroDTO<SendMessageInputDTO> {
  @IsString()
  @IsOptional()
  message?: string;

  @Type(() => DiscordEmbedInputDTO)
  @ValidateNested()
  @IsOptional()
  embed?: DiscordEmbedInputDTO;

  @Validate(MessageOrEmbedConstraint)
  @Exclude()
  private _validation?: any;
}

export class MessageOutputDTO extends TakaroDTO<MessageOutputDTO> {
  @IsString()
  id!: string;

  @IsString()
  channelId!: string;

  @IsString()
  guildId!: string;

  @IsString()
  @IsOptional()
  content?: string;

  @Type(() => DiscordEmbedInputDTO)
  @ValidateNested()
  @IsOptional()
  embed?: DiscordEmbedInputDTO;
}

@traceableClass('service:discord')
export class DiscordService extends TakaroService<
  DiscordGuildModel,
  GuildOutputDTO,
  GuildCreateInputDTO,
  GuildUpdateDTO
> {
  get repo() {
    return new DiscordRepo(this.domainId);
  }

  async create(input: GuildCreateInputDTO) {
    return this.repo.create(input);
  }

  async update(id: string, input: GuildUpdateDTO) {
    if (input.takaroEnabled !== undefined) {
      const userId = ctx.data.user;
      if (!userId) throw new errors.ForbiddenError();

      // Check if user has MANAGE_SERVER permission on this Discord guild
      // No bypass for ROOT users - they must have Discord permission to enable/disable guilds
      const serversWithPermission = await this.repo.getServersWithManagePermission(userId);

      if (!serversWithPermission.find((server) => server.id === id)) {
        this.log.warn(`User ${userId} tried to update guild ${id} without MANAGE_SERVER permission on Discord`);
        throw new errors.ForbiddenError();
      }
    }

    return this.repo.update(id, input);
  }

  async find(filters: ITakaroQuery<GuildOutputDTO>) {
    return this.repo.find(filters);
  }

  async findOne(id: string) {
    return this.repo.findOne(id);
  }

  async delete(id: string) {
    await this.repo.delete(id);
    return id;
  }

  // TODO: optimization for later is to move this into a bull job
  async syncGuilds(inputGuilds: RESTGetAPICurrentUserGuildsResult) {
    const guilds = inputGuilds.filter((guild) => {
      const permissions = new PermissionsBitField(BigInt(guild.permissions));
      return permissions.has(PermissionsBitField.Flags.ManageGuild);
    });

    const existingDbGuilds = await this.repo.find({
      limit: 3000,
    });

    const addedGuilds = guilds.filter((guild) => {
      return !existingDbGuilds.results.find((dbGuild) => dbGuild.discordId === guild.id);
    });
    const toUpdate = guilds.filter((guild) => {
      return existingDbGuilds.results.find((dbGuild) => dbGuild.discordId === guild.id);
    });

    this.log.info(`Syncing guilds: ${addedGuilds.length.toString()} added`);

    await Promise.all(
      addedGuilds.map(async (guild) =>
        this.create(
          new GuildCreateInputDTO({
            discordId: guild.id,
            name: guild.name,
            icon: guild.icon,
          }),
        ),
      ),
    );
    await Promise.all(
      toUpdate.map(async (guild) => {
        const dbGuild = existingDbGuilds.results.find((dbGuild) => dbGuild.discordId === guild.id);
        if (!dbGuild) return;
        return this.update(
          dbGuild.id,
          new GuildUpdateDTO({
            name: guild.name,
            icon: guild.icon,
          }),
        );
      }),
    );

    const newDbGuilds = await this.repo.find({
      limit: 3000,
    });

    const userId = ctx.data.user;

    if (userId) {
      await Promise.all(
        guilds.map((guild) => {
          const permissions = new PermissionsBitField(BigInt(guild.permissions));
          const dbGuild = newDbGuilds.results.find((dbGuild) => dbGuild.discordId === guild.id);
          if (!dbGuild) return;
          return this.repo.setUserRelation(userId, dbGuild.id, permissions.has(PermissionsBitField.Flags.ManageGuild));
        }),
      );
    }
  }

  async sendMessage(channelId: string, message: SendMessageInputDTO): Promise<MessageOutputDTO> {
    this.log.info(`Sending message to Discord channel ${channelId}`);

    try {
      // Validate input - either message or embed must be provided
      if (!message.message && !message.embed) {
        throw new errors.BadRequestError('Either message content or embed must be provided');
      }

      // Validate embed content and structure if provided
      if (message.embed) {
        this.validateEmbedContent(message.embed);
      }

      // Get channel and validate it exists
      const channel = await discordBot.getChannel(channelId);
      if (!channel) {
        throw new errors.NotFoundError(`Discord channel ${channelId} not found`);
      }

      // Validate guild access and permissions
      await this.validateGuildAccess(channel.guildId);

      // Send the message through DiscordBot (which now includes rate limiting and metrics)
      const sentMessage = await discordBot.sendMessage(channelId, message.message, message.embed);

      this.log.info(`Successfully sent message to Discord channel ${channelId}`, {
        messageId: sentMessage.id,
        hasEmbed: !!message.embed,
        hasContent: !!message.message,
      });

      // Transform to MessageOutputDTO
      const outputDTO = new MessageOutputDTO({
        id: sentMessage.id,
        channelId: sentMessage.channelId,
        guildId: sentMessage.guildId || sentMessage.guild?.id || channel.guildId,
        content: sentMessage.content || undefined,
        embed: message.embed, // Return the input embed if provided
      });

      return outputDTO;
    } catch (error: any) {
      // Log error with Discord error handler for appropriate level
      DiscordErrorHandler.logError(error, {
        operation: 'sendMessage',
        channelId,
        hasEmbed: !!message.embed,
        hasContent: !!message.message,
      });

      // Re-throw known errors
      if (error instanceof errors.TakaroError) {
        throw error;
      }

      // Map Discord errors to appropriate Takaro errors
      throw DiscordErrorHandler.mapDiscordError(error);
    }
  }

  async handleMessage(message: Message<true>) {
    const { channel, author, member } = message;

    const messageDTO = new HookEventDiscordMessage({
      channel: new EventDiscordChannel({
        id: channel.id,
        name: channel.name,
      }),
      author: new EventDiscordUser({
        id: author.id,
        username: author.username,
        displayName: member?.displayName,
        isBot: author.bot,
        isTakaroBot: author.id === discordBot.botUserId,
      }),
      msg: message.cleanContent,
    });

    const gameServerService = new GameServerService(this.domainId);

    const hookPromises = [];
    for await (const gameServer of gameServerService.getIterator()) {
      const hookService = new HookService(this.domainId);
      hookPromises.push(
        hookService.handleEvent({
          eventType: messageDTO.type,
          eventData: messageDTO,
          gameServerId: gameServer.id,
        }),
      );
    }

    await Promise.all(hookPromises);
  }

  async getRoles(guildId: string): Promise<DiscordRoleOutputDTO[]> {
    this.log.info(`Fetching roles for guild ${guildId}`);

    try {
      // Validate guild exists and is enabled for Takaro
      const _guild = await this.validateGuildAccess(guildId);

      // Fetch roles from Discord API (includes rate limiting and metrics)
      const discordRoles = await discordBot.getGuildRoles(guildId);

      // Transform Discord roles to DTOs
      const roleDTOs = discordRoles.map(
        (role) =>
          new DiscordRoleOutputDTO({
            id: role.id,
            name: role.name,
            color: role.color,
          }),
      );

      this.log.info(`Successfully fetched ${roleDTOs.length} roles for guild ${guildId}`);
      return roleDTOs;
    } catch (error: any) {
      // Log error with Discord error handler for appropriate level
      DiscordErrorHandler.logError(error, {
        operation: 'getRoles',
        guildId,
      });

      // Re-throw known errors
      if (error instanceof errors.TakaroError) {
        throw error;
      }

      // Map Discord errors to appropriate Takaro errors
      throw DiscordErrorHandler.mapDiscordError(error);
    }
  }

  async getChannels(guildId: string): Promise<DiscordChannelOutputDTO[]> {
    this.log.info(`Fetching channels for guild ${guildId}`);

    try {
      // Validate guild exists and is enabled for Takaro
      const _guild = await this.validateGuildAccess(guildId);

      // Fetch channels from Discord API (includes rate limiting and metrics)
      const discordChannels = await discordBot.getGuildChannels(guildId);

      // Transform Discord channels to DTOs
      const channelDTOs = discordChannels.map(
        (channel) =>
          new DiscordChannelOutputDTO({
            id: channel.id,
            name: channel.name,
            type: channel.type,
            parentId: channel.parentId || undefined,
            topic: channel.isTextBased() ? (channel as any).topic || undefined : undefined,
          }),
      );

      this.log.info(`Successfully fetched ${channelDTOs.length} channels for guild ${guildId}`);
      return channelDTOs;
    } catch (error: any) {
      // Log error with Discord error handler for appropriate level
      DiscordErrorHandler.logError(error, {
        operation: 'getChannels',
        guildId,
      });

      // Re-throw known errors
      if (error instanceof errors.TakaroError) {
        throw error;
      }

      // Map Discord errors to appropriate Takaro errors
      throw DiscordErrorHandler.mapDiscordError(error);
    }
  }

  private validateEmbedContent(embed: DiscordEmbedInputDTO): void {
    // Validate embed has at least some content
    const hasContent = !!(
      embed.title ||
      embed.description ||
      embed.fields?.length ||
      embed.footer ||
      embed.image ||
      embed.thumbnail ||
      embed.author
    );

    if (!hasContent) {
      throw new errors.BadRequestError(
        'Embed must contain at least one of: title, description, fields, footer, image, thumbnail, or author',
      );
    }

    // Validate total character count (Discord limit is 6000 characters total)
    let totalCharacters = 0;

    if (embed.title) {
      totalCharacters += embed.title.length;
    }

    if (embed.description) {
      totalCharacters += embed.description.length;
    }

    if (embed.footer?.text) {
      totalCharacters += embed.footer.text.length;
    }

    if (embed.author?.name) {
      totalCharacters += embed.author.name.length;
    }

    if (embed.fields) {
      for (const field of embed.fields) {
        totalCharacters += field.name.length + field.value.length;
      }
    }

    if (totalCharacters > 6000) {
      throw new errors.BadRequestError(
        `Embed content exceeds Discord's 6000 character limit (current: ${totalCharacters})`,
      );
    }

    // Validate timestamp format if provided
    if (embed.timestamp) {
      try {
        const date = new Date(embed.timestamp);
        if (isNaN(date.getTime())) {
          throw new Error('Invalid date');
        }
      } catch {
        throw new errors.BadRequestError('Invalid timestamp format. Must be a valid ISO 8601 date string');
      }
    }

    // Validate URLs if provided
    if (embed.thumbnail?.url) {
      this.validateUrl(embed.thumbnail.url, 'thumbnail URL');
    }

    if (embed.image?.url) {
      this.validateUrl(embed.image.url, 'image URL');
    }

    if (embed.footer?.iconUrl) {
      this.validateUrl(embed.footer.iconUrl, 'footer icon URL');
    }

    if (embed.author?.iconUrl) {
      this.validateUrl(embed.author.iconUrl, 'author icon URL');
    }

    if (embed.author?.url) {
      this.validateUrl(embed.author.url, 'author URL');
    }

    // Validate fields array
    if (embed.fields) {
      if (embed.fields.length === 0) {
        throw new errors.BadRequestError(
          'Fields array cannot be empty. Remove the fields property or provide at least one field',
        );
      }

      // Check for empty field names or values
      for (let i = 0; i < embed.fields.length; i++) {
        const field = embed.fields[i];
        if (!field.name.trim()) {
          throw new errors.BadRequestError(`Field ${i + 1} name cannot be empty or whitespace only`);
        }
        if (!field.value.trim()) {
          throw new errors.BadRequestError(`Field ${i + 1} value cannot be empty or whitespace only`);
        }
      }
    }

    this.log.debug('Embed validation passed', {
      totalCharacters,
      hasTitle: !!embed.title,
      hasDescription: !!embed.description,
      fieldCount: embed.fields?.length || 0,
    });
  }

  private validateUrl(url: string, fieldName: string): void {
    try {
      const parsedUrl = new URL(url);

      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new errors.BadRequestError(`${fieldName} must use http or https protocol`);
      }

      // Basic validation for common malicious patterns
      if (url.includes('javascript:') || url.includes('data:')) {
        throw new errors.BadRequestError(`${fieldName} contains potentially malicious content`);
      }
    } catch (error: any) {
      if (error instanceof errors.TakaroError) {
        throw error;
      }
      throw new errors.BadRequestError(`Invalid ${fieldName}: ${error.message}`);
    }
  }

  private async validateGuildAccess(guildId: string, requireManagePermission: boolean = true): Promise<GuildOutputDTO> {
    // Find guild by Discord ID
    const guildResult = await this.find({ filters: { discordId: [guildId] } });

    if (!guildResult.results.length) {
      this.log.warn(`Guild not found for Discord ID ${guildId}`);
      throw new errors.NotFoundError(`Guild not found for Discord ID ${guildId}`);
    }

    const guild = guildResult.results[0];

    if (!guild.takaroEnabled) {
      this.log.warn(`Takaro not enabled for guild ${guild.id} (Discord ID: ${guildId})`);
      throw new errors.BadRequestError(`Takaro not enabled for guild ${guild.id}`);
    }

    // Check user permissions if required and user context is available
    if (requireManagePermission) {
      const userId = ctx.data.user;
      if (!userId) {
        throw new errors.ForbiddenError();
      }

      // Get user to check for ROOT permission
      const user = await new UserService(this.domainId).findOne(userId);
      if (!user) {
        throw new errors.NotFoundError(`User with id ${userId} not found`);
      }

      // ROOT permission bypasses all other permission checks
      const hasRoot = checkPermissions([PERMISSIONS.ROOT], user);
      if (hasRoot) {
        this.log.debug(`User ${userId} has ROOT permission, bypassing guild permission check`);
        return guild;
      }

      // Check if user has manage permission on this specific guild
      const serversWithPermission = await this.repo.getServersWithManagePermission(userId);
      if (!serversWithPermission.find((server) => server.id === guild.id)) {
        this.log.warn(`User ${userId} lacks permission to access guild ${guild.id} (Discord ID: ${guildId})`);
        throw new errors.ForbiddenError();
      }
    }

    return guild;
  }

  async updateMessage(channelId: string, messageId: string, update: SendMessageInputDTO): Promise<MessageOutputDTO> {
    this.log.info(`Updating Discord message ${messageId} in channel ${channelId}`);

    try {
      // Validate input - either message or embed must be provided
      if (!update.message && !update.embed) {
        throw new errors.BadRequestError('Either message content or embed must be provided');
      }

      // Validate embed content and structure if provided
      if (update.embed) {
        this.validateEmbedContent(update.embed);
      }

      // Fetch the message to get guild information for permission validation
      const message = await discordBot.fetchMessage(channelId, messageId);

      if (!message.guild) {
        throw new errors.BadRequestError('Cannot update messages in DM channels');
      }

      // Validate guild access and permissions
      await this.validateGuildAccess(message.guild.id);

      // Update the message through DiscordBot
      const updatedMessage = await discordBot.updateMessage(channelId, messageId, update.message, update.embed);

      this.log.info(`Successfully updated Discord message ${messageId}`, {
        hasEmbed: !!update.embed,
        hasContent: !!update.message,
      });

      // Transform to MessageOutputDTO
      const outputDTO = new MessageOutputDTO({
        id: updatedMessage.id,
        channelId: updatedMessage.channelId,
        guildId: updatedMessage.guildId || updatedMessage.guild?.id || message.guild.id,
        content: updatedMessage.content || undefined,
        embed: update.embed, // Return the input embed if provided
      });

      return outputDTO;
    } catch (error: any) {
      // Log error with Discord error handler for appropriate level
      DiscordErrorHandler.logError(error, {
        operation: 'updateMessage',
        messageId,
        hasEmbed: !!update.embed,
        hasContent: !!update.message,
      });

      // Re-throw known errors
      if (error instanceof errors.TakaroError) {
        throw error;
      }

      // Map Discord errors to appropriate Takaro errors
      throw DiscordErrorHandler.mapDiscordError(error);
    }
  }

  async deleteMessage(channelId: string, messageId: string): Promise<void> {
    this.log.info(`Deleting Discord message ${messageId} from channel ${channelId}`);

    try {
      // Fetch the message to get guild information for permission validation
      const message = await discordBot.fetchMessage(channelId, messageId);

      if (!message.guild) {
        throw new errors.BadRequestError('Cannot delete messages in DM channels');
      }

      // Validate guild access and permissions
      await this.validateGuildAccess(message.guild.id);

      // Delete the message through DiscordBot
      await discordBot.deleteMessage(channelId, messageId);

      this.log.info(`Successfully deleted Discord message ${messageId}`);
    } catch (error: any) {
      // Log error with Discord error handler for appropriate level
      DiscordErrorHandler.logError(error, {
        operation: 'deleteMessage',
        messageId,
      });

      // Re-throw known errors
      if (error instanceof errors.TakaroError) {
        throw error;
      }

      // Map Discord errors to appropriate Takaro errors
      throw DiscordErrorHandler.mapDiscordError(error);
    }
  }

  static async NOT_DOMAIN_SCOPED_resolveDomainFromGuildId(guildId: string): Promise<string | null> {
    return DiscordRepo.NOT_DOMAIN_SCOPED_resolveDomainFromGuildId(guildId);
  }
}
