import { IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { ITakaroQuery } from '@takaro/db';
import { APIOutput, apiResponse } from '@takaro/http';
import { AuthenticatedRequest, AuthService } from '../service/AuthService.js';
import { Body, Get, Post, JsonController, UseBefore, Req, Params, Res } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { Type } from 'class-transformer';
import { ParamId } from '../lib/validators.js';
import { PERMISSIONS } from '@takaro/auth';
import { Response } from 'express';
import { PlayerOnGameServerService, PlayerOnGameserverOutputDTO } from '../service/PlayerOnGameserverService.js';
import { onlyIfEconomyEnabledMiddleware } from '../middlewares/onlyIfEconomyEnabled.js';

export class PlayerOnGameserverOutputDTOAPI extends APIOutput<PlayerOnGameserverOutputDTO> {
  @Type(() => PlayerOnGameserverOutputDTO)
  @ValidateNested()
  declare data: PlayerOnGameserverOutputDTO;
}

export class PlayerOnGameserverOutputArrayDTOAPI extends APIOutput<PlayerOnGameserverOutputDTO[]> {
  @Type(() => PlayerOnGameserverOutputDTO)
  @ValidateNested({ each: true })
  declare data: PlayerOnGameserverOutputDTO[];
}

class PlayerOnGameServerSearchInputAllowedFilters {
  @IsOptional()
  @IsUUID(4, { each: true })
  id!: string[];

  @IsOptional()
  @IsString({ each: true })
  gameId!: string;

  @IsUUID(4, { each: true })
  @IsOptional()
  gameServerId!: string;

  @IsUUID(4, { each: true })
  @IsOptional()
  playerId!: string;
}

class PlayerOnGameServerSearchInputDTO extends ITakaroQuery<PlayerOnGameServerSearchInputAllowedFilters> {
  @ValidateNested()
  @Type(() => PlayerOnGameServerSearchInputAllowedFilters)
  declare filters: PlayerOnGameServerSearchInputAllowedFilters;

  @ValidateNested()
  @Type(() => PlayerOnGameServerSearchInputAllowedFilters)
  declare search: PlayerOnGameServerSearchInputAllowedFilters;
}

class PlayerOnGameServerSetCurrencyInputDTO {
  @IsNumber()
  currency!: number;
}

class ParamSenderReceiver {
  @IsUUID(4)
  sender!: string;

  @IsUUID(4)
  receiver!: string;
}

@OpenAPI({
  security: [{ domainAuth: [] }],
})
@JsonController()
export class PlayerOnGameServerController {
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_PLAYERS]))
  @ResponseSchema(PlayerOnGameserverOutputArrayDTOAPI)
  @Post('/gameserver/player/search')
  async search(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
    @Body() query: PlayerOnGameServerSearchInputDTO
  ) {
    const service = new PlayerOnGameServerService(req.domainId);
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

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_PLAYERS]))
  @ResponseSchema(PlayerOnGameserverOutputDTOAPI)
  @Get('/gameserver/player/:id')
  async getOne(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new PlayerOnGameServerService(req.domainId);
    return apiResponse(await service.findOne(params.id));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_PLAYERS]), onlyIfEconomyEnabledMiddleware)
  @ResponseSchema(PlayerOnGameserverOutputDTOAPI)
  @Post('/gameserver/player/:id/currency')
  async setCurrency(
    @Req() req: AuthenticatedRequest,
    @Params() params: ParamId,
    @Body() body: PlayerOnGameServerSetCurrencyInputDTO
  ) {
    const service = new PlayerOnGameServerService(req.domainId);
    return apiResponse(await service.setCurrency(params.id, body.currency));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_PLAYERS]), onlyIfEconomyEnabledMiddleware)
  @ResponseSchema(PlayerOnGameserverOutputDTOAPI)
  @Post('/gameserver/player/:sender/:receiver/transfer')
  async transactBetweenPlayers(
    @Req() req: AuthenticatedRequest,
    @Params() params: ParamSenderReceiver,
    @Body() body: PlayerOnGameServerSetCurrencyInputDTO
  ) {
    const service = new PlayerOnGameServerService(req.domainId);
    return apiResponse(await service.transact(params.sender, params.receiver, body.currency));
  }
}
