import { ITakaroQuery, QueryBuilder, TakaroModel, getKnex } from '@takaro/db';
import { Model } from 'objection';
import { USER_TABLE_NAME, UserModel } from './user.js';
import { ITakaroRepo } from './base.js';
import { GuildCreateInputDTO, GuildOutputDTO, GuildUpdateDTO } from '../service/DiscordService.js';
import { errors, logger, traceableClass, ctx } from '@takaro/util';

const DISCORD_GUILDS_TABLE_NAME = 'discordGuilds';
const USER_ON_DISCORD_GUILD_TABLE_NAME = 'userOnDiscordGuild';

export class UserOnGuildModel extends TakaroModel {
  static tableName = USER_ON_DISCORD_GUILD_TABLE_NAME;

  userId!: string;
  discordGuildId!: string;

  hasManageServer: boolean;
}
export class DiscordGuildModel extends TakaroModel {
  static tableName = DISCORD_GUILDS_TABLE_NAME;

  name!: string;
  icon?: string | null;
  discordId: string;

  takaroEnabled: boolean;

  static get relationMappings() {
    return {
      users: {
        relation: Model.ManyToManyRelation,
        modelClass: UserModel,
        join: {
          from: `${DISCORD_GUILDS_TABLE_NAME}.id`,
          through: {
            from: `${USER_ON_DISCORD_GUILD_TABLE_NAME}.discordGuildId`,
            to: `${USER_ON_DISCORD_GUILD_TABLE_NAME}.userId`,
          },
          to: `${USER_TABLE_NAME}.id`,
        },
      },
      guildPermission: {
        relation: Model.HasOneRelation,
        modelClass: UserOnGuildModel,
        join: {
          from: `${DISCORD_GUILDS_TABLE_NAME}.id`,
          to: `${USER_ON_DISCORD_GUILD_TABLE_NAME}.discordGuildId`,
        },
      },
    };
  }
}

@traceableClass('repo:discord')
export class DiscordRepo extends ITakaroRepo<DiscordGuildModel, GuildOutputDTO, GuildCreateInputDTO, GuildUpdateDTO> {
  static async NOT_DOMAIN_SCOPED_resolveDomainFromGuildId(guildId: string): Promise<string | null> {
    const knex = await getKnex();
    const model = DiscordGuildModel.bindKnex(knex);
    const result = (await model
      .query()
      .select(`${DISCORD_GUILDS_TABLE_NAME}.domain`)
      .where(`${DISCORD_GUILDS_TABLE_NAME}.discordId`, guildId)
      .where(`${DISCORD_GUILDS_TABLE_NAME}.takaroEnabled`, true)) as {
      domain: string;
    }[];

    // Check if all domain IDs are the same
    // Otherwise, it means that the guild is associated with multiple domains
    if (result.length > 1 && !result.every((r) => r.domain === result[0].domain)) {
      logger('discord').warn(`POTENTIAL DOMAIN SCOPING ISSUE: ${guildId} has multiple domains associated with it. `);
      throw new errors.BadRequestError(
        'Could not resolve Takaro domain from guild ID, have you associated your guild with multiple Takaro domains?',
      );
    }

    return result[0]?.domain ?? null;
  }

  async getModel() {
    const knex = await this.getKnex();
    const model = DiscordGuildModel.bindKnex(knex);
    const userModel = UserOnGuildModel.bindKnex(knex);

    const query = ctx.transaction ? model.query(ctx.transaction) : model.query();

    const userQuery = ctx.transaction ? userModel.query(ctx.transaction) : userModel.query();

    return {
      model,
      query: query.modify('domainScoped', this.domainId),
      userModel,
      userQuery: userQuery.modify('domainScoped', this.domainId),
      knex,
    };
  }

  async find(filters: ITakaroQuery<GuildOutputDTO>) {
    const { query } = await this.getModel();
    const result = await new QueryBuilder<DiscordGuildModel, GuildOutputDTO>({
      ...filters,
    }).build(query);

    return {
      total: result.total,
      results: await Promise.all(result.results.map(async (guild) => new GuildOutputDTO(guild))),
    };
  }

  async findOne(id: string) {
    const { query } = await this.getModel();
    const data = await query.findById(id);

    if (!data) {
      throw new errors.NotFoundError(`User with id ${id} not found`);
    }

    return new GuildOutputDTO(data);
  }

  async create(data: GuildCreateInputDTO) {
    const { query } = await this.getModel();
    const item = await query
      .insert({
        discordId: data.discordId,
        name: data.name,
        domain: this.domainId,
        icon: data.icon,
      })
      .returning('*');
    return this.findOne(item.id);
  }

  async update(id: string, data: GuildUpdateDTO) {
    const { query } = await this.getModel();

    const item = await query
      .patchAndFetchById(id, {
        name: data.name,
        takaroEnabled: data.takaroEnabled,
        icon: data.icon,
      })
      .returning('*');
    return this.findOne(item.id);
  }

  async delete(id: string) {
    const { query } = await this.getModel();
    await query.deleteById(id);
    return true;
  }

  async setUserRelation(userId: string, guildId: string, hasManageServer: boolean) {
    const { userQuery } = await this.getModel();

    // Insert or update
    const item = await userQuery
      .insert({
        userId: userId,
        discordGuildId: guildId,
        hasManageServer,
        domain: this.domainId,
      })
      .onConflict(['userId', 'discordGuildId'])
      .merge()
      .returning('*');

    return item;
  }

  async getServersWithManagePermission(userId: string) {
    const { userQuery } = await this.getModel();
    const result = await userQuery
      .select(`${DISCORD_GUILDS_TABLE_NAME}.*`)
      .join(
        `${DISCORD_GUILDS_TABLE_NAME}`,
        `${DISCORD_GUILDS_TABLE_NAME}.id`,
        `${USER_ON_DISCORD_GUILD_TABLE_NAME}.discordGuildId`,
      )
      .where(`${USER_ON_DISCORD_GUILD_TABLE_NAME}.userId`, userId)
      .where(`${USER_ON_DISCORD_GUILD_TABLE_NAME}.hasManageServer`, true);

    return result;
  }
}
