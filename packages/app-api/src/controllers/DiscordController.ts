import { UseBefore, JsonController, Body, Req, Res, Post, Params, Put, Get } from 'routing-controllers';
import { AuthService, AuthenticatedRequest } from '../service/AuthService.js';
import {
  DiscordService,
  GuildOutputDTO,
  SendMessageInputDTO,
  DiscordRoleOutputDTO,
  DiscordChannelOutputDTO,
} from '../service/DiscordService.js';
import { Response } from 'express';
import { APIOutput, apiResponse } from '@takaro/http';
import { ITakaroQuery } from '@takaro/db';
import { Type, Exclude } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, Length, ValidateNested } from 'class-validator';
import { ResponseSchema, OpenAPI } from 'routing-controllers-openapi';
import { TakaroDTO } from '@takaro/util';
import { ParamId } from '../lib/validators.js';
import { PERMISSIONS } from '@takaro/auth';
import { discordBot } from '../lib/DiscordBot.js';
import { AllowedFilters, AllowedSearch } from './shared.js';

class GuildSearchInputAllowedFilters extends AllowedFilters {
  @IsOptional()
  @IsString({ each: true })
  name!: string[];

  @IsOptional()
  @IsString({ each: true })
  discordId!: string[];

  @IsOptional()
  @IsBoolean({ each: true })
  takaroEnabled!: boolean[];
}

class GuildSearchInputAllowedSearch extends AllowedSearch {
  @IsOptional()
  @IsString({ each: true })
  name!: string[];
}

class GuildSearchInputDTO extends ITakaroQuery<GuildOutputDTO> {
  @ValidateNested()
  @Type(() => GuildSearchInputAllowedFilters)
  declare filters: GuildSearchInputAllowedFilters;

  @ValidateNested()
  @Type(() => GuildSearchInputAllowedSearch)
  declare search: GuildSearchInputAllowedSearch;

  @Exclude()
  declare extend?: string[];
}

class DiscordParamId {
  @IsString()
  @Length(16, 20)
  id!: string;
}

class GuildOutputDTOAPI extends APIOutput<GuildOutputDTO> {
  @Type(() => GuildOutputDTO)
  @ValidateNested()
  declare data: GuildOutputDTO;
}

class GuildOutputArrayDTOAPI extends APIOutput<GuildOutputDTO[]> {
  @Type(() => GuildOutputDTO)
  @ValidateNested({ each: true })
  declare data: GuildOutputDTO[];
}

class GuildApiUpdateDTO extends TakaroDTO<GuildApiUpdateDTO> {
  @IsOptional()
  @IsBoolean()
  takaroEnabled!: boolean;
}

class InviteOutputDTO extends TakaroDTO<InviteOutputDTO> {
  @IsString()
  botInvite!: string;
  @IsString()
  devServer!: string;
}
class DiscordInviteOutputDTO extends APIOutput<InviteOutputDTO> {
  @Type(() => InviteOutputDTO)
  @ValidateNested()
  declare data: InviteOutputDTO;
}

class DiscordRoleOutputArrayDTOAPI extends APIOutput<DiscordRoleOutputDTO[]> {
  @Type(() => DiscordRoleOutputDTO)
  @ValidateNested({ each: true })
  declare data: DiscordRoleOutputDTO[];
}

class DiscordChannelOutputArrayDTOAPI extends APIOutput<DiscordChannelOutputDTO[]> {
  @Type(() => DiscordChannelOutputDTO)
  @ValidateNested({ each: true })
  declare data: DiscordChannelOutputDTO[];
}

@JsonController()
export class DiscordController {
  @Post('/discord/guilds/search')
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.VIEW_DISCORD_INFO]))
  @ResponseSchema(GuildOutputArrayDTOAPI)
  @OpenAPI({
    summary: 'Search Discord guilds',
    description:
      'Search for Discord guilds (servers) that the bot has access to. Supports filtering by name, Discord ID, and whether Takaro is enabled.',
    requestBody: {
      content: {
        'application/json': {
          examples: {
            searchByName: {
              summary: 'Search guilds by name',
              value: {
                search: {
                  name: ['Gaming'],
                },
              },
            },
            filterByTakaroEnabled: {
              summary: 'Get all Takaro-enabled guilds',
              value: {
                filters: {
                  takaroEnabled: [true],
                },
              },
            },
            paginatedSearch: {
              summary: 'Get all guilds with pagination',
              value: {
                page: 0,
                limit: 10,
              },
            },
          },
        },
      },
    },
  })
  async search(@Req() req: AuthenticatedRequest, @Res() res: Response, @Body() query: GuildSearchInputDTO) {
    const service = new DiscordService(req.domainId);
    const result = await service.find({
      ...query,
      page: res.locals.page,
      limit: res.locals.limit,
    });
    return apiResponse(result.results, {
      meta: { total: result.total },
      req,
      res,
    });
  }

  @Post('/discord/channels/:id/message')
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.SEND_DISCORD_MESSAGE]))
  @ResponseSchema(APIOutput)
  @OpenAPI({
    summary: 'Send message to Discord channel',
    description:
      'Send a text message or rich embed to a specific Discord channel. Requires the bot to have appropriate permissions in the channel.',
    requestBody: {
      content: {
        'application/json': {
          examples: {
            simpleMessage: {
              summary: 'Simple text message',
              value: {
                message: 'Hello Discord! This is a simple text message.',
              },
            },
            richEmbed: {
              summary: 'Rich embed with server status',
              value: {
                embed: {
                  title: 'Server Status Update',
                  description: 'The game server is now online and ready for players!',
                  color: 65280,
                  fields: [
                    {
                      name: 'Server',
                      value: 'US-East-1',
                      inline: true,
                    },
                    {
                      name: 'Players',
                      value: '12/50',
                      inline: true,
                    },
                  ],
                  footer: {
                    text: 'Last updated',
                  },
                  timestamp: '2024-01-15T10:30:00Z',
                },
              },
            },
            playerNotification: {
              summary: 'Player event notification',
              value: {
                embed: {
                  title: 'Player Joined',
                  description: 'A new player has joined the server',
                  color: 3447003,
                  author: {
                    name: 'JohnDoe123',
                    iconUrl: 'https://example.com/avatar.png',
                  },
                  fields: [
                    {
                      name: 'Steam ID',
                      value: '76561198123456789',
                      inline: false,
                    },
                  ],
                  thumbnail: {
                    url: 'https://example.com/player-icon.png',
                  },
                },
              },
            },
            combinedMessageEmbed: {
              summary: 'Message with embed for server restart',
              value: {
                message: '@everyone Server restart in 5 minutes!',
                embed: {
                  title: 'Scheduled Maintenance',
                  description: 'The server will be restarting for scheduled maintenance.',
                  color: 16776960,
                  fields: [
                    {
                      name: 'Downtime',
                      value: 'Approximately 10 minutes',
                    },
                    {
                      name: 'Reason',
                      value: 'Performance updates and bug fixes',
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
  })
  async sendMessage(
    @Req() req: AuthenticatedRequest,
    @Res() _res: Response,
    @Params() params: DiscordParamId,
    @Body() body: SendMessageInputDTO,
  ) {
    const service = new DiscordService(req.domainId);
    await service.sendMessage(params.id, body);
    return apiResponse();
  }

  @Put('/discord/guilds/:id')
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_SETTINGS]))
  @ResponseSchema(GuildOutputDTOAPI)
  @OpenAPI({
    summary: 'Update guild settings',
    description: 'Update Takaro-specific settings for a Discord guild, such as enabling or disabling Takaro features.',
    requestBody: {
      content: {
        'application/json': {
          examples: {
            enableTakaro: {
              summary: 'Enable Takaro for guild',
              value: {
                takaroEnabled: true,
              },
            },
            disableTakaro: {
              summary: 'Disable Takaro for guild',
              value: {
                takaroEnabled: false,
              },
            },
          },
        },
      },
    },
  })
  async updateGuild(
    @Req() req: AuthenticatedRequest,
    @Res() _res: Response,
    @Params() params: ParamId,
    @Body() body: GuildApiUpdateDTO,
  ) {
    const service = new DiscordService(req.domainId);
    const updated = await service.update(params.id, body);
    return apiResponse(updated);
  }

  @Get('/discord/guilds/:id/roles')
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.VIEW_DISCORD_INFO]))
  @ResponseSchema(DiscordRoleOutputArrayDTOAPI)
  @OpenAPI({
    summary: 'Get guild roles',
    description:
      'Retrieve all roles available in a specific Discord guild. Useful for role-based integrations and permissions mapping.',
  })
  async getRoles(@Req() req: AuthenticatedRequest, @Res() _res: Response, @Params() params: DiscordParamId) {
    const service = new DiscordService(req.domainId);
    const roles = await service.getRoles(params.id);
    return apiResponse(roles);
  }

  @Get('/discord/guilds/:id/channels')
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.VIEW_DISCORD_INFO]))
  @ResponseSchema(DiscordChannelOutputArrayDTOAPI)
  @OpenAPI({
    summary: 'Get guild channels',
    description:
      'Retrieve all channels (text, voice, etc.) in a specific Discord guild. Useful for selecting channels for notifications or commands.',
  })
  async getChannels(@Req() req: AuthenticatedRequest, @Res() _res: Response, @Params() params: DiscordParamId) {
    const service = new DiscordService(req.domainId);
    const channels = await service.getChannels(params.id);
    return apiResponse(channels);
  }

  @Get('/discord/invite')
  @ResponseSchema(DiscordInviteOutputDTO)
  @OpenAPI({
    summary: 'Get bot invite links',
    description:
      'Get the invite link to add the Takaro bot to a Discord server, along with the developer Discord server link.',
  })
  getInvite() {
    return apiResponse({
      botInvite: discordBot.inviteLink,
      devServer: 'https://catalysm.net/discord',
    });
  }
}
