import { TakaroDTO, errors, ctx } from '@takaro/util';
import { DiscordGuildModel, DiscordRepo } from '../db/discord.js';
import { TakaroService } from './Base.js';
import { ITakaroQuery } from '@takaro/db';
import { RESTGetAPICurrentUserGuildsResult } from 'discord-api-types/v10';
import { PermissionsBitField } from 'discord.js';
import { discordBot } from '../lib/DiscordBot.js';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';

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
}

export class GuildCreateInputDTO extends TakaroDTO<GuildCreateInputDTO> {
  name!: string;
  discordId?: string;
}

export class GuildUpdateDTO extends TakaroDTO<GuildUpdateDTO> {
  @IsString()
  @IsOptional()
  name?: string;
  @IsBoolean()
  @IsOptional()
  takaroEnabled?: boolean;
}

export class SendMessageInputDTO extends TakaroDTO<SendMessageInputDTO> {
  @IsString()
  message!: string;
}

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
    const userId = ctx.data.user;
    if (!userId) throw new errors.ForbiddenError();
    const serversWithPermission =
      await this.repo.getServersWithManagePermission(userId);

    if (!serversWithPermission.find((server) => server.id === id)) {
      this.log.warn(
        `User ${userId} tried to update guild ${id} without permission`
      );
      throw new errors.ForbiddenError();
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
  async syncGuilds(guilds: RESTGetAPICurrentUserGuildsResult, userId: string) {
    const existingDbGuilds = await this.repo.find({
      limit: 3000,
    });

    const removedGuilds = existingDbGuilds.results.filter((dbGuild) => {
      return !guilds.find((guild) => guild.id === dbGuild.discordId);
    });
    const addedGuilds = guilds.filter((guild) => {
      return !existingDbGuilds.results.find(
        (dbGuild) => dbGuild.discordId === guild.id
      );
    });

    this.log.info(
      `Syncing guilds: ${addedGuilds.length} added, ${removedGuilds.length} removed`
    );

    await Promise.all(removedGuilds.map((guild) => this.delete(guild.id)));
    await Promise.all(
      addedGuilds.map(async (guild) =>
        this.create(
          await new GuildCreateInputDTO().construct({
            discordId: guild.id,
            name: guild.name,
          })
        )
      )
    );

    const newDbGuilds = await this.repo.find({
      limit: 3000,
    });

    await Promise.all(
      guilds.map((guild) => {
        const permissions = new PermissionsBitField(BigInt(guild.permissions));
        const dbGuild = newDbGuilds.results.find(
          (dbGuild) => dbGuild.discordId === guild.id
        );
        if (!dbGuild) return;
        return this.repo.setUserRelation(
          userId,
          dbGuild.id,
          permissions.has(PermissionsBitField.Flags.ManageGuild)
        );
      })
    );
  }

  async sendMessage(channelId: string, message: SendMessageInputDTO) {
    const channel = await discordBot.getChannel(channelId);

    const guild = await this.find({ filters: { discordId: channel.guildId } });

    if (!guild.results.length) {
      throw new errors.BadRequestError(
        `Guild not found for channel ${channelId}`
      );
    }

    if (!guild.results[0].takaroEnabled) {
      throw new errors.BadRequestError(
        `Takaro not enabled for guild ${guild.results[0].id}`
      );
    }

    await discordBot.sendMessage(channelId, message.message);
  }
}
