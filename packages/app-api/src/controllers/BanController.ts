import { IsBoolean, IsISO8601, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { ITakaroQuery } from '@takaro/db';
import { APIOutput, apiResponse } from '@takaro/http';
import { BanCreateDTO, BanOutputDTO, BanUpdateDTO } from '../service/Ban/dto.js';
import { AuthenticatedRequest, AuthService } from '../service/AuthService.js';
import { Body, Get, Post, JsonController, UseBefore, Req, Params, Res, Put } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { ParamId } from '../lib/validators.js';
import { PERMISSIONS } from '@takaro/auth';
import { Response } from 'express';
import { AllowedFilters, RangeFilterCreatedAndUpdatedAt } from './shared.js';
import { Type } from 'class-transformer';
import { BanService } from '../service/Ban/index.js';

export class BanOutputDTOAPI extends APIOutput<BanOutputDTO> {
  @Type(() => BanOutputDTO)
  @ValidateNested()
  declare data: BanOutputDTO;
}

export class BanOutputArrayDTOAPI extends APIOutput<BanOutputDTO[]> {
  @ValidateNested({ each: true })
  @Type(() => BanOutputDTO)
  declare data: BanOutputDTO[];
}

class BanSearchInputAllowedFilters extends AllowedFilters {
  @IsOptional()
  @IsUUID(4, { each: true })
  gameServerId: string[];
  @IsOptional()
  @IsUUID(4, { each: true })
  playerId: string[];
  @IsOptional()
  @IsBoolean({ each: true })
  takaroManaged: boolean[];
  @IsOptional()
  @IsBoolean({ each: true })
  isGlobal: boolean[];
}

class BanSearchInputAllowedRangeFilter extends RangeFilterCreatedAndUpdatedAt {
  @IsOptional()
  @IsISO8601()
  until?: string | undefined;
}

export class BanSearchInputDTO extends ITakaroQuery<BanOutputDTO> {
  @ValidateNested()
  @Type(() => BanSearchInputAllowedFilters)
  declare filters: BanSearchInputAllowedFilters;
  @ValidateNested()
  @Type(() => BanSearchInputAllowedFilters)
  declare search: BanSearchInputAllowedFilters;
  @ValidateNested()
  @Type(() => BanSearchInputAllowedRangeFilter)
  declare greaterThan: BanSearchInputAllowedRangeFilter;
  @ValidateNested()
  @Type(() => BanSearchInputAllowedRangeFilter)
  declare lessThan: Partial<BanSearchInputAllowedRangeFilter>;
}

@OpenAPI({
  security: [{ domainAuth: [] }],
})
@JsonController()
export class BanController {
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_PLAYERS]))
  @ResponseSchema(BanOutputArrayDTOAPI)
  @Post('/ban/search')
  async search(@Req() req: AuthenticatedRequest, @Res() res: Response, @Body() query: BanSearchInputDTO) {
    const service = new BanService(req.domainId);
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
  @ResponseSchema(BanOutputDTOAPI)
  @Get('/ban/:id')
  async getOne(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new BanService(req.domainId);
    return apiResponse(await service.findOne(params.id));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_PLAYERS]))
  @ResponseSchema(BanOutputDTOAPI)
  @Post('/ban')
  async create(@Req() req: AuthenticatedRequest, @Body() data: BanCreateDTO) {
    const service = new BanService(req.domainId);
    // Bans created via API are always takaro managed
    data.takaroManaged = true;
    return apiResponse(await service.create(data));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_PLAYERS]))
  @ResponseSchema(BanOutputDTOAPI)
  @Put('/ban/:id')
  async update(@Req() req: AuthenticatedRequest, @Params() params: ParamId, @Body() data: BanUpdateDTO) {
    const service = new BanService(req.domainId);
    // Updating an existing ban via API makes it takaro managed
    data.takaroManaged = true;
    return apiResponse(await service.update(params.id, data));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_PLAYERS]))
  @ResponseSchema(APIOutput)
  @Post('/ban/:id/delete')
  async delete(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new BanService(req.domainId);
    await service.delete(params.id);
    return apiResponse();
  }
}