import { IsBoolean, IsISO8601, IsNumber, IsOptional, IsString, IsUUID, ValidateNested, IsEnum } from 'class-validator';
import { ITakaroQuery } from '@takaro/db';
import { APIOutput, apiResponse } from '@takaro/http';
import { PlayerService } from '../service/Player/index.js';
import { AuthenticatedRequest, AuthService } from '../service/AuthService.js';
import { Body, Get, Post, JsonController, UseBefore, Req, Params, Res, Delete } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { Type } from 'class-transformer';
import { PERMISSIONS } from '@takaro/auth';
import { Response } from 'express';
import { TakaroDTO, errors } from '@takaro/util';
import { UserService } from '../service/User/index.js';
import { PlayerOnGameserverOutputArrayDTOAPI } from './PlayerOnGameserverController.js';
import { ParamId, ParamIdAndRoleId } from '../lib/validators.js';
import { AllowedFilters, AllowedSearch, RangeFilterCreatedAndUpdatedAt } from './shared.js';
import { PlayerOutputDTO, PlayerOutputWithRolesDTO } from '../service/Player/dto.js';

export class PlayerOutputDTOAPI extends APIOutput<PlayerOutputWithRolesDTO> {
  @Type(() => PlayerOutputWithRolesDTO)
  @ValidateNested()
  declare data: PlayerOutputWithRolesDTO;
}

export class PlayerOutputArrayDTOAPI extends APIOutput<PlayerOutputDTO[]> {
  @ValidateNested({ each: true })
  @Type(() => PlayerOutputDTO)
  declare data: PlayerOutputDTO[];
}

export class PlayerOutputWithRolesDTOAPI extends APIOutput<PlayerOutputWithRolesDTO> {
  @Type(() => PlayerOutputWithRolesDTO)
  @ValidateNested()
  declare data: PlayerOutputWithRolesDTO;
}

class PlayerSearchInputAllowedFilters extends AllowedFilters {
  @IsOptional()
  @IsString({ each: true })
  name?: string[];
  @IsOptional()
  @IsString({ each: true })
  steamId?: string[];
  @IsOptional()
  @IsString({ each: true })
  epicOnlineServicesId?: string[];
  @IsOptional()
  @IsString({ each: true })
  xboxLiveId?: string[];
  @IsOptional()
  @IsString({ each: true })
  platformId?: string[];
  @IsOptional()
  @IsBoolean({ each: true })
  steamCommunityBanned?: boolean[];
  @IsOptional()
  @IsBoolean({ each: true })
  steamVacBanned?: boolean[];
  @IsOptional()
  @IsUUID(4, { each: true })
  roleId?: string[] | undefined;
}

class PlayerSearchInputAllowedSearch extends AllowedSearch {
  @IsOptional()
  @IsString({ each: true })
  name?: string[];
  @IsOptional()
  @IsString({ each: true })
  steamId?: string[];
  @IsOptional()
  @IsString({ each: true })
  platformId?: string[];
}

class PlayerSearchInputAllowedRangeFilter extends RangeFilterCreatedAndUpdatedAt {
  @IsOptional()
  @IsISO8601()
  steamAccountCreated?: string | undefined;
  @IsOptional()
  @IsNumber()
  steamsDaysSinceLastBan?: number | undefined;
  @IsOptional()
  @IsNumber()
  steamNumberOfVACBans?: number | undefined;
  @IsOptional()
  @IsNumber()
  steamLevel?: number | undefined;
  @IsOptional()
  @IsNumber()
  playtimeSeconds?: number | undefined;
}

const extendOptions = ['playerOnGameServers', 'roles', 'gameServers', 'roleAssignments'];
type PlayerExtendOptions = (typeof extendOptions)[number];

export class PlayerSearchInputDTO extends ITakaroQuery<PlayerSearchInputAllowedFilters> {
  @ValidateNested()
  @Type(() => PlayerSearchInputAllowedFilters)
  declare filters: PlayerSearchInputAllowedFilters;
  @ValidateNested()
  @Type(() => PlayerSearchInputAllowedSearch)
  declare search: PlayerSearchInputAllowedSearch;
  @ValidateNested()
  @Type(() => PlayerSearchInputAllowedRangeFilter)
  declare greaterThan: PlayerSearchInputAllowedRangeFilter;
  @ValidateNested()
  @Type(() => PlayerSearchInputAllowedRangeFilter)
  declare lessThan: Partial<PlayerSearchInputAllowedRangeFilter>;
  @IsOptional()
  @IsEnum(extendOptions, { each: true })
  declare extend?: PlayerExtendOptions[];
}

class PlayerRoleAssignChangeDTO {
  @IsUUID()
  @IsOptional()
  gameServerId?: string;

  @IsOptional()
  @IsISO8601()
  expiresAt?: string;
}

class PlayerMeOutputDTO extends TakaroDTO<PlayerMeOutputDTO> {
  @ValidateNested()
  @Type(() => PlayerOutputWithRolesDTO)
  player: PlayerOutputWithRolesDTOAPI;
  @ValidateNested({ each: true })
  @Type(() => PlayerOnGameserverOutputArrayDTOAPI)
  pogs: PlayerOnGameserverOutputArrayDTOAPI[];
}

@OpenAPI({
  security: [{ domainAuth: [] }],
})
@JsonController()
export class PlayerController {
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_PLAYERS]))
  @ResponseSchema(PlayerOutputArrayDTOAPI)
  @OpenAPI({
    requestBody: {
      content: {
        'application/json': {
          examples: {
            withRelations: {
              summary: 'Search with related data',
              value: {
                extend: ['playerOnGameServers'],
                page: 1,
                limit: 10,
              },
            },
            recentVACbans: {
              summary: 'Recently VAC banned players',
              value: { lessThan: { steamsDaysSinceLastBan: 365 } },
            },
          },
        },
      },
    },
  })
  @Post('/player/search')
  async search(@Req() req: AuthenticatedRequest, @Res() res: Response, @Body() query: PlayerSearchInputDTO) {
    const service = new PlayerService(req.domainId);
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

  @UseBefore(AuthService.getAuthMiddleware([]))
  @ResponseSchema(PlayerMeOutputDTO)
  @OpenAPI({
    summary: 'Get current player',
    description:
      'Get the player that is currently authenticated. This is a low-privilege route, returning limited data.',
  })
  @Get('/player/me')
  async getMe(@Req() req: AuthenticatedRequest) {
    const service = new PlayerService(req.domainId);
    const userService = new UserService(req.domainId);
    const user = await userService.findOne(req.user.id);
    if (!user.playerId) throw new errors.NotFoundError('Player not found, please link your player account.');
    const res = await service.resolveFromId(user.playerId);
    return apiResponse(new PlayerMeOutputDTO(res));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_PLAYERS]))
  @ResponseSchema(PlayerOutputWithRolesDTOAPI)
  @Get('/player/:id')
  async getOne(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new PlayerService(req.domainId);
    return apiResponse(await service.findOne(params.id));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_PLAYERS, PERMISSIONS.MANAGE_ROLES]))
  @Post('/player/:id/role/:roleId')
  @ResponseSchema(APIOutput)
  async assignRole(
    @Req() req: AuthenticatedRequest,
    @Params() params: ParamIdAndRoleId,
    @Body() data: PlayerRoleAssignChangeDTO,
  ) {
    const service = new PlayerService(req.domainId);

    await service.assignRole(params.roleId, params.id, data.gameServerId, data.expiresAt);

    return apiResponse();
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_PLAYERS, PERMISSIONS.MANAGE_ROLES]))
  @Delete('/player/:id/role/:roleId')
  @ResponseSchema(APIOutput)
  async removeRole(
    @Req() req: AuthenticatedRequest,
    @Params() params: ParamIdAndRoleId,
    @Body() data: PlayerRoleAssignChangeDTO,
  ) {
    const service = new PlayerService(req.domainId);
    await service.removeRole(params.roleId, params.id, data.gameServerId);
    return apiResponse();
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_PLAYERS]))
  @Delete('/player/:id')
  @ResponseSchema(APIOutput)
  async delete(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new PlayerService(req.domainId);
    await service.delete(params.id);
    return apiResponse();
  }
}
