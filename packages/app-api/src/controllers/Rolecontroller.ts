import { ITakaroQuery } from '@takaro/db';
import { APIOutput, apiResponse } from '@takaro/http';
import {
  RoleCreateInputDTO,
  SearchRoleInputDTO,
  RoleService,
  RoleUpdateInputDTO,
  RoleOutputDTO,
  PermissionOutputDTO,
} from '../service/RoleService.js';
import { AuthenticatedRequest, AuthService } from '../service/AuthService.js';
import { Body, Get, Post, Delete, JsonController, UseBefore, Req, Put, Params, Res } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { IdUuidDTO, IdUuidDTOAPI, ParamId } from '../lib/validators.js';
import { Response } from 'express';
import { PERMISSIONS, PERMISSION_DETAILS } from '@takaro/auth';
import { ModuleService } from '../service/ModuleService.js';
export class RoleOutputDTOAPI extends APIOutput<RoleOutputDTO> {
  @Type(() => RoleOutputDTO)
  @ValidateNested()
  declare data: RoleOutputDTO;
}

export class RoleOutputArrayDTOAPI extends APIOutput<RoleOutputDTO[]> {
  @ValidateNested({ each: true })
  @Type(() => RoleOutputDTO)
  declare data: RoleOutputDTO[];
}

export class RoleSearchInputAllowedFilters {
  @IsOptional()
  @IsString()
  name!: string;
}

export class RoleSearchInputDTO extends ITakaroQuery<SearchRoleInputDTO> {
  @ValidateNested()
  @Type(() => RoleSearchInputAllowedFilters)
  declare filters: RoleSearchInputAllowedFilters;
}

export class PermissionOutputDTOAPI extends APIOutput<PermissionOutputDTO[]> {
  @Type(() => PermissionOutputDTO)
  @ValidateNested({ each: true })
  declare data: PermissionOutputDTO[];
}

@OpenAPI({
  security: [{ domainAuth: [] }],
})
@JsonController()
export class RoleController {
  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_ROLES]))
  @Post('/role/search')
  @ResponseSchema(RoleOutputArrayDTOAPI)
  async search(@Req() req: AuthenticatedRequest, @Res() res: Response, @Body() query: RoleSearchInputDTO) {
    const service = new RoleService(req.domainId);
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

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.READ_ROLES]))
  @Get('/role/:id')
  @ResponseSchema(RoleOutputDTOAPI)
  async getOne(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new RoleService(req.domainId);
    return apiResponse(await service.findOne(params.id));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_ROLES]))
  @Post('/role')
  @ResponseSchema(RoleOutputDTOAPI)
  async create(@Req() req: AuthenticatedRequest, @Body() data: RoleCreateInputDTO) {
    const service = new RoleService(req.domainId);
    return apiResponse(await service.createWithPermissions(data, data.permissions));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_ROLES]))
  @ResponseSchema(RoleOutputDTOAPI)
  @Put('/role/:id')
  async update(@Req() req: AuthenticatedRequest, @Params() params: ParamId, @Body() data: RoleUpdateInputDTO) {
    const service = new RoleService(req.domainId);
    await service.setPermissions(params.id, data.permissions);
    return apiResponse(await service.update(params.id, data));
  }

  @UseBefore(AuthService.getAuthMiddleware([PERMISSIONS.MANAGE_ROLES]))
  @ResponseSchema(IdUuidDTOAPI)
  @Delete('/role/:id')
  async remove(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new RoleService(req.domainId);
    await service.delete(params.id);
    return apiResponse(await new IdUuidDTO().construct({ id: params.id }));
  }

  @UseBefore(AuthService.getAuthMiddleware([]))
  @ResponseSchema(PermissionOutputDTOAPI)
  @Get('/permissions')
  async getPermissions(@Req() req: AuthenticatedRequest) {
    const moduleService = new ModuleService(req.domainId);
    const modules = await moduleService.find({ limit: 1000 });
    const modulePermissions = modules.results.map((mod) => mod.permissions).flat();

    const allPermissions = Object.values(PERMISSION_DETAILS).concat(modulePermissions);

    return apiResponse(allPermissions);
  }
}
