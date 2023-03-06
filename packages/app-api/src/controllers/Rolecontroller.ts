import { ITakaroQuery } from '@takaro/db';
import { APIOutput, apiResponse, PaginatedRequest } from '@takaro/http';
import {
  RoleCreateInputDTO,
  SearchRoleInputDTO,
  RoleService,
  RoleUpdateInputDTO,
  RoleOutputDTO,
  CAPABILITIES,
} from '../service/RoleService.js';
import { AuthenticatedRequest, AuthService } from '../service/AuthService.js';
import {
  Body,
  Get,
  Post,
  Delete,
  JsonController,
  UseBefore,
  Req,
  Put,
  Params,
} from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ParamId } from '../lib/validators.js';

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

@OpenAPI({
  security: [{ domainAuth: [] }],
})
@JsonController()
export class RoleController {
  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.READ_ROLES]))
  @Post('/role/search')
  @ResponseSchema(RoleOutputArrayDTOAPI)
  async search(
    @Req() req: AuthenticatedRequest & PaginatedRequest,
    @Body() query: RoleSearchInputDTO
  ) {
    const service = new RoleService(req.domainId);
    const result = await service.find({
      ...query,
      page: req.page,
      limit: req.limit,
    });
    return apiResponse(result.results, {
      meta: { page: req.page, limit: req.limit, total: result.total },
    });
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.READ_ROLES]))
  @Get('/role/:id')
  @ResponseSchema(RoleOutputDTOAPI)
  async getOne(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new RoleService(req.domainId);
    return apiResponse(await service.findOne(params.id));
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.MANAGE_ROLES]))
  @Post('/role')
  @ResponseSchema(RoleOutputDTOAPI)
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() data: RoleCreateInputDTO
  ) {
    const service = new RoleService(req.domainId);
    return apiResponse(
      await service.createWithCapabilities(data, data.capabilities)
    );
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.MANAGE_ROLES]))
  @ResponseSchema(RoleOutputDTOAPI)
  @Put('/role/:id')
  async update(
    @Req() req: AuthenticatedRequest,
    @Params() params: ParamId,
    @Body() data: RoleUpdateInputDTO
  ) {
    const service = new RoleService(req.domainId);
    await service.setCapabilities(params.id, data.capabilities);
    return apiResponse(await service.update(params.id, data));
  }

  @UseBefore(AuthService.getAuthMiddleware([CAPABILITIES.MANAGE_ROLES]))
  @ResponseSchema(APIOutput)
  @Delete('/role/:id')
  async remove(@Req() req: AuthenticatedRequest, @Params() params: ParamId) {
    const service = new RoleService(req.domainId);
    await service.delete(params.id);
    return apiResponse();
  }
}
