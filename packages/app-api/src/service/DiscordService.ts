import { TakaroDTO, errors, ctx, traceableClass } from '@takaro/util';
import { DiscordGuildModel, DiscordRepo } from '../db/discord.js';
import { TakaroService } from './Base.js';
import { ITakaroQuery } from '@takaro/db';
import { RESTGetAPICurrentUserGuildsResult } from 'discord-api-types/v10';
import { Message, PermissionsBitField } from 'discord.js';
import { discordBot } from '../lib/DiscordBot.js';
import { IsBoolean, IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { HookService } from './HookService.js';
import { GameServerService } from './GameServerService.js';

import { EventDiscordChannel, EventDiscordUser, HookEventDiscordMessage } from '@takaro/modules';

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

export class SendMessageInputDTO extends TakaroDTO<SendMessageInputDTO> {
  @IsString()
  message!: string;
}

@traceableClass('service:discord')
export class DiscordService extends TakaroService<
  DiscordGuildModel,
  GuildOutputDTO,
  GuildCreateInputDTO,
  GuildUpdateDTO
> {
  constructor(domainId: string) {
    super(domainId);
  }

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

    this.log.info(`Syncing guilds: ${addedGuilds.length} added`);

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
    const channel = await discordBot.getChannel(channelId);

    const guild = await this.find({ filters: { discordId: [channel.guildId] } });

    if (!guild.results.length) {
      throw new errors.BadRequestError(`Guild not found for channel ${channelId}`);
    }

    if (!guild.results[0].takaroEnabled) {
      throw new errors.BadRequestError(`Takaro not enabled for guild ${guild.results[0].id}`);
    }

    await discordBot.sendMessage(channelId, message.message);
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
    const gameServers = await gameServerService.find({});

    await Promise.all(
      gameServers.results.map((gameServer) => {
        const hookService = new HookService(this.domainId);
        return hookService.handleEvent({
          eventType: messageDTO.type,
          eventData: messageDTO,
          gameServerId: gameServer.id,
        });
      }),
    );
  }

  static async NOT_DOMAIN_SCOPED_resolveDomainFromGuildId(guildId: string): Promise<string | null> {
    return DiscordRepo.NOT_DOMAIN_SCOPED_resolveDomainFromGuildId(guildId);
  }
}
