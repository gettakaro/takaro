import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { APIOutput, apiResponse } from '@takaro/http';
import { AuthenticatedRequest, AuthService } from '../../service/AuthService.js';
import { Body, Get, Post, Delete, JsonController, UseBefore, Req, Put, Params, Res } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { Type } from 'class-transformer';
import { ParamId } from '../../lib/validators.js';
import { PERMISSIONS } from '@takaro/auth';
import { Response } from 'express';
import { errors } from '@takaro/util';
import { moduleProtectionMiddleware } from '../../middlewares/moduleProtectionMiddleware.js';
import { AllowedFilters, RangeFilterCreatedAndUpdatedAt } from '../shared.js';
import { ITakaroQuery } from '@takaro/db';
import { ModuleService } from '../../service/Module/index.js';
import { ModuleCreateAPIDTO, ModuleOutputDTO, ModuleUpdateDTO } from '../../service/Module/dto.js';

export class ModuleOutputDTOAPI extends APIOutput<ModuleOutputDTO> {
  @Type(() => ModuleOutputDTO)
  @ValidateNested()
  declare data: ModuleOutputDTO;
}

export class ModuleOutputArrayDTOAPI extends APIOutput<ModuleOutputDTO[]> {
  @ValidateNested({ each: true })
  @Type(() => ModuleOutputDTO)
  declare data: ModuleOutputDTO[];
}

class ModuleSearchInputAllowedFilters extends AllowedFilters {
  @IsOptional()
  @IsString({ each: true })
  name: string[];
  @IsOptional()
  @IsString({ each: true })
  builtin: string[];
}

class ModuleSearchInputDTO extends ITakaroQuery<ModuleSearchInputAllowedFilters> {
  @ValidateNested()
  @Type(() => ModuleSearchInputAllowedFilters)
  declare filters: ModuleSearchInputAllowedFilters;
  @ValidateNested()
  @Type(() => ModuleSearchInputAllowedFilters)
  declare search: ModuleSearchInputAllowedFilters;
  @ValidateNested()
  @Type(() => RangeFilterCreatedAndUpdatedAt)
  declare greaterThan: RangeFilterCreatedAndUpdatedAt;
  @ValidateNested()
  @Type(() => RangeFilterCreatedAndUpdatedAt)
  declare lessThan: RangeFilterCreatedAndUpdatedAt;
}

@OpenAPI({
  security: [{ domainAuth: [] }],
  tags: ['Module'],
})
@JsonController('/module')
export class ModuleController {
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_MODULES]))
  @ResponseSchema(ModuleOutputArrayDTOAPI)
  @OpenAPI({
    summary: 'Search modules',
  })
  @Post('/search')
  async search(@Req() req: AuthenticatedRequest, @Res() res: Response, @Body() query: ModuleSearchInputDTO) {
    const service = new ModuleService(req.domainId);
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

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_MODULES]))
  @ResponseSchema(ModuleOutputDTOAPI)
  @OpenAPI({
    summary: 'Get one module',
  })
  @Get('/:id')
  async getOne(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new ModuleService(req.domainId);
    return apiResponse(await service.findOne(params.id));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_MODULES]))
  @ResponseSchema(ModuleOutputDTOAPI)
  @OpenAPI({
    summary: 'Create module',
    description: 'Create a new module',
  })
  @Post('')
  async create(@Req() req: AuthenticatedRequest, @Body() data: ModuleCreateAPIDTO) {
    const service = new ModuleService(req.domainId);
    return apiResponse(await service.init(data));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_MODULES]), moduleProtectionMiddleware)
  @ResponseSchema(ModuleOutputDTOAPI)
  @OpenAPI({
    summary: 'Update a module',
    description: 'Update a module',
  })
  @Put('/:id')
  async update(@Req() req: AuthenticatedRequest, @Params() params: ParamId, @Body() data: ModuleUpdateDTO) {
    const service = new ModuleService(req.domainId);
    const mod = await service.findOne(params.id);
    if (!mod) throw new errors.NotFoundError('Module not found');
    return apiResponse(await service.update(params.id, data));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_MODULES]), moduleProtectionMiddleware)
  @ResponseSchema(APIOutput)
  @OpenAPI({
    summary: 'Remove a module',
    description: 'Removes a module, including all versions and config',
  })
  @Delete('/:id')
  async remove(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new ModuleService(req.domainId);
    const mod = await service.findOne(params.id);
    if (!mod) throw new errors.NotFoundError('Module not found');
    await service.delete(params.id);
    return apiResponse();
  }
}
