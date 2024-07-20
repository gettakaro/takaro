import { UseBefore, JsonController, Body, Req, Res, Post, Params, Put, Get } from 'routing-controllers';
import { AuthService, AuthenticatedRequest } from '../service/AuthService.js';
import { DiscordService, GuildOutputDTO, SendMessageInputDTO } from '../service/DiscordService.js';
import { Response } from 'express';
import { APIOutput, apiResponse } from '@takaro/http';
import { ITakaroQuery } from '@takaro/db';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, Length, ValidateNested } from 'class-validator';
import { ResponseSchema } from 'routing-controllers-openapi';
import { TakaroDTO } from '@takaro/util';
import { ParamId } from '../lib/validators.js';
import { discordBot } from '../lib/DiscordBot.js';

class GuildSearchInputAllowedFilters {
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

class GuildSearchInputDTO extends ITakaroQuery<GuildOutputDTO> {
  @ValidateNested()
  @Type(() => GuildSearchInputAllowedFilters)
  declare filters: GuildSearchInputAllowedFilters;

  @ValidateNested()
  @Type(() => GuildSearchInputAllowedFilters)
  declare search: GuildSearchInputAllowedFilters;
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

@UseBefore(AuthService.getAuthMiddleware([]))
@JsonController()
export class DiscordController {
  @Post('/discord/guilds/search')
  @ResponseSchema(GuildOutputArrayDTOAPI)
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
  @ResponseSchema(APIOutput)
  async sendMessage(
    @Req() req: AuthenticatedRequest,
    @Res() _res: Response,
    @Params() params: DiscordParamId,
    @Body() body: SendMessageInputDTO
  ) {
    const service = new DiscordService(req.domainId);
    await service.sendMessage(params.id, body);
    return apiResponse();
  }

  @Put('/discord/guilds/:id')
  @ResponseSchema(GuildOutputDTOAPI)
  async updateGuild(
    @Req() req: AuthenticatedRequest,
    @Res() _res: Response,
    @Params() params: ParamId,
    @Body() body: GuildApiUpdateDTO
  ) {
    const service = new DiscordService(req.domainId);
    const updated = await service.update(params.id, body);
    return apiResponse(updated);
  }

  @Get('/discord/invite')
  @ResponseSchema(DiscordInviteOutputDTO)
  async getInvite() {
    return apiResponse({
      botInvite: discordBot.inviteLink,
      devServer: 'https://catalysm.net/discord',
    });
  }
}
