import { Type, Exclude } from 'class-transformer';
import { ValidateNested, IsOptional, IsString, IsUUID, IsEnum } from 'class-validator';
import { ITakaroQuery } from '@takaro/db';
import { APIOutput, apiResponse } from '@takaro/http';
import { EntityOutputDTO, EntitiesService } from '../service/EntitiesService.js';
import { Body, Get, JsonController, Params, Post, Req, Res, UseBefore } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { ParamId } from '../lib/validators.js';
import { AuthService, AuthenticatedRequest } from '../service/AuthService.js';
import { PERMISSIONS } from '@takaro/auth';
import { Response } from 'express';
import { AllowedFilters, AllowedSearch } from './shared.js';

export class EntityOutputDTOAPI extends APIOutput<EntityOutputDTO> {
  @Type(() => EntityOutputDTO)
  @ValidateNested()
  declare data: EntityOutputDTO;
}

export class EntityOutputArrayDTOAPI extends APIOutput<EntityOutputDTO[]> {
  @ValidateNested({ each: true })
  @Type(() => EntityOutputDTO)
  declare data: EntityOutputDTO[];
}

class EntitySearchInputAllowedFilters extends AllowedFilters {
  @IsOptional()
  @IsString({ each: true })
  name!: string[];

  @IsOptional()
  @IsString({ each: true })
  code!: string[];

  @IsOptional()
  @IsEnum(['hostile', 'friendly', 'neutral'], { each: true })
  type!: string[];

  @IsOptional()
  @IsUUID(4, { each: true })
  gameserverId!: string[];
}

class EntitySearchInputAllowedSearch extends AllowedSearch {
  @IsOptional()
  @IsString({ each: true })
  name!: string[];
  @IsOptional()
  @IsString({ each: true })
  code!: string[];
  @IsOptional()
  @IsString({ each: true })
  description!: string[];
}

class EntitySearchInputDTO extends ITakaroQuery<EntitySearchInputAllowedFilters> {
  @ValidateNested()
  @Type(() => EntitySearchInputAllowedFilters)
  declare filters: EntitySearchInputAllowedFilters;

  @ValidateNested()
  @Type(() => EntitySearchInputAllowedSearch)
  declare search: EntitySearchInputAllowedSearch;

  @Exclude()
  declare extend?: string[];
}

@OpenAPI({
  security: [{ domainAuth: [] }],
})
@JsonController()
export class EntityController {
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_ENTITIES]))
  @ResponseSchema(EntityOutputArrayDTOAPI)
  @Post('/entities/search')
  async search(@Req() req: AuthenticatedRequest, @Res() res: Response, @Body() query: EntitySearchInputDTO) {
    const service = new EntitiesService(req.domainId);
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

  @Get('/entities/:id')
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_ENTITIES]))
  @ResponseSchema(EntityOutputDTOAPI)
  async findOne(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new EntitiesService(req.domainId);
    const entity = await service.findOne(params.id);
    return apiResponse(entity);
  }
}
