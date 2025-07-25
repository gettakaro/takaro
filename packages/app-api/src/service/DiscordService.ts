import { TakaroDTO, errors, ctx, traceableClass } from '@takaro/util';
import { DiscordGuildModel, DiscordRepo } from '../db/discord.js';
import { TakaroService } from './Base.js';
import { ITakaroQuery } from '@takaro/db';
import { RESTGetAPICurrentUserGuildsResult } from 'discord-api-types/v10';
import { Message, PermissionsBitField, GuildMember } from 'discord.js';
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

import {
  EventDiscordChannel,
  EventDiscordUser,
  HookEventDiscordMessage,
  TakaroEventRoleAssigned,
  TakaroEventRoleRemoved,
} from '@takaro/modules';
import { UserService } from './User/index.js';
import { checkPermissions } from './AuthService.js';
import { PERMISSIONS } from '@takaro/auth';
import { RoleService, RoleOutputDTO } from './RoleService.js';
import { SettingsService, SETTINGS_KEYS } from './SettingsService.js';

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
      const serversWithPermission = await this.repo.getServersWithManagePermission(userId);

      if (!serversWithPermission.find((server) => server.id === id)) {
        this.log.warn(`User ${userId} tried to update guild ${id} without permission`);
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

  async sendMessage(channelId: string, message: SendMessageInputDTO) {
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

      // Validate guild exists and is enabled for Takaro
      const guild = await this.find({ filters: { discordId: [channel.guildId] } });

      if (!guild.results.length) {
        this.log.warn(`Guild not found for channel ${channelId} (guild ID: ${channel.guildId})`);
        throw new errors.BadRequestError(`Guild not found for channel ${channelId}`);
      }

      if (!guild.results[0].takaroEnabled) {
        this.log.warn(`Takaro not enabled for guild ${guild.results[0].id} (Discord ID: ${channel.guildId})`);
        throw new errors.BadRequestError(`Takaro not enabled for guild ${guild.results[0].id}`);
      }

      // Check user permissions if user context is available
      const userId = ctx.data.user;
      if (!userId) throw new errors.ForbiddenError();
      const user = await new UserService(this.domainId).findOne(userId);
      if (!user) throw new errors.NotFoundError(`User with id ${userId} not found`);
      const hasRoot = checkPermissions([PERMISSIONS.ROOT], user);

      const serversWithPermission = await this.repo.getServersWithManagePermission(userId);

      if (!hasRoot && !serversWithPermission.find((server) => server.id === guild.results[0].id)) {
        this.log.warn(`User ${userId} lacks permission to send messages to guild ${guild.results[0].id}`);
        throw new errors.ForbiddenError();
      }

      // Send the message through DiscordBot (which now includes rate limiting and metrics)
      const sentMessage = await discordBot.sendMessage(channelId, message.message, message.embed);

      this.log.info(`Successfully sent message to Discord channel ${channelId}`, {
        messageId: sentMessage.id,
        hasEmbed: !!message.embed,
        hasContent: !!message.message,
      });

      return sentMessage;
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

  private async validateGuildAccess(guildId: string): Promise<GuildOutputDTO> {
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

    // Check user permissions if user context is available
    const userId = ctx.data.user;
    if (userId) {
      const serversWithPermission = await this.repo.getServersWithManagePermission(userId);

      if (!serversWithPermission.find((server) => server.id === guild.id)) {
        this.log.warn(`User ${userId} lacks permission to access guild ${guild.id} (Discord ID: ${guildId})`);
        throw new errors.ForbiddenError();
      }
    }

    return guild;
  }

  static async NOT_DOMAIN_SCOPED_resolveDomainFromGuildId(guildId: string): Promise<string | null> {
    return DiscordRepo.NOT_DOMAIN_SCOPED_resolveDomainFromGuildId(guildId);
  }

  private async getSettings() {
    const settingsService = new SettingsService(this.domainId);
    const [enabled, sourceOfTruth] = await Promise.all([
      settingsService.get(SETTINGS_KEYS.discordRoleSyncEnabled),
      settingsService.get(SETTINGS_KEYS.discordRoleSyncSourceOfTruth),
    ]);

    return {
      discordRoleSyncEnabled: enabled.value === 'true',
      sourceOfTruthIsDiscord: sourceOfTruth.value === 'true',
    };
  }

  async syncUserRoles(userId: string): Promise<{ rolesAdded: number; rolesRemoved: number }> {
    const userService = new UserService(this.domainId);
    const user = await userService.findOne(userId);

    if (!user) {
      throw new errors.NotFoundError(`User with id ${userId} not found`);
    }

    if (!user.discordId) {
      this.log.warn('User has no Discord ID linked, skipping sync', { userId });
      return { rolesAdded: 0, rolesRemoved: 0 };
    }

    const settings = await this.getSettings();
    if (!settings.discordRoleSyncEnabled) {
      this.log.debug('Discord role sync disabled, skipping', { userId });
      return { rolesAdded: 0, rolesRemoved: 0 };
    }

    const roleService = new RoleService(this.domainId);

    // Get all roles with Discord links
    const takaroRoles = await roleService.find({
      filters: {
        linkedDiscordRoleId: [{ $ne: null }],
      },
      limit: 1000,
    });

    // Get user's current roles in Takaro
    const userWithRoles = (await userService.findOne(userId)) as any;
    const userTakaroRoles = userWithRoles?.roles || [];

    // Get ALL Discord guilds for this domain
    const guilds = await this.find({ filters: { takaroEnabled: [true] }, limit: 1000 });
    if (!guilds.results.length) {
      this.log.warn('No enabled Discord guild found for domain', { domainId: this.domainId });
      return { rolesAdded: 0, rolesRemoved: 0 };
    }

    let totalRolesAdded = 0;
    let totalRolesRemoved = 0;

    // Sync roles for each guild
    for (const guild of guilds.results) {
      try {
        const result = await this.syncUserRolesForGuild(
          userId,
          user.discordId,
          guild.discordId,
          takaroRoles.results,
          userTakaroRoles,
          settings.sourceOfTruthIsDiscord,
        );
        totalRolesAdded += result.rolesAdded;
        totalRolesRemoved += result.rolesRemoved;
      } catch (error: any) {
        // Log error but continue with other guilds
        this.log.error('Failed to sync roles for guild', {
          userId,
          guildId: guild.discordId,
          guildName: guild.name,
          error: error.message,
        });
      }
    }

    this.log.info('Completed role sync for user across all guilds', {
      userId,
      discordId: user.discordId,
      guildsProcessed: guilds.results.length,
      totalRolesAdded,
      totalRolesRemoved,
    });

    return { rolesAdded: totalRolesAdded, rolesRemoved: totalRolesRemoved };
  }

  private async syncUserRolesForGuild(
    userId: string,
    discordId: string,
    guildId: string,
    takaroRoles: RoleOutputDTO[],
    userTakaroRoles: any[],
    sourceOfTruthIsDiscord: boolean,
  ): Promise<{ rolesAdded: number; rolesRemoved: number }> {
    // Get user's current roles in Discord for this specific guild
    let userDiscordRoles: string[] = [];
    try {
      userDiscordRoles = await discordBot.getMemberRoles(guildId, discordId);
    } catch (error: any) {
      // User might not be in the guild
      if (error.code === 10007) {
        // Unknown Member
        this.log.debug('User not found in Discord guild', { userId, discordId, guildId });
        userDiscordRoles = [];
      } else {
        throw error;
      }
    }

    // Build role mappings
    const roleMap = new Map(
      takaroRoles.filter((role) => role.linkedDiscordRoleId).map((role) => [role.linkedDiscordRoleId!, role]),
    );

    // Debug logging
    this.log.info('[ROLE_SYNC_DEBUG] Starting role sync for guild', {
      userId,
      discordId,
      guildId,
      sourceOfTruthIsDiscord,
      userTakaroRoles: userTakaroRoles.map((r: any) => ({
        roleId: r.role?.id || r.roleId,
        roleName: r.role?.name,
        linkedDiscordRoleId: r.role?.linkedDiscordRoleId,
      })),
      userDiscordRoles,
      availableRoleMappings: Array.from(roleMap.entries()).map(([discordId, role]) => ({
        discordRoleId: discordId,
        takaroRoleId: role.id,
        takaroRoleName: role.name,
      })),
    });

    // Calculate changes
    const changes = this.calculateRoleChanges(
      userTakaroRoles.map((r: any) => r.role),
      userDiscordRoles,
      roleMap,
      sourceOfTruthIsDiscord,
    );

    // Apply changes
    const result = await this.applyRoleChanges(userId, discordId, guildId, changes);

    this.log.debug('Completed role sync for user in guild', {
      userId,
      discordId,
      guildId,
      rolesAdded: result.rolesAdded,
      rolesRemoved: result.rolesRemoved,
    });

    return result;
  }

  private calculateRoleChanges(
    takaroRoles: Array<{ id: string; linkedDiscordRoleId?: string }>,
    discordRoleIds: string[],
    roleMap: Map<string, { id: string; linkedDiscordRoleId?: string }>,
    sourceOfTruthIsDiscord: boolean,
  ): {
    addToTakaro: string[];
    removeFromTakaro: string[];
    addToDiscord: string[];
    removeFromDiscord: string[];
  } {
    const takaroRoleIds = new Set(takaroRoles.map((r) => r.id));
    const discordRoleSet = new Set(discordRoleIds);

    this.log.info('[ROLE_SYNC_DEBUG] calculateRoleChanges input', {
      sourceOfTruthIsDiscord,
      takaroRoles: takaroRoles.map((r) => ({
        id: r.id,
        linkedDiscordRoleId: r.linkedDiscordRoleId,
      })),
      takaroRoleIds: Array.from(takaroRoleIds),
      discordRoleIds,
      roleMapSize: roleMap.size,
      roleMapEntries: Array.from(roleMap.entries()).map(([k, v]) => ({
        discordRoleId: k,
        takaroRoleId: v.id,
        takaroLinkedDiscordId: v.linkedDiscordRoleId,
      })),
    });

    const changes = {
      addToTakaro: [] as string[],
      removeFromTakaro: [] as string[],
      addToDiscord: [] as string[],
      removeFromDiscord: [] as string[],
    };

    // Check each mapped role
    for (const [discordRoleId, takaroRole] of roleMap) {
      const hasInTakaro = takaroRoleIds.has(takaroRole.id);
      const hasInDiscord = discordRoleSet.has(discordRoleId);

      this.log.info('[ROLE_SYNC_DEBUG] Checking role mapping', {
        discordRoleId,
        takaroRoleId: takaroRole.id,
        hasInTakaro,
        hasInDiscord,
        sourceOfTruthIsDiscord,
      });

      if (hasInTakaro && !hasInDiscord) {
        if (!sourceOfTruthIsDiscord) {
          // Takaro is source of truth
          this.log.info('[ROLE_SYNC_DEBUG] User has role in Takaro but not Discord, adding to Discord', {
            discordRoleId,
            takaroRoleId: takaroRole.id,
          });
          changes.addToDiscord.push(discordRoleId);
        } else {
          this.log.info(
            '[ROLE_SYNC_DEBUG] User has role in Takaro but not Discord, removing from Takaro (Discord is source)',
            {
              discordRoleId,
              takaroRoleId: takaroRole.id,
            },
          );
          changes.removeFromTakaro.push(takaroRole.id);
        }
      } else if (!hasInTakaro && hasInDiscord) {
        if (sourceOfTruthIsDiscord) {
          // Discord is source of truth
          this.log.info('[ROLE_SYNC_DEBUG] User has role in Discord but not Takaro, adding to Takaro', {
            discordRoleId,
            takaroRoleId: takaroRole.id,
          });
          changes.addToTakaro.push(takaroRole.id);
        } else {
          this.log.info(
            '[ROLE_SYNC_DEBUG] User has role in Discord but not Takaro, removing from Discord (Takaro is source)',
            {
              discordRoleId,
              takaroRoleId: takaroRole.id,
            },
          );
          changes.removeFromDiscord.push(discordRoleId);
        }
      } else {
        this.log.info('[ROLE_SYNC_DEBUG] Role is in sync', {
          discordRoleId,
          takaroRoleId: takaroRole.id,
          hasInBoth: hasInTakaro && hasInDiscord,
          hasInNeither: !hasInTakaro && !hasInDiscord,
        });
      }
    }

    this.log.info('[ROLE_SYNC_DEBUG] Calculated changes', changes);

    return changes;
  }

  private async applyRoleChanges(
    userId: string,
    discordId: string,
    guildId: string,
    changes: {
      addToTakaro: string[];
      removeFromTakaro: string[];
      addToDiscord: string[];
      removeFromDiscord: string[];
    },
  ): Promise<{ rolesAdded: number; rolesRemoved: number }> {
    this.log.info('[ROLE_SYNC_DEBUG] Applying role changes', {
      userId,
      discordId,
      guildId,
      changes,
    });

    const userService = new UserService(this.domainId);
    let rolesAdded = 0;
    let rolesRemoved = 0;

    // Apply Takaro changes
    for (const roleId of changes.addToTakaro) {
      try {
        await userService.assignRole(roleId, userId);
        rolesAdded++;
        this.log.info('[ROLE_SYNC_DEBUG] Successfully added role to Takaro user', { userId, roleId });
      } catch (error) {
        this.log.error('[ROLE_SYNC_DEBUG] Failed to add role to Takaro user', { userId, roleId, error });
      }
    }

    for (const roleId of changes.removeFromTakaro) {
      try {
        await userService.removeRole(roleId, userId);
        rolesRemoved++;
        this.log.info('[ROLE_SYNC_DEBUG] Successfully removed role from Takaro user', { userId, roleId });
      } catch (error) {
        this.log.error('[ROLE_SYNC_DEBUG] Failed to remove role from Takaro user', { userId, roleId, error });
      }
    }

    // Apply Discord changes
    for (const roleId of changes.addToDiscord) {
      try {
        await discordBot.assignRole(guildId, discordId, roleId);
        rolesAdded++;
        this.log.info('[ROLE_SYNC_DEBUG] Successfully added role to Discord member', { discordId, roleId, guildId });
      } catch (error) {
        this.log.error('[ROLE_SYNC_DEBUG] Failed to add role to Discord member', { discordId, roleId, guildId, error });
      }
    }

    for (const roleId of changes.removeFromDiscord) {
      try {
        await discordBot.removeRole(guildId, discordId, roleId);
        rolesRemoved++;
        this.log.info('[ROLE_SYNC_DEBUG] Successfully removed role from Discord member', {
          discordId,
          roleId,
          guildId,
        });
      } catch (error) {
        this.log.error('[ROLE_SYNC_DEBUG] Failed to remove role from Discord member', {
          discordId,
          roleId,
          guildId,
          error,
        });
      }
    }

    this.log.info('[ROLE_SYNC_DEBUG] Completed applying changes', {
      rolesAdded,
      rolesRemoved,
    });

    return { rolesAdded, rolesRemoved };
  }

  async handleDiscordMemberUpdate(oldMember: GuildMember, newMember: GuildMember) {
    const settings = await this.getSettings();
    if (!settings.discordRoleSyncEnabled) {
      this.log.debug('Discord role sync disabled, ignoring member update', {
        guildId: newMember.guild.id,
      });
      return;
    }

    // Get the roles that changed
    const oldRoles = Array.from(oldMember.roles.cache.keys());
    const newRoles = Array.from(newMember.roles.cache.keys());

    const addedRoles = newRoles.filter((role) => !oldRoles.includes(role));
    const removedRoles = oldRoles.filter((role) => !newRoles.includes(role));

    if (addedRoles.length === 0 && removedRoles.length === 0) {
      // No role changes
      return;
    }

    this.log.debug('Discord member roles changed', {
      guildId: newMember.guild.id,
      userId: newMember.id,
      addedRoles,
      removedRoles,
    });

    // Find user by Discord ID
    const userService = new UserService(this.domainId);
    const users = await userService.find({
      filters: {
        discordId: [newMember.id],
      },
      limit: 1,
    });

    if (!users.results.length) {
      this.log.debug('No Takaro user found with Discord ID', {
        discordId: newMember.id,
      });
      return;
    }

    const user = users.results[0];

    // Only sync if Discord is the source of truth
    if (!settings.sourceOfTruthIsDiscord) {
      this.log.debug('Takaro is source of truth, ignoring Discord role changes', {
        userId: user.id,
      });
      return;
    }

    // Sync the user's roles
    await this.syncUserRoles(user.id);
  }

  async handleRoleAssignment(userId: string, event: TakaroEventRoleAssigned) {
    const settings = await this.getSettings();
    if (!settings.discordRoleSyncEnabled) {
      return;
    }

    // Only sync if Takaro is the source of truth
    if (settings.sourceOfTruthIsDiscord) {
      this.log.debug('Discord is source of truth, ignoring Takaro role assignment', {
        userId,
        roleId: event.role.id,
      });
      return;
    }

    // Sync the user's roles
    await this.syncUserRoles(userId);
  }

  async handleRoleRemoval(userId: string, event: TakaroEventRoleRemoved) {
    const settings = await this.getSettings();
    if (!settings.discordRoleSyncEnabled) {
      return;
    }

    // Only sync if Takaro is the source of truth
    if (settings.sourceOfTruthIsDiscord) {
      this.log.debug('Discord is source of truth, ignoring Takaro role removal', {
        userId,
        roleId: event.role.id,
      });
      return;
    }

    // Sync the user's roles
    await this.syncUserRoles(userId);
  }
}
