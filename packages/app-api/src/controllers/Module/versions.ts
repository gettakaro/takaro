import { IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { ITakaroQuery } from '@takaro/db';
import { APIOutput, apiResponse } from '@takaro/http';
import { ModuleService } from '../../service/Module/index.js';
import { AuthenticatedRequest, AuthService } from '../../service/AuthService.js';
import { Body, Get, Post, JsonController, UseBefore, Req, Params, Res } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { Type, Exclude } from 'class-transformer';
import { ParamId } from '../../lib/validators.js';
import { PERMISSIONS } from '@takaro/auth';
import { Response } from 'express';
import { AllowedFilters, AllowedSearch, RangeFilterCreatedAndUpdatedAt } from '../shared.js';
import { ModuleVersionCreateAPIDTO, ModuleVersionOutputDTO } from '../../service/Module/dto.js';

export class ModuleVersionOutputDTOAPI extends APIOutput<ModuleVersionOutputDTO> {
  @Type(() => ModuleVersionOutputDTO)
  @ValidateNested()
  declare data: ModuleVersionOutputDTO;
}

export class ModuleVersionOutputArrayDTOAPI extends APIOutput<ModuleVersionOutputDTO[]> {
  @ValidateNested({ each: true })
  @Type(() => ModuleVersionOutputDTO)
  declare data: ModuleVersionOutputDTO[];
}

class ModuleVersionSearchInputAllowedFilters extends AllowedFilters {
  @IsOptional()
  @IsString({ each: true })
  version: string[];
  @IsOptional()
  @IsUUID('4', { each: true })
  moduleId: string[];
  @IsOptional()
  @IsString({ each: true })
  tag: string[];
}

class ModuleVersionSearchInputAllowedSearch extends AllowedSearch {
  @IsOptional()
  @IsString({ each: true })
  tag: string[];
}

class ModuleVersionSearchInputDTO extends ITakaroQuery<ModuleVersionSearchInputAllowedFilters> {
  @ValidateNested()
  @Type(() => ModuleVersionSearchInputAllowedFilters)
  declare filters: ModuleVersionSearchInputAllowedFilters;
  @ValidateNested()
  @Type(() => ModuleVersionSearchInputAllowedSearch)
  declare search: ModuleVersionSearchInputAllowedSearch;
  @ValidateNested()
  @Type(() => RangeFilterCreatedAndUpdatedAt)
  declare greaterThan: RangeFilterCreatedAndUpdatedAt;
  @ValidateNested()
  @Type(() => RangeFilterCreatedAndUpdatedAt)
  declare lessThan: RangeFilterCreatedAndUpdatedAt;

  @Exclude()
  declare extend?: string[];
}

@OpenAPI({
  security: [{ domainAuth: [] }],
  tags: ['Module'],
})
@JsonController('/module/version')
export class ModuleVersionController {
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_MODULES]))
  @ResponseSchema(ModuleVersionOutputArrayDTOAPI)
  @OpenAPI({
    summary: 'Search module versions',
    requestBody: {
      content: {
        'application/json': {
          examples: {
            withRelations: {
              summary: 'Search with related data',
              value: {
                extend: ['module'],
                page: 1,
                limit: 10,
              },
            },
          },
        },
      },
    },
  })
  @Post('/search')
  async searchVersions(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
    @Body() query: ModuleVersionSearchInputDTO,
  ) {
    const service = new ModuleService(req.domainId);
    const result = await service.findVersions({
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

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_MODULES]))
  @ResponseSchema(ModuleVersionOutputDTOAPI)
  @OpenAPI({
    summary: 'Get one version',
  })
  @Get('/:id')
  async getModuleVersion(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new ModuleService(req.domainId);
    const res = await service.findOneVersion(params.id);
    return apiResponse(res);
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_MODULES]))
  @ResponseSchema(ModuleVersionOutputDTOAPI)
  @OpenAPI({
    summary: 'Tag a new version',
    description:
      'Creates a new version of a module, copying all config (commands,hooks,cronjobs,...) from the "latest" version into a new, immutable version',
  })
  @Post('/')
  async tagVersion(@Req() req: AuthenticatedRequest, @Body() data: ModuleVersionCreateAPIDTO) {
    const service = new ModuleService(req.domainId);
    const result = await service.tagVersion(data.moduleId, data.tag);
    return apiResponse(result);
  }
}
