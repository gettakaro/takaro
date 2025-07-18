import { ITakaroQuery } from '@takaro/db';
import { APIOutput, apiResponse } from '@takaro/http';
import {
  RoleCreateInputDTO,
  SearchRoleInputDTO,
  RoleService,
  RoleUpdateInputDTO,
  RoleOutputDTO,
  PermissionOutputDTO,
  RoleMembersOutputDTO,
} from '../service/RoleService.js';
import { AuthenticatedRequest, AuthService } from '../service/AuthService.js';
import { Body, Get, Post, Delete, JsonController, UseBefore, Req, Put, Params, Res } from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { IsOptional, IsString, IsUUID, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ParamId } from '../lib/validators.js';
import { Response } from 'express';
import { PERMISSIONS } from '@takaro/auth';
import { AllowedFilters, AllowedSearch, PaginationParams } from './shared.js';

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

export class RoleSearchInputAllowedFilters extends AllowedFilters {
  @IsOptional()
  @IsString({ each: true })
  name!: string[];
}

export class RoleSearchInputAllowedSearch extends AllowedSearch {
  @IsOptional()
  @IsString({ each: true })
  name!: string[];
}

const roleExtendOptions = ['permissions'];
type RoleExtendOptions = (typeof roleExtendOptions)[number];

export class RoleSearchInputDTO extends ITakaroQuery<SearchRoleInputDTO> {
  @ValidateNested()
  @Type(() => RoleSearchInputAllowedFilters)
  declare filters: RoleSearchInputAllowedFilters;

  @ValidateNested()
  @Type(() => RoleSearchInputAllowedSearch)
  declare search: RoleSearchInputAllowedSearch;

  @IsOptional()
  @IsEnum(roleExtendOptions, { each: true })
  declare extend?: RoleExtendOptions[];
}

export class PermissionOutputDTOAPI extends APIOutput<PermissionOutputDTO[]> {
  @Type(() => PermissionOutputDTO)
  @ValidateNested({ each: true })
  declare data: PermissionOutputDTO[];
}

export class RoleMembersOutputDTOAPI extends APIOutput<RoleMembersOutputDTO> {
  @Type(() => RoleMembersOutputDTO)
  @ValidateNested()
  declare data: RoleMembersOutputDTO;
}

export class PaginationParamsWithGameServer extends PaginationParams {
  @IsOptional()
  @IsUUID()
  gameServerId: string;
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
  @ResponseSchema(APIOutput)
  @Delete('/role/:id')
  async remove(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new RoleService(req.domainId);
    await service.delete(params.id);
    return apiResponse();
  }

  @UseBefore(AuthService.getAuthMiddleware([]))
  @ResponseSchema(PermissionOutputDTOAPI)
  @Get('/permissions')
  async getPermissions(@Req() req: AuthenticatedRequest) {
    const roleService = new RoleService(req.domainId);
    const allPermissions = await roleService.getPermissions();
    return apiResponse(allPermissions);
  }
}
