import {
  UseBefore,
  JsonController,
  Body,
  Req,
  Res,
  Post,
  Params,
  Put,
} from 'routing-controllers';
import { AuthService, AuthenticatedRequest } from '../service/AuthService.js';
import {
  DiscordService,
  GuildOutputDTO,
  SendMessageInputDTO,
} from '../service/DiscordService.js';
import { Response } from 'express';
import { APIOutput, apiResponse } from '@takaro/http';
import { ITakaroQuery } from '@takaro/db';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { ResponseSchema } from 'routing-controllers-openapi';
import { TakaroDTO } from '@takaro/util';
import { ParamId } from '../lib/validators.js';

class GuildSearchInputAllowedFilters {
  @IsOptional()
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  discordId!: string;
}

class GuildSearchInputDTO extends ITakaroQuery<GuildOutputDTO> {
  @ValidateNested()
  @Type(() => GuildSearchInputAllowedFilters)
  declare filters: GuildSearchInputAllowedFilters;
}

class DiscordParamId {
  @IsString()
  @Length(18, 18)
  id!: string;
}

class GuildOutputDTOAPI extends APIOutput<GuildOutputDTO> {
  @Type(() => GuildOutputDTO)
  @ValidateNested()
  declare data: GuildOutputDTO;
}

class GuildApiUpdateDTO extends TakaroDTO<GuildApiUpdateDTO> {
  @IsOptional()
  @IsBoolean()
  takaroEnabled!: boolean;
}

@UseBefore(AuthService.getAuthMiddleware([]))
@JsonController()
export class DiscordController {
  @Post('/discord/guilds/search')
  @ResponseSchema(GuildOutputDTOAPI, { isArray: true })
  async search(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
    @Body() query: GuildSearchInputDTO
  ) {
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
    @Res() res: Response,
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
    @Res() res: Response,
    @Params() params: ParamId,
    @Body() body: GuildApiUpdateDTO
  ) {
    const service = new DiscordService(req.domainId);
    const updated = await service.update(params.id, body);
    return apiResponse(updated);
  }
}
