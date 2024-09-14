import { IsBoolean, IsISO8601, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { ITakaroQuery } from '@takaro/db';
import { APIOutput, apiResponse } from '@takaro/http';
import { AuthenticatedRequest, AuthService } from '../service/AuthService.js';
import { Body, Get, Post, JsonController, UseBefore, Req, Params, Res } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { Type } from 'class-transformer';
import { PogParam } from '../lib/validators.js';
import { PERMISSIONS } from '@takaro/auth';
import { Response } from 'express';
import {
  PlayerOnGameServerService,
  PlayerOnGameserverOutputDTO,
  PlayerOnGameserverOutputWithRolesDTO,
} from '../service/PlayerOnGameserverService.js';
import { onlyIfEconomyEnabledMiddleware } from '../middlewares/onlyIfEconomyEnabled.js';
import { AllowedFilters, RangeFilterCreatedAndUpdatedAt } from './shared.js';

export class PlayerOnGameserverOutputDTOAPI extends APIOutput<PlayerOnGameserverOutputWithRolesDTO> {
  @Type(() => PlayerOnGameserverOutputWithRolesDTO)
  @ValidateNested()
  declare data: PlayerOnGameserverOutputWithRolesDTO;
}

export class PlayerOnGameserverOutputArrayDTOAPI extends APIOutput<PlayerOnGameserverOutputWithRolesDTO[]> {
  @Type(() => PlayerOnGameserverOutputWithRolesDTO)
  @ValidateNested({ each: true })
  declare data: PlayerOnGameserverOutputWithRolesDTO[];
}

class PlayerOnGameServerSearchInputAllowedFilters extends AllowedFilters {
  @IsOptional()
  @IsString({ each: true })
  gameId!: string[];

  @IsUUID(4, { each: true })
  @IsOptional()
  gameServerId!: string[];

  @IsUUID(4, { each: true })
  @IsOptional()
  playerId!: string[];

  @IsOptional()
  @IsBoolean({ each: true })
  online!: boolean;
}

class PlayerOnGameServerSearchInputAllowedRangeFilter extends RangeFilterCreatedAndUpdatedAt {
  @IsOptional()
  @IsISO8601()
  lastSeen!: string;
}

class PlayerOnGameServerSearchInputDTO extends ITakaroQuery<PlayerOnGameserverOutputDTO> {
  @ValidateNested()
  @Type(() => PlayerOnGameServerSearchInputAllowedFilters)
  declare filters: PlayerOnGameServerSearchInputAllowedFilters;

  @ValidateNested()
  @Type(() => PlayerOnGameServerSearchInputAllowedFilters)
  declare search: PlayerOnGameServerSearchInputAllowedFilters;

  @ValidateNested()
  @Type(() => PlayerOnGameServerSearchInputAllowedRangeFilter)
  declare greaterThan: PlayerOnGameServerSearchInputAllowedRangeFilter;

  @ValidateNested()
  @Type(() => PlayerOnGameServerSearchInputAllowedRangeFilter)
  declare lessThan: PlayerOnGameServerSearchInputAllowedRangeFilter;
}

class PlayerOnGameServerSetCurrencyInputDTO {
  @IsNumber()
  currency!: number;
}

class ParamSenderReceiver {
  @IsUUID('4')
  gameServerId!: string;
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
    @Body() query: PlayerOnGameServerSearchInputDTO,
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
  @Get('/gameserver/:gameServerId/player/:playerId')
  async getOne(@Req() req: AuthenticatedRequest, @Params() params: PogParam) {
    const service = new PlayerOnGameServerService(req.domainId);
    return apiResponse(await service.getPog(params.playerId, params.gameServerId));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_PLAYERS]), onlyIfEconomyEnabledMiddleware)
  @ResponseSchema(PlayerOnGameserverOutputDTOAPI)
  @Post('/gameserver/:gameServerId/player/:playerId/currency')
  async setCurrency(
    @Req() req: AuthenticatedRequest,
    @Params() params: PogParam,
    @Body() body: PlayerOnGameServerSetCurrencyInputDTO,
  ) {
    const service = new PlayerOnGameServerService(req.domainId);
    const pog = await service.getPog(params.playerId, params.gameServerId);
    return apiResponse(await service.setCurrency(pog.id, body.currency));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_PLAYERS]), onlyIfEconomyEnabledMiddleware)
  @ResponseSchema(PlayerOnGameserverOutputDTOAPI)
  @Post('/gameserver/:gameServerId/player/:sender/:receiver/transfer')
  async transactBetweenPlayers(
    @Req() req: AuthenticatedRequest,
    @Params() params: ParamSenderReceiver,
    @Body() body: PlayerOnGameServerSetCurrencyInputDTO,
  ) {
    const service = new PlayerOnGameServerService(req.domainId);
    return apiResponse(await service.transact(params.sender, params.receiver, body.currency));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_PLAYERS]), onlyIfEconomyEnabledMiddleware)
  @ResponseSchema(PlayerOnGameserverOutputDTOAPI)
  @Post('/gameserver/:gameServerId/player/:playerId/add-currency')
  async addCurrency(
    @Req() req: AuthenticatedRequest,
    @Params() params: PogParam,
    @Body() body: PlayerOnGameServerSetCurrencyInputDTO,
  ) {
    const service = new PlayerOnGameServerService(req.domainId);
    const pog = await service.getPog(params.playerId, params.gameServerId);
    return apiResponse(await service.addCurrency(pog.id, body.currency));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_PLAYERS]), onlyIfEconomyEnabledMiddleware)
  @ResponseSchema(PlayerOnGameserverOutputDTOAPI)
  @Post('/gameserver/:gameServerId/player/:playerId/deduct-currency')
  async deductCurrency(
    @Req() req: AuthenticatedRequest,
    @Params() params: PogParam,
    @Body() body: PlayerOnGameServerSetCurrencyInputDTO,
  ) {
    const service = new PlayerOnGameServerService(req.domainId);
    const pog = await service.getPog(params.playerId, params.gameServerId);
    return apiResponse(await service.deductCurrency(pog.id, body.currency));
  }
}
